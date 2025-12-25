// ---------- app.js (updated) ----------

// ---------- Simple persistence keys ----------
const ADMIN_KEY = "tikure_admin";         // stores {user, pass}
const EMPLOYEES_KEY = "tikure_employees";// stores array of {user, pass}
const STOCK_KEY = "tikure_stock";        // stores stock numbers
const LANG_KEY = "appLanguage";

// ---------- Small DOM helper ----------
function $(id){ return document.getElementById(id); }

// ---------- Navigation history stack & helpers ----------
const navStack = [];

// helper to get currently visible screen id (or null)
function getCurrentScreenId() {
    const visible = Array.from(document.querySelectorAll(".screen")).find(s => s.style.display !== "none");
    return visible ? visible.id : null;
}

// showScreen: hides all screens and shows the requested one
// it also maintains a simple history stack for the Back button
function showScreen(id, options = { replace: false }) {
    const current = getCurrentScreenId();

    // if we are navigating to the same screen, do nothing (but update back button)
    if (current === id) {
        updateBackButtonVisibility(id);
        return;
    }

    // push current to stack unless replace is true or there is no current
    if (current && !options.replace) {
        navStack.push(current);
    }

    // hide all and show target
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    const el = $(id);
    if (el) el.style.display = "block";

    // update back button visibility and header controls
    updateBackButtonVisibility(id);
}

// goBack: pop the last screen from stack and show it
function goBack() {
    if (navStack.length === 0) {
        // nothing in history — fallback to role selection
        const current = getCurrentScreenId();
        if (current === "language-screen") return;
        showScreen("role-screen", { replace: true });
        navStack.length = 0;
        return;
    }

    const prev = navStack.pop();
    // show previous screen without pushing current into stack
    showScreen(prev, { replace: true });
}

// ---------- UPDATED: show/hide back button and header controls ----------
// User requested: Back and Logout should appear on the first page (language-screen).
// This function ensures Back is visible from the second page onward and also visible on the first page per request.
// Logout and header language select will be visible on language-screen and admin-screen.
function updateBackButtonVisibility(currentScreenId) {
    const back = $("back-btn");
    const langSelect = $("global-lang-select");
    const topLogout = $("top-logout");

    // Back button: show on all screens (including language-screen) per user's request
    if (back) {
        back.style.display = "inline-block";
    }

    // Language menu and Logout: show on language-screen and admin-screen
    const showOnScreens = ["language-screen", "admin-screen"];
    const shouldShowHeaderControls = showOnScreens.includes(currentScreenId);

    if (langSelect) {
        langSelect.style.display = shouldShowHeaderControls ? "inline-block" : "none";
    }
    if (topLogout) {
        topLogout.style.display = shouldShowHeaderControls ? "inline-block" : "none";
    }
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
        // no admin yet -> show admin setup (replace so language isn't pushed)
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
    const userEl = $("setup-admin-username");
    const passEl = $("setup-admin-password");
    const user = userEl ? userEl.value.trim() : "";
    const pass = passEl ? passEl.value.trim() : "";
    if (!user || !pass) { alert("Please enter username and password"); return; }
    localStorage.setItem(ADMIN_KEY, JSON.stringify({user, pass}));
    alert("Admin created. Please login.");
    prepareLogin("admin");
}

// ---------- Login flow ----------
let loginRole = null; // "admin" or "worker"
function prepareLogin(role){
    loginRole = role;
    if ($("login-username")) $("login-username").value = "";
    if ($("login-password")) $("login-password").value = "";
    if ($("login-title")) $("login-title").innerText = role === "admin" ? "Admin Login" : "Worker Login";
    if ($("login-hint")) $("login-hint").innerText = role === "admin" ? "" : "Enter your worker credentials";
    showScreen("login-screen");
}

function loginUser(){
    const userEl = $("login-username");
    const passEl = $("login-password");
    const user = userEl ? userEl.value.trim() : "";
    const pass = passEl ? passEl.value.trim() : "";
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
    const lang = localStorage.getItem(LANG_KEY) || "am";
    changeWorkerLanguage(lang);
    // optionally show worker name somewhere
}

// ---------- Menu functions ----------
function openMenu(){
    const menu = $("side-menu");
    const overlay = $("menu-overlay");
    if (menu) menu.classList.add("open");
    if (overlay) overlay.classList.add("show");
}

function closeMenu(){
    const menu = $("side-menu");
    const overlay = $("menu-overlay");
    if (menu) menu.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
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
    // clear navigation stack and go to role selection
    navStack.length = 0;
    showScreen("role-screen", { replace: true });
}

// ---------- Admin can create employees ----------
function createEmployee(){
    const userEl = $("new-emp-username");
    const passEl = $("new-emp-password");
    const user = userEl ? userEl.value.trim() : "";
    const pass = passEl ? passEl.value.trim() : "";
    if (!user || !pass) { alert("Enter username and password"); return; }

    let employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
    if (employees.find(e => e.user === user)) { alert("Employee username already exists"); return; }

    employees.push({user, pass});
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    if (userEl) userEl.value = "";
    if (passEl) passEl.value = "";
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
        appTitle: "ጥቁሬ"
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
        appTitle: "ጥቁሬ"
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
        appTitle: "Tikure"
    }
};
function changeDashboardLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
    const t = dashboardTranslations[lang] || dashboardTranslations["am"];

    if ($("admin-app-title")) $("admin-app-title").innerText = t.appTitle;
    if ($("admin-title")) $("admin-title").innerText = t.adminTitle;
    if ($("sell-btn")) $("sell-btn").innerText = t.sell;
    if ($("buy-btn")) $("buy-btn").innerText = t.buy;
    if ($("scanner-label")) $("scanner-label").innerText = t.scanner;
    if ($("printer-label")) $("printer-label").innerText = t.printer;
    if ($("add-btn")) $("add-btn").innerText = t.add;
    if ($("remove-btn")) $("remove-btn").innerText = t.remove;
    if ($("download-label")) $("download-label").innerText = t.download;
    if ($("export-label")) $("export-label").innerText = t.export;
    if ($("top-date")) $("top-date").innerText = t.date;

    // Also sync the dropdowns
    syncLanguageSelects(lang);
}

// Worker translations (simple reuse)
function changeWorkerLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
    const t = dashboardTranslations[lang] || dashboardTranslations["am"];
    if ($("worker-app-title")) $("worker-app-title").innerText = t.appTitle + " - Worker";
    if ($("worker-title")) $("worker-title").innerText = t.adminTitle;
    if ($("worker-scan-label")) $("worker-scan-label").innerText = t.scanner;
    if ($("worker-print-label")) $("worker-print-label").innerText = t.printer;
    if ($("worker-download-label")) $("worker-download-label").innerText = t.download;
    if ($("worker-mark-label")) $("worker-mark-label").innerText = "Mark done";
    if ($("worker-date")) $("worker-date").innerText = t.date;
    const sel = $("worker-lang-select");
    if (sel) sel.value = lang;
}

// Sync language selects
function syncLanguageSelects(lang) {
    const ids = ["global-lang-select", "menu-lang", "lang-select", "worker-lang-select"];
    ids.forEach(id => {
        const el = $(id);
        if (el) el.value = lang;
    });
}

let stockChart;

function initStockChart() {
    const stock = getSavedStock();
    // inputs may be removed from HTML; guard access
    if ($("stock-electronics")) $("stock-electronics").value = stock.electronics;
    if ($("stock-clothing")) $("stock-clothing").value = stock.clothing;
    if ($("stock-food")) $("stock-food").value = stock.food;
    if ($("stock-furniture")) $("stock-furniture").value = stock.furniture;

    const canvas = $("stockChart");
    if (!canvas) {
        updateTotalValue();
        return;
    }

    const ctx = canvas.getContext("2d");

    const data = {
        labels: ["Electronics", "Clothing", "Food", "Furniture"],
        datasets: [{
            data: [stock.electronics, stock.clothing, stock.food, stock.furniture],
            backgroundColor: ["#ff9800", "#4caf50", "#2196f3", "#9c27b0"]
        }]
    };

    if (stockChart) {
        stockChart.destroy();
    }

    if (typeof Chart !== "undefined") {
        stockChart = new Chart(ctx, {
            type: "pie",
            data: data,
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: "#ffffff"
                        }
                    }
                }
            }
        });
    }

    updateTotalValue();
}

function getSavedStock(){
    const s = JSON.parse(localStorage.getItem(STOCK_KEY) || "null");
    if (s) return s;
    const defaultStock = {electronics:8500, clothing:6200, food:4300, furniture:3450};
    localStorage.setItem(STOCK_KEY, JSON.stringify(defaultStock));
    return defaultStock;
}

function updateStockChart() {
    // inputs may be removed; guard access
    const e = $("stock-electronics") ? Number($("stock-electronics").value || 0) : 0;
    const c = $("stock-clothing") ? Number($("stock-clothing").value || 0) : 0;
    const f = $("stock-food") ? Number($("stock-food").value || 0) : 0;
    const fu = $("stock-furniture") ? Number($("stock-furniture").value || 0) : 0;

    const stock = {electronics:e, clothing:c, food:f, furniture:fu};
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));

    if (stockChart && stockChart.data && stockChart.data.datasets && stockChart.data.datasets[0]) {
        stockChart.data.datasets[0].data = [e, c, f, fu];
        stockChart.update();
    }

    updateTotalValue();
}

function updateTotalValue(){
    const stock = getSavedStock();
    const total = (stock.electronics||0) + (stock.clothing||0) + (stock.food||0) + (stock.furniture||0);
    if ($("total-value")) $("total-value").innerText = total.toLocaleString();
}

// ---------- Initialization on load ----------
window.addEventListener("load", () => {
    // show language screen by default
    showScreen("language-screen", { replace: true });

    // sync language selects
    const lang = localStorage.getItem(LANG_KEY) || "am";
    syncLanguageSelects(lang);

    // wire top logout if present
    const topLogout = $("top-logout");
    if (topLogout) topLogout.onclick = logout;

    // ensure back button visibility is correct
    updateBackButtonVisibility(getCurrentScreenId());
});




