from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

class Bank(Base):
    __tablename__ = "banks"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)       # Stores input collected from 'regFirst' visual input 
    email = Column(String)           # Stores input collected from 'regLast' visual input
    birthday = Column(String)
    account_type = Column(String)
    password = Column(String)        # Enforced and stored as a strict 4-digit numeric PIN format string
    account_number = Column(String, unique=True, index=True)
    reference_code = Column(String, unique=True)
    balance = Column(Float, default=5000.0)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)            # DEBIT or CREDIT
    sector = Column(String)          # Context category descriptions
    amount = Column(Float)
    timestamp = Column(String)
    account_id = Column(Integer, ForeignKey("banks.id"))

    account = relationship("Bank", back_populates="transactions")