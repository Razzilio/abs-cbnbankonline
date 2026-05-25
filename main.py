from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Annotated, List
from sqlalchemy.orm import Session
import random
import string
from datetime import datetime
import models
from database import engine, SessionLocal

app = FastAPI()

# Reconstruct clean database structures matching updated model schemas
models.Base.metadata.create_all(bind=engine)

# Activate CORS rules bridging communication vectors between your local port environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_16_digit_account() -> str:
    digits = "".join(random.choices(string.digits, k=16))
    return "-".join([digits[i:i+4] for i in range(0, 16, 4)])

def generate_random_reference(length=12) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# ─── INCOMING APIS PAYLOAD SCHEMAS ───
class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    birthday: str
    account_type: str
    password: str

class UserLoginRequest(BaseModel):
    account_number: str
    password: str

class RemitRequest(BaseModel):
    target_account: str
    network: str
    amount: float
    note: str = ""

class WithdrawRequest(BaseModel):
    amount: float


# ─── BANK SYSTEM CORE INTERFACES ROUTES ───

@app.post("/api/register")
async def register_account(req: UserRegisterRequest, db: db_dependency):
    acc_number = generate_16_digit_account()
    ref_code = generate_random_reference()
    
    # Assign default opening base structural balance of ₱5,000.00
    initial_deposit = 5000.00
    
    db_account = models.Bank(
        full_name=req.full_name,
        email=req.email,
        birthday=req.birthday,
        account_type=req.account_type,
        password=req.password,
        account_number=acc_number,
        reference_code=ref_code,
        balance=initial_deposit
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    
    # Save default opening balance transaction reference logs
    init_tx = models.Transaction(
        type="CREDIT",
        sector=f"Initial Deposit (Ref: {ref_code})",
        amount=initial_deposit,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        account_id=db_account.id
    )
    db.add(init_tx)
    db.commit()
    
    return {
        "account_number": acc_number,
        "full_name": db_account.full_name,
        "account_type": db_account.account_type,
        "initial_deposit": initial_deposit,
        "reference_code": ref_code
    }


@app.post("/api/login")
async def login_account(req: UserLoginRequest, db: db_dependency):
    user = db.query(models.Bank).filter(models.Bank.account_number == req.account_number).first()
    if not user or user.password != req.password:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized sign-in combination."})
    
    return {
        "account_number": user.account_number,
        "full_name": user.full_name,
        "birthday": user.birthday,
        "account_type": user.account_type,
        "balance": user.balance
    }


@app.get("/api/accounts/{account_number}/transactions")
async def get_transaction_history(account_number: str, db: db_dependency):
    user = db.query(models.Bank).filter(models.Bank.account_number == account_number).first()
    if not user:
        return JSONResponse(status_code=404, content={"detail": "Account record tracking not found."})
    
    transactions = db.query(models.Transaction).filter(models.Transaction.account_id == user.id).order_by(models.Transaction.id.desc()).all()
    
    history_logs = []
    for tx in transactions:
        history_logs.append({
            "id": tx.id,
            "type": tx.type,
            "sector": tx.sector,
            "amount": tx.amount,
            "timestamp": tx.timestamp
        })
    return history_logs


@app.post("/api/accounts/{account_number}/remit")
async def process_remittance(account_number: str, req: RemitRequest, db: db_dependency):
    sender = db.query(models.Bank).filter(models.Bank.account_number == account_number).first()
    if not sender:
        return JSONResponse(status_code=404, content={"detail": "Sender context identity invalid."})
    
    fee = 25.0 if req.network != "ABS-CBN Internal" else 0.0
    total_deduction = req.amount + fee
    
    if sender.balance < total_deduction:
        return JSONResponse(status_code=400, content={"detail": "Insufficient balance allocation thresholds."})
    
    sender.balance -= total_deduction
    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    sender_tx = models.Transaction(
        type="DEBIT",
        sector=f"Remit: {req.network} ({req.target_account})",
        amount=req.amount,
        timestamp=timestamp_str,
        account_id=sender.id
    )
    db.add(sender_tx)
    
    if fee > 0:
        fee_tx = models.Transaction(
            type="DEBIT",
            sector="Interbank Transfer Fee",
            amount=fee,
            timestamp=timestamp_str,
            account_id=sender.id
        )
        db.add(fee_tx)
        
    if req.network == "ABS-CBN Internal":
        receiver = db.query(models.Bank).filter(models.Bank.account_number == req.target_account).first()
        if receiver:
            receiver.balance += req.amount
            receiver_tx = models.Transaction(
                type="CREDIT",
                sector=f"Received via Transfer ({sender.account_number})",
                amount=req.amount,
                timestamp=timestamp_str,
                account_id=receiver.id
            )
            db.add(receiver_tx)

    db.commit()
    db.refresh(sender)
    
    return {"message": "Remittance successful", "balance": sender.balance}


@app.post("/api/accounts/{account_number}/withdraw")
async def process_withdrawal(account_number: str, req: WithdrawRequest, db: db_dependency):
    user = db.query(models.Bank).filter(models.Bank.account_number == account_number).first()
    if not user:
        return JSONResponse(status_code=404, content={"detail": "Vault mapping identity target not found."})
        
    if user.balance < req.amount:
        return JSONResponse(status_code=400, content={"detail": "Insufficient funds inside specific tier base balance."})
        
    user.balance -= req.amount
    
    tx = models.Transaction(
        type="DEBIT",
        sector="ATM Cardless Withdrawal",
        amount=req.amount,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        account_id=user.id
    )
    db.add(tx)
    db.commit()
    db.refresh(user)
    
    return {"message": "Dispensation sequence complete", "balance": user.balance}