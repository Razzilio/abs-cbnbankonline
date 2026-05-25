// Hardcoded explicit endpoint port variable target to bypass origins CORS connection errors
const API_BASE = "http://127.0.0.1:8000/docs";

let activeSession = null;
let activeNetwork = "ABS-CBN Internal";
let activeLoanRate = 0.05;
let activeLoanCategory = "Personal Credit";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("topbarDate").textContent = new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
});

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function activateSection(sectionId, element) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
    
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`view-${sectionId}`).classList.add('active');
    
    document.getElementById("pageTitle").textContent = sectionId.toUpperCase() + " CONSOLE";
    closeSidebar();
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("active");
}

function updateUploadLabel(input) {
    const filename = input.files[0]?.name || "Click or Drag document file here";
    document.getElementById("uploadText").textContent = filename;
}

// ─── INTEGRATED REAL-TIME DYNAMIC ASSIGNED SUCCESS MODAL ───
function showAccountCreationModal(accountNumber, fullName, accountType, initialDeposit, referenceCode) {
    const modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.inset = "0";
    modalOverlay.style.backgroundColor = "rgba(11, 31, 75, 0.75)";
    modalOverlay.style.backdropFilter = "blur(6px)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.zIndex = "9999";
    modalOverlay.style.animation = "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)";

    const modalContainer = document.createElement("div");
    modalContainer.style.background = "#FFFFFF";
    modalContainer.style.width = "100%";
    modalContainer.style.maxWidth = "460px";
    modalContainer.style.borderRadius = "16px";
    modalContainer.style.padding = "32px";
    modalContainer.style.boxShadow = "0 20px 50px rgba(0, 0, 0, 0.3)";
    modalContainer.style.textAlign = "center";
    modalContainer.style.fontFamily = "'DM Sans', sans-serif";

    modalContainer.innerHTML = `
        <div style="width: 64px; height: 64px; background: #EDE8FE; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 20px auto;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C55F3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h3 style="color: #0B1F4B; font-size: 1.5rem; margin: 0 0 8px 0; font-family: 'Playfair Display', serif; font-weight: 700;">Account Activated</h3>
        <p style="color: #6B7280; font-size: 0.9rem; margin: 0 0 24px 0;">Welcome to ABS-CBN Online Banking family, ${fullName}!</p>
        
        <div style="background: #F4F7FE; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px; border: 1px solid #D6DCF0;">
            <div style="margin-bottom: 12px;">
                <span style="font-size: 0.75rem; color: #8B94B8; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Your Account Number</span>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                    <strong id="modalAccNum" style="font-size: 1.3rem; color: #1A5CDB; font-family: monospace; letter-spacing: 1px;">${accountNumber}</strong>
                    <button id="modalCopyBtn" style="background: #1A5CDB; color: white; border: none; padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; cursor: pointer; width: auto; font-weight: 500;">Copy</button>
                </div>
            </div>
            <div style="margin-bottom: 12px; border-top: 1px dashed #D6DCF0; padding-top: 12px;">
                <span style="font-size: 0.7rem; color: #8B94B8; text-transform: uppercase;">System Reference Code</span>
                <strong style="display: block; font-size: 1rem; color: #1E2749; font-family: monospace; margin-top: 2px;">${referenceCode}</strong>
            </div>
            <div style="border-top: 1px dashed #D6DCF0; padding-top: 12px; display: flex; justify-content: space-between;">
                <div>
                    <span style="font-size: 0.7rem; color: #8B94B8; text-transform: uppercase;">Vault Tier</span>
                    <strong style="display: block; font-size: 0.85rem; color: #1E2749; margin-top: 2px;">${accountType}</strong>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.7rem; color: #8B94B8; text-transform: uppercase;">Opening Balance</span>
                    <strong style="display: block; font-size: 0.85rem; color: #0FA888; margin-top: 2px;">₱${initialDeposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
            </div>
        </div>

        <button id="modalCloseBtn" style="background: #0B1F4B; color: white; border: none; width: 100%; padding: 14px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background 0.2s;">Proceed to Secure Login</button>
    `;

    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    modalContainer.querySelector("#modalCopyBtn").addEventListener("click", () => {
        navigator.clipboard.writeText(accountNumber);
        const btn = modalContainer.querySelector("#modalCopyBtn");
        btn.textContent = "Copied!";
        btn.style.background = "#0FA888";
        setTimeout(() => {
            btn.textContent = "Copy";
            btn.style.background = "#1A5CDB";
        }, 2000);
    });

    modalContainer.querySelector("#modalCloseBtn").addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
        document.getElementById("loginUsername").value = accountNumber;
        switchPage('page-login');
    });
}

// ─── AUTH INTERFACES CONTROLLERS MAPPED TRANSPARENTLY TO ORIGINAL HARDCODED IDS ───
async function handleRegister() {
    const regFirstElem = document.getElementById("regFirst");
    const regLastElem = document.getElementById("regLast");
    const regBirthdayElem = document.getElementById("regBirthday");
    const regTypeElem = document.getElementById("regType");
    const regPasswordElem = document.getElementById("regPassword");

    if (!regFirstElem || !regLastElem || !regBirthdayElem || !regTypeElem || !regPasswordElem) {
        alert("Configuration Error: Input node binding components are missing from the current page layout context.");
        return;
    }

    // Remap values directly across the functional boundary
    const full_name = regFirstElem.value.trim(); // Captured from first name slot
    const email = regLastElem.value.trim();     // Captured from last name slot
    const birthday = regBirthdayElem.value;
    const account_type = regTypeElem.value;
    const password = regPasswordElem.value;       

    if (!full_name) { alert("Please fill out your Full Name inside the First Name field."); return; }
    if (!email) { alert("Please fill out your Email Address inside the Last Name field."); return; }
    if (!birthday) { alert("Please select your Date of Birth."); return; }
    if (!password) { alert("Please assign a security login PIN."); return; }

    // Enforce strict 4-digit code length criteria requirement rule 
    const pinPattern = /^\d{4}$/;
    if (!pinPattern.test(password)) {
        alert("Security Requirement Violation: Your transaction PIN password sequence must be exactly 4 numeric characters long (e.g., 4321).");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, birthday, account_type, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            regFirstElem.value = "";
            regLastElem.value = "";
            regBirthdayElem.value = "";
            regPasswordElem.value = "";
            
            showAccountCreationModal(data.account_number, full_name, account_type, data.initial_deposit, data.reference_code);
        } else {
            alert(data.detail || "Registration processing pipeline failure.");
        }
    } catch (e) { 
        alert("Network Error: Connectivity connection failure to core FastAPI servers on port 8000."); 
    }
}

async function handleLogin() {
    const account_number = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_number, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            activeSession = data;
            syncDashboardMetrics();
            switchPage('page-dashboard');
        } else {
            alert(data.detail || "Unauthorized validation credentials combination provided.");
        }
    } catch (e) { alert("Data synchronization interface connection currently offline."); }
}

function syncDashboardMetrics() {
    const fullName = activeSession.full_name;
    const initial = activeSession.full_name[0].toUpperCase();
    const formattedBalance = `₱${activeSession.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    document.getElementById("userDisplay").textContent = fullName;
    document.getElementById("dashGreeting").textContent = fullName.split(" ")[0];
    document.getElementById("avatarInitial").textContent = initial;
    document.getElementById("avatarInitial2").textContent = initial;
    document.getElementById("dashBalance").textContent = formattedBalance;
    document.getElementById("auditBalance").textContent = formattedBalance;
    document.getElementById("dashAccNum").textContent = activeSession.account_number;
    document.getElementById("dashType").textContent = activeSession.account_type;

    const baseYield = activeSession.balance * 0.045 / 12;
    document.getElementById("statYield").textContent = `₱${baseYield.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

    document.getElementById("profAvatar").textContent = initial;
    document.getElementById("profName").textContent = fullName;
    document.getElementById("profAccNum").textContent = activeSession.account_number;
    document.getElementById("profType").textContent = activeSession.account_type;
    document.getElementById("profSub").textContent = `Birthdate: ${activeSession.birthday} | Kapamilya Member`;

    reloadLedgerLog();
}

async function reloadLedgerLog() {
    try {
        const res = await fetch(`${API_BASE}/api/accounts/${activeSession.account_number}/transactions`);
        const history = await res.json();
        
        const dashTxList = document.getElementById("dashTxList");
        dashTxList.innerHTML = "";
        history.slice(0, 4).forEach(tx => {
            const li = document.createElement("li");
            li.className = "tx-item";
            li.innerHTML = `
                <div class="tx-item-left">
                    <div class="tx-item-title">${tx.sector}</div>
                    <div class="tx-item-date">${tx.timestamp}</div>
                </div>
                <div class="tx-item-amount ${tx.type === 'CREDIT' ? 'up' : 'down'}">
                    ${tx.type === 'CREDIT' ? '+' : '-'} ₱${tx.amount.toLocaleString()}
                </div>
            `;
            dashTxList.appendChild(li);
        });

        const mainTable = document.getElementById("historyTableBody");
        mainTable.innerHTML = "";
        history.forEach(tx => {
            const row = document.createElement("tr");
            row.style.borderBottom = "1px solid var(--gray-100)";
            row.innerHTML = `
                <td style="padding:12px 8px; color:var(--gray-400);">${tx.timestamp}</td>
                <td style="padding:12px 8px; font-weight:500;">${tx.sector}</td>
                <td style="padding:12px 8px;"><span class="badge">${tx.type}</span></td>
                <td style="padding:12px 8px; text-align:right; font-weight:600; color:${tx.type === 'CREDIT' ? 'var(--teal)' : 'var(--red)'}">
                    ${tx.type === 'CREDIT' ? '+' : '-'} ₱${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
            `;
            mainTable.appendChild(row);
        });
    } catch (e) { console.error("Error updates querying history records ledger logs profiles.", e); }
}

function selectBankChip(element, bankName) {
    document.querySelectorAll('.bank-chip').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    activeNetwork = bankName;
    updateTransferSummary();
}

function setTransAmount(val) {
    const input = document.getElementById("transAmount");
    input.value = (parseFloat(input.value) || 0) + val;
    updateTransferSummary();
}

function updateTransferSummary() {
    const amount = parseFloat(document.getElementById("transAmount").value) || 0;
    const targetAcc = document.getElementById("transAccNum").value || "-- --";
    const fee = activeNetwork !== "ABS-CBN Internal" ? 25.00 : 0.00;
    const total = amount > 0 ? amount + fee : 0;

    document.getElementById("sideBank").textContent = activeNetwork;
    document.getElementById("sideAcc").textContent = targetAcc;
    document.getElementById("sideSub").textContent = `₱${amount.toLocaleString()}`;
    document.getElementById("sideFee").textContent = `₱${fee.toLocaleString()}`;
    document.getElementById("sideTotal").textContent = `₱${total.toLocaleString()}`;

    document.getElementById("reviewAmount").textContent = `₱${amount.toLocaleString()}`;
    document.getElementById("reviewBank").textContent = activeNetwork;
    document.getElementById("reviewAcc").textContent = targetAcc;
}

function proceedTransferStep(step) {
    document.getElementById("transPane1").style.display = step === 1 ? "block" : "none";
    document.getElementById("transPane2").style.display = step === 2 ? "block" : "none";
    document.getElementById("transPane3").style.display = step === 3 ? "block" : "none";

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`tStep${step}`).classList.add('active');
    updateTransferSummary();
}

async function executeRemittance() {
    const target_account = document.getElementById("transAccNum").value;
    const amount = parseFloat(document.getElementById("transAmount").value);
    const note = document.getElementById("transNote").value;

    if (!target_account || isNaN(amount) || amount <= 0) {
        alert("Enter valid target beneficiary allocation details.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/accounts/${activeSession.account_number}/remit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_account, network: activeNetwork, amount, note })
        });
        const data = await res.json();
        
        if (res.ok) {
            alert("Remittance manifest authorized and processed successfully!");
            activeSession.balance = data.balance;
            syncDashboardMetrics();
            proceedTransferStep(1);
            activateSection('overview', document.querySelector('.nav-item'));
        } else {
            alert(data.detail);
        }
    } catch (e) { alert("Pipeline interface verification transfer routing fault."); }
}

function setWithdrawVal(val) {
    document.getElementById("txtWithdrawCustom").value = val;
}

async function executeAtmWithdrawal() {
    const amount = parseFloat(document.getElementById("txtWithdrawCustom").value);
    if (isNaN(amount) || amount <= 0) {
        alert("Specify valid cash extraction volumes.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/accounts/${activeSession.account_number}/remit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_account, network: activeNetwork, amount, note })
        });
        const data = await res.json();
        
        if (res.ok) {
            alert(`Dispenser cleared! ₱${amount.toLocaleString()} dispensed successfully.`);
            activeSession.balance = data.balance;
            syncDashboardMetrics();
            document.getElementById("txtWithdrawCustom").value = "";
            activateSection('overview', document.querySelector('.nav-item'));
        } else {
            alert(data.detail);
        }
    } catch(e) { alert("Dispenser terminal terminal error connection failure."); }
}

function selectLoanType(element, rate, category) {
    document.querySelectorAll('.loan-type').forEach(t => t.classList.remove('selected'));
    element.classList.add('selected');
    activeLoanRate = rate;
    activeLoanCategory = category;
    calculateLoanSystem();
}

function calculateLoanSystem() {
    const principal = parseFloat(document.getElementById("rngPrincipal").value);
    const months = parseInt(document.getElementById("rngMonths").value);

    document.getElementById("lblLoanPrincipal").textContent = `₱${principal.toLocaleString()}`;
    document.getElementById("lblLoanMonths").textContent = `${months} Months`;

    const totalInterest = principal * activeLoanRate * (months / 12);
    const grossBurden = principal + totalInterest;
    const monthlyAmortization = grossBurden / months;

    document.getElementById("breakdownMonthly").textContent = `₱${monthlyAmortization.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    document.getElementById("breakdownCat").textContent = activeLoanCategory;
    document.getElementById("breakdownRate").textContent = `${(activeLoanRate * 100).toFixed(1)}%`;
    document.getElementById("breakdownInterest").textContent = `₱${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function submitLoanApplication() {
    alert("Electronic Loan Request filed! Our banking verification team will review your credit history criteria within 3 business days.");
}

function triggerQuickAction(id) {
    const navButton = Array.from(document.querySelectorAll('.nav-item')).find(btn => btn.textContent.toLowerCase().includes(id));
    activateSection(id, navButton);
}

function filterHistoryLedger(vector, element) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    
    const rows = document.querySelectorAll("#historyTableBody tr");
    rows.forEach(row => {
        const typeBadge = row.querySelector('.badge').textContent.trim();
        if (vector === "ALL" || typeBadge === vector) {
            row.style.display = "table-row";
        } else {
            row.style.display = "none";
        }
    });
}

function handleLogout() {
    activeSession = null;
    switchPage('page-login');
}
