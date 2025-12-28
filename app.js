// =============================
// Tikure App — Full JS Logic
// =============================

// ======= GLOBAL VARIABLES =======
let navStack = [];
let currentUser = "";
let inboundData = {};
let inboundCount = 0;

// ======= NAVIGATION =======
function showScreen(id) {
    document.querySelectorAll(".screen,.step-screen").forEach(s => s.style.display = "none");
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
    navStack.push(id);
}

function goBack() {
    navStack.pop();
    showScreen(navStack.pop() || "language-screen");
}

function logout() {
    navStack = [];
    showScreen("language-screen");
}

// ======= CLOCK =======
setInterval(() => {
    const c = document.getElementById("clock");
    if (c) c.textContent = new Date().toLocaleTimeString();
}, 1000);

// ======= INIT DEFAULTS =======
function initDefaults() {
    if (!localStorage.getItem("suppliers")) localStorage.setItem("suppliers", JSON.stringify(["Supplier A","Supplier B"]));
    if (!localStorage.getItem("categories")) localStorage.setItem("categories", JSON.stringify(["Category 1","Category 2"]));
    if (!localStorage.getItem("units")) localStorage.setItem("units", JSON.stringify(["Unit 1","Unit 2"]));
    if (!localStorage.getItem("stock")) localStorage.setItem("stock", JSON.stringify([]));
    if (!localStorage.getItem("outbound")) localStorage.setItem("outbound", JSON.stringify([]));
    if (!localStorage.getItem("store")) localStorage.setItem("store", JSON.stringify([]));
}

// ======= LANGUAGE & ROLE =======
function setLanguage(lang) {
    showScreen("role-screen");
}

function chooseAdmin() {
    currentUser = "Admin";
    showScreen("login-screen");
}

function chooseWorker() {
    currentUser = "Worker";
    showScreen("login-screen");
}

function loginUser() {
    const user = document.getElementById("login-username").value.trim();
    const pass = document.getElementById("login-password").value.trim();
    if (!user || !pass) { alert("Enter username and password"); return; }
    // For simplicity, allow any login
    showScreen(currentUser === "Admin" ? "admin-screen" : "worker-screen");
}

// =============================
// INBOUND FLOW
// =============================
function startInbound() {
    inboundData = {};
    inboundCount = 0;
    showSuppliers();
}

function showSuppliers() {
    const container = document.getElementById("supplier-list");
    container.innerHTML = "";
    const suppliers = JSON.parse(localStorage.getItem("suppliers") || "[]");
    suppliers.forEach(s => {
        const btn = document.createElement("button");
        btn.textContent = s;
        btn.onclick = () => { inboundData.supplier = s; showScreen("inbound-step2"); };
        container.appendChild(btn);
    });
    showScreen("inbound-step1");
}

function addSupplier() {
    const s = prompt("Enter Supplier Name");
    if (!s) return;
    const arr = JSON.parse(localStorage.getItem("suppliers") || "[]");
    arr.push(s);
    localStorage.setItem("suppliers", JSON.stringify(arr));
    showSuppliers();
}

// Step 2: Type
function selectType(t) {
    inboundData.type = t;
    showCategories();
}

// Step 3: Category
function showCategories() {
    const container = document.getElementById("category-list");
    container.innerHTML = "";
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    categories.forEach(c => {
        const btn = document.createElement("button");
        btn.textContent = c;
        btn.onclick = () => { inboundData.category = c; showUnits(); };
        container.appendChild(btn);
    });
    showScreen("inbound-step3");
}

function addCategory() {
    const c = prompt("Enter Category");
    if (!c) return;
    const arr = JSON.parse(localStorage.getItem("categories") || "[]");
    arr.push(c);
    localStorage.setItem("categories", JSON.stringify(arr));
    showCategories();
}

// Step 4: Unit
function showUnits() {
    const container = document.getElementById("unit-list");
    container.innerHTML = "";
    const units = JSON.parse(localStorage.getItem("units") || "[]");
    units.forEach(u => {
        const btn = document.createElement("button");
        btn.textContent = u;
        btn.onclick = () => { inboundData.unit = u; startScan(); };
        container.appendChild(btn);
    });
    showScreen("inbound-step4");
}

function addUnit() {
    const u = prompt("Enter Unit");
    if (!u) return;
    const arr = JSON.parse(localStorage.getItem("units") || "[]");
    arr.push(u);
    localStorage.setItem("units", JSON.stringify(arr));
    showUnits();
}

// Step 5: Scan
function startScan() {
    inboundCount = 0;
    document.getElementById("scan-count").textContent = inboundCount;
    document.getElementById("scan-info").textContent = "Ready to scan...";
    showScreen("inbound-step5");

    const scanner = document.getElementById("scanner-input");
    scanner.value = "";
    scanner.focus();

    scanner.onkeydown = (e) => {
        if (e.key === "Enter") {
            const code = scanner.value.trim();
            scanner.value = "";
            if (!code) return;
            saveInbound(code); // update count immediately
        }
    };
}

function saveInbound(code) {
    const stock = JSON.parse(localStorage.getItem("stock") || "[]");
    const store = JSON.parse(localStorage.getItem("store") || "[]");

    const item = {
        ...inboundData,
        code,
        user: currentUser,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    stock.push(item);
    store.push(item);

    localStorage.setItem("stock", JSON.stringify(stock));
    localStorage.setItem("store", JSON.stringify(store));

    inboundCount++;
    document.getElementById("scan-count").textContent = inboundCount;
    document.getElementById("scan-info").textContent = `Scanned ${inboundCount} items`;
}

function restartInboundScan() {
    inboundCount = 0;
    document.getElementById("scan-count").textContent = inboundCount;
    document.getElementById("scan-info").textContent = "Ready to scan...";
}

// Finish inbound
function finishInbound() {
    alert("Inbound complete: " + inboundCount + " items");
    showScreen(currentUser === "Admin" ? "admin-screen" : "worker-screen");
}

// =============================
// OUTBOUND FLOW
// =============================
function startOutbound() {
    showScreen("outbound-screen");
    renderOutbound();
}

function addClient() {
    alert("Add Client placeholder");
}

function renderOutbound() {
    const table = document.getElementById("outbound-table");
    table.innerHTML = "<tr><th>Barcode</th><th>User</th><th>Date</th></tr>";
    const outbound = JSON.parse(localStorage.getItem("outbound") || "[]");
    outbound.forEach(item => {
        table.innerHTML += `<tr><td>${item.code}</td><td>${item.user}</td><td>${item.date}</td></tr>`;
    });
}

function exportOutbound() {
    exportToExcel(JSON.parse(localStorage.getItem("outbound") || "[]"), "Outbound_Report");
}

// =============================
// STORE SUMMARY
// =============================
function openStore() {
    showScreen("store-screen");
    renderStore();
}

function renderStore() {
    const table = document.getElementById("store-table");
    table.innerHTML = "<tr><th>Staff</th><th>Qty</th><th>Category</th></tr>";
    const store = JSON.parse(localStorage.getItem("store") || "[]");
    const summary = {};
    store.forEach(i => {
        const key = i.user + "|" + i.category;
        summary[key] = (summary[key] || 0) + 1;
    });
    for (const k in summary) {
        const [user, cat] = k.split("|");
        table.innerHTML += `<tr><td>${user}</td><td>${summary[k]}</td><td>${cat}</td></tr>`;
    }
}

function exportStore() {
    exportToExcel(JSON.parse(localStorage.getItem("store") || "[]"), "Store_Report");
}

// =============================
// SELL & RECEIPT
// =============================
function openSell() {
    showScreen("sell-screen");
    const receipt = document.getElementById("receipt");
    const stock = JSON.parse(localStorage.getItem("stock") || "[]");
    let html = "<table><tr><th>Code</th><th>Category</th><th>Unit</th><th>Date</th></tr>";
    stock.forEach(i => { html += `<tr><td>${i.code}</td><td>${i.category}</td><td>${i.unit}</td><td>${i.date}</td></tr>`; });
    html += "</table>";
    receipt.innerHTML = html;
}

function printReceipt() {
    window.print();
}

// =============================
// ANALYTICS
// =============================
function openAnalytics() {
    showScreen("analytics-screen");
    renderAnalytics();
}

function renderAnalytics() {
    const stock = JSON.parse(localStorage.getItem("stock") || "[]");
    const outbound = JSON.parse(localStorage.getItem("outbound") || "[]");
    const store = JSON.parse(localStorage.getItem("store") || "[]");
    document.getElementById("an-inbound").textContent = stock.length;
    document.getElementById("an-outbound").textContent = outbound.length;
    document.getElementById("an-store").textContent = store.length;

    const t = document.getElementById("category-table");
    t.innerHTML = "<tr><th>Category</th><th>Qty</th></tr>";
    const cats = {};
    stock.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; });
    for (const c in cats) t.innerHTML += `<tr><td>${c}</td><td>${cats[c]}</td></tr>`;
}

function exportAnalytics() {
    exportToExcel(JSON.parse(localStorage.getItem("stock") || "[]"), "Analytics_Report");
}

// =============================
// EXCEL EXPORT
// =============================
function exportToExcel(data, filename) {
    if (!data || !data.length) { alert("No data to export"); return; }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename + ".xlsx");
}

// =============================
// INIT APP
// =============================
window.addEventListener("DOMContentLoaded", () => {
    initDefaults();
    showScreen("language-screen");
});
