// ---------- Simple persistence keys ----------
const ADMIN_KEY = "tikure_admin";        // stores {user, pass}
const EMPLOYEES_KEY = "tikure_employees"; // stores array of {user, pass}
const STOCK_KEY = "tikure_stock";        // stores stock numbers
const LANG_KEY = "appLanguage";

// ---------- Utility ----------
function $(id){ return document.getElementById(id); }
function showScreen(id){
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    const el = $(id);
    if (el) el.style.display = "block";
}

// ---------- Language + initial flow ----------
function setLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
    // After language selection, go to role selection
    showScreen("role-screen");
}

function chooseAdmin(){
    const admin = JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
    if (!admin) {
        // no admin yet -> show admin setup
        showScreen("admin-setup-screen");
    } else {
        // show admin login
        prepareLogin("admin");
    }
}

function chooseWorker(){
    // show worker login
    prepareLogin("worker");
}

// ---------- Admin setup (first run) ----------
function createInitialAdmin(){
    const user = $("setup-admin-username").value.trim();
    const pass = $("setup-admin-password").value.trim();
    if (!user || !pass) { alert("Please enter username and password"); return; }
    localStorage.setItem(ADMIN_KEY, JSON.stringify({user, pass}));
    alert("Admin created. Please login.");
    prepareLogin("admin");
}

// ---------- Login flow ----------
let loginRole = null; // "admin" or "worker"
function prepareLogin(role){
    loginRole = role;
    $("login-username").value = "";
    $("login-password").value = "";
    $("login-title").innerText = role === "admin" ? "Admin Login" : "Worker Login";
    $("login-hint").innerText = role === "admin" ? "" : "Enter your worker credentials";
    showScreen("login-screen");
}

function loginUser(){
    const user = $("login-username").value.trim();
    const pass = $("login-password").value.trim();
    if (!user || !pass) { alert("Please fill all fields"); return; }

    if (loginRole === "admin") {
        const admin = JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
        if (!admin) { alert("No admin found. Create admin first."); showScreen("admin-setup-screen"); return; }
        if (admin.user === user && admin.pass === pass) {
            // success
            openAdminAfterLogin();
        } else {
            alert("Invalid admin credentials");
        }
    } else {
        // worker login
        const employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
        const found = employees.find(e => e.user === user && e.pass === pass);
        if (found) {
            openWorkerAfterLogin(found.user);
        } else {
            alert("Invalid worker credentials");
        }
    }
}

// ---------- After login navigation ----------
function openAdminAfterLogin(){
    showScreen("admin-screen");
    const lang = localStorage.getItem(LANG_KEY) || "am";
    changeDashboardLanguage(lang);
    initStockChart();
    renderEmployeeList();
}

function openWorkerAfterLogin(username){
    showScreen("worker-screen");
    // worker-specific init
    const lang = localStorage.getItem(LANG_KEY) || "am";
    changeWorkerLanguage(lang);
    // optionally show worker name somewhere
}

// ---------- Menu functions ----------
function openMenu(){
    $("side-menu").classList.add("open");
    $("menu-overlay").classList.add("show");
}

function closeMenu(){
    $("side-menu").classList.remove("open");
    $("menu-overlay").classList.remove("show");
}

function openAdminFromMenu(){
    closeMenu();
    showScreen("admin-screen");
    initStockChart();
    renderEmployeeList();
}

function openWorkerFromMenu(){
    closeMenu();
    showScreen("worker-screen");
}

function logout(){
    closeMenu();
    showScreen("role-screen");
}

// ---------- Admin can create employees ----------
function createEmployee(){
    const user = $("new-emp-username").value.trim();
    const pass = $("new-emp-password").value.trim();
    if (!user || !pass) { alert("Enter username and password"); return; }

    let employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
    if (employees.find(e => e.user === user)) { alert("Employee username already exists"); return; }

    employees.push({user, pass});
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    $("new-emp-username").value = "";
    $("new-emp-password").value = "";
    renderEmployeeList();
}

function renderEmployeeList(){
    const employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
    const container = $("employee-list");
    if (!container) return;
    if (employees.length === 0) {
        container.innerHTML = "<em>No employees yet</em>";
        return;
    }
    container.innerHTML = "";
    employees.forEach((e, i) => {
        const div = document.createElement("div");
        div.style.padding = "6px 0";
        div.style.borderBottom = "1px solid #333";
        div.innerHTML = `<strong>${e.user}</strong> <button style="float:right" onclick="removeEmployee(${i})">Remove</button>`;
        container.appendChild(div);
    });
}

function removeEmployee(index){
    let employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
    if (!employees[index]) return;
    if (!confirm(`Remove employee ${employees[index].user}?`)) return;
    employees.splice(index,1);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    renderEmployeeList();
}

// ---------- Dashboard translations ----------
const dashboardTranslations = {
    am: {
        adminTitle: "የእርምራ ለመመልከት ቁጥር",
        sell: "ሽያጭ",
        buy: "ግዢ",
        scanner: "ስካነር",
        printer: "ንብረት ማታቀስ",
        add: "➕ አን መጨመሪያ",
        remove: "➖ አመል አውልቃል",
        download: "ውሂብ አውርድ",
        export: "ውሂብ ላክ",
        date: "Tue. Apr 30",
        appTitle: "ጥቁሬ",
        employeesTitle: "ሠራተኞች"
    },
    om: {
        adminTitle: "Lakkoofsa Qabeenyaa Guyyaa",
        sell: "Gurguri",
        buy: "Bitii",
        scanner: "Skanneer",
        printer: "Maxxansa",
        add: "➕ Lakkoofsa dabali",
        remove: "➖ Lakkoofsa hir'isi",
        download: "Odeeffannoo buusi",
        export: "Odeeffannoo ergi",
        date: "Tal. Ebla 30",
        appTitle: "ጥቁሬ",
        employeesTitle: "Hojjettoota"
    },
    en: {
        adminTitle: "Daily stock value",
        sell: "Sell",
        buy: "Buy",
        scanner: "Scanner",
        printer: "Printer",
        add: "➕ Add quantity",
        remove: "➖ Remove quantity",
        download: "Download data",
        export: "Export data",
        date: "Tue. Apr 30",
        appTitle: "Tikure",
        employeesTitle: "Employees"
    }
};

function changeDashboardLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
    const t = dashboardTranslations[lang] || dashboardTranslations["am"];

    $("admin-app-title").innerText = t.appTitle;
    $("admin-title").innerText = t.adminTitle;
    $("sell-btn").innerText = t.sell;
    $("buy-btn").innerText = t.buy;
    $("scanner-label").innerText = t.scanner;
    $("printer-label").innerText = t.printer;
    $("add-btn").innerText = t.add + ": 350";
    $("remove-btn").innerText = t.remove + ": 350";
    $("download-label").innerText = t.download;
    $("export-label").innerText = t.export;
    $("top-date").innerText = t.date;

    // menu language select sync
    const sel = $("lang-select");
    if (sel) sel.value = lang;
    const menuSel = $("menu-lang");
    if (menuSel) menuSel.value = lang;
}

// Worker translations (simple reuse)
function changeWorkerLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
    const t = dashboardTranslations[lang] || dashboardTranslations["am"];
    $("worker-app-title").innerText = t.appTitle + " - Worker";
    $("worker-title").innerText = t.adminTitle;
    $("worker-scan-label").innerText = t.scanner;
    $("worker-print-label").innerText = t.printer;
    $("worker-download-label").innerText = t.download;
    $("worker-mark-label").innerText = "Mark done";
    $("worker-date").innerText = t.date;
    const sel = $("worker-lang-select");
    if (sel) sel.value = lang;
}

// ---------- Stock chart (Chart.js) ----------
let stockChart = null;

function getSavedStock(){
    const s = JSON.parse(localStorage.getItem(STOCK_KEY) || "null");
    if (s) return s;
    const defaultStock = {electronics:8500, clothing:6200, food:4300, furniture:3450};
    localStorage.setItem(STOCK_KEY, JSON.stringify(defaultStock));
    return defaultStock;
}

function initStockChart(){
    const stock = getSavedStock();
    $("stock-electronics").value = stock.electronics;
    $("stock-clothing").value = stock.clothing;
    $("stock-food").value = stock.food;
    $("stock-furniture").value = stock.furniture;

    const ctx = $("stockChart").getContext("2d");
    const data = {
        labels: ["Electronics","Clothing","Food","Furniture"],
        datasets: [{
            data: [stock.electronics, stock.clothing, stock.food, stock.furniture],
            backgroundColor: ["#ff9800","#4caf50","#2196f3","#9c27b0"]
        }]
    };

    if (stockChart) stockChart.destroy();
    stockChart = new Chart(ctx, {
        type: "pie",
        data,
        options: {
            plugins: {
                legend: { labels: { color: "#ffffff" } },
                tooltip: { enabled: true }
            }
        }
    });

    updateTotalValue();
}

function updateStockChart(){
    const e = Number($("stock-electronics").value || 0);
    const c = Number($("stock-clothing").value || 0);
    const f = Number($("stock-food").value || 0);
    const fu = Number($("stock-furniture").value || 0);

    const stock = {electronics:e, clothing:c, food:f, furniture:fu};
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));

    if (!stockChart) initStockChart();
    stockChart.data.datasets[0].data = [e,c,f,fu];
    stockChart.update();
    updateTotalValue();
}

function updateTotalValue(){
    const stock = getSavedStock();
    const total = stock.electronics + stock.clothing + stock.food + stock.furniture;
    $("total-value").innerText = total.toLocaleString();
}

// ---------- Initialization on load ----------
window.addEventListener("load", () => {
    // show language screen by default
    showScreen("language-screen");

    // ensure logo exists (user should replace logo.png)
    // sync language selects
    const lang = localStorage.getItem(LANG_KEY) || "am";
    const sel = $("lang-select");
    if (sel) sel.value = lang;
    const menuSel = $("menu-lang");
    if (menuSel) menuSel.value = lang;
    const workerSel = $("worker-lang-select");
    if (workerSel) workerSel.value = lang;
});
