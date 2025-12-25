// ---------- app.js (updated for your HTML/CSS) ----------

// Persistence keys
const ADMIN_KEY = "tikure_admin";
const EMPLOYEES_KEY = "tikure_employees";
const STOCK_KEY = "tikure_stock";
const LANG_KEY = "appLanguage";

// Short DOM helper
function $(id) { return document.getElementById(id); }

// Navigation history stack
const navStack = [];

// Get current visible screen id
function getCurrentScreenId() {
    const visible = Array.from(document.querySelectorAll(".screen")).find(s => s.style.display !== "none");
    return visible ? visible.id : null;
}

// Show a screen and manage history
function showScreen(id, options = { replace: false }) {
    const current = getCurrentScreenId();

    if (current === id) {
        updateBackButtonVisibility(id);
        return;
    }

    if (current && !options.replace) {
        navStack.push(current);
    }

    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    const el = $(id);
    if (el) el.style.display = "block";

    updateBackButtonVisibility(id);
}

// Back navigation
function goBack() {
    if (navStack.length === 0) {
        const current = getCurrentScreenId();
        if (current === "language-screen") return;
        showScreen("role-screen", { replace: true });
        navStack.length = 0;
        return;
    }
    const prev = navStack.pop();
    showScreen(prev, { replace: true });
}

// Show/hide back button (hidden on language screen)
function updateBackButtonVisibility(currentScreenId) {
    const back = $("back-btn");
    if (!back) return;
    if (!currentScreenId || currentScreenId === "language-screen") {
        back.style.display = "none";
    } else {
        back.style.display = "inline-block";
    }
}

// Set language from language chooser (first screen)
function setLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
    // After choosing language, go to role selection
    showScreen("role-screen");
    syncLanguageSelects(lang);
}

// Role selection
function chooseAdmin() {
    const admin = JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
    if (!admin) {
        showScreen("admin-setup-screen");
    } else {
        prepareLogin("admin");
    }
}

function chooseWorker() {
    prepareLogin("worker");
}

// Create initial admin (first run)
function createInitialAdmin() {
    const user = ($("setup-admin-username") || {}).value || "";
    const pass = ($("setup-admin-password") || {}).value || "";
    if (!user.trim() || !pass.trim()) { alert("Please enter username and password"); return; }
    localStorage.setItem(ADMIN_KEY, JSON.stringify({ user: user.trim(), pass: pass.trim() }));
    alert("Admin created. Please login.");
    prepareLogin("admin");
}

// Login flow
let loginRole = null;
function prepareLogin(role) {
    loginRole = role;
    if ($("login-username")) $("login-username").value = "";
    if ($("login-password")) $("login-password").value = "";
    if ($("login-title")) $("login-title").innerText = role === "admin" ? "Admin Login" : "Worker Login";
    if ($("login-hint")) $("login-hint").innerText = role === "admin" ? "" : "Enter your worker credentials";
    showScreen("login-screen");
}

function loginUser() {
    const user = ($("login-username") || {}).value || "";
    const pass = ($("login-password") || {}).value || "";
    if (!user.trim() || !pass.trim()) { alert("Please fill all fields"); return; }

    if (loginRole === "admin") {
        const admin = JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
        if (!admin) { alert("No admin found. Create admin first."); showScreen("admin-setup-screen"); return; }
        if (admin.user === user && admin.pass === pass) {
            openAdminAfterLogin();
        } else {
            alert("Invalid admin credentials");
        }
    } else {
        const employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
        const found = employees.find(e => e.user === user && e.pass === pass);
        if (found) {
            openWorkerAfterLogin(found.user);
        } else {
            alert("Invalid worker credentials");
        }
    }
}

// After login
function openAdminAfterLogin() {
    showScreen("admin-screen");
    const lang = localStorage.getItem(LANG_KEY) || "am";
    changeDashboardLanguage(lang);
    initStockIfNeeded();
    renderEmployeeList(); // update any admin-side list if present
}

function openWorkerAfterLogin(username) {
    showScreen("worker-screen");
    const lang = localStorage.getItem(LANG_KEY) || "am";
    changeWorkerLanguage(lang);
    // optionally show worker name somewhere
}

// Menu open/close
function openMenu() {
    const menu = $("side-menu");
    const overlay = $("menu-overlay");
    if (menu) menu.classList.add("open");
    if (overlay) overlay.classList.add("show");
}
function closeMenu() {
    const menu = $("side-menu");
    const overlay = $("menu-overlay");
    if (menu) menu.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
}

function openAdminFromMenu() {
    closeMenu();
    showScreen("admin-screen");
    initStockIfNeeded();
    renderEmployeeList();
}
function openWorkerFromMenu() {
    closeMenu();
    showScreen("worker-screen");
}

// Logout
function logout() {
    closeMenu();
    navStack.length = 0;
    showScreen("role-screen", { replace: true });
}

// ---------- Employees (create/list/remove) ----------
function createEmployee() {
    const userEl = $("new-emp-username");
    const passEl = $("new-emp-password");
    const user = userEl ? userEl.value.trim() : "";
    const pass = passEl ? passEl.value.trim() : "";
    if (!user || !pass) { alert("Enter username and password"); return; }

    let employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
    if (employees.find(e => e.user === user)) { alert("Employee username already exists"); return; }

    employees.push({ user, pass });
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    if (userEl) userEl.value = "";
    if (passEl) passEl.value = "";
    renderEmployeeList();
    renderEmployeeListInModal();
}

function renderEmployeeList() {
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

function removeEmployee(index) {
    let employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
    if (!employees[index]) return;
    if (!confirm(`Remove employee ${employees[index].user}?`)) return;
    employees.splice(index, 1);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    renderEmployeeList();
    renderEmployeeListInModal();
}

// ---------- Employee modal helpers (if you use modal) ----------
function openEmployeePanel() {
    // If modal exists, open it; otherwise scroll to admin panel
    const modal = $("employee-modal");
    if (modal) {
        modal.setAttribute("aria-hidden", "false");
        renderEmployeeListInModal();
        // push current screen so Back works
        const current = getCurrentScreenId();
        if (current && navStack[navStack.length - 1] !== current) navStack.push(current);
        return;
    }
    // fallback: scroll to admin employee panel if present
    const panel = $("employee-panel");
    if (panel) {
        showScreen("admin-screen");
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
        panel.style.boxShadow = "0 0 0 3px rgba(0,150,255,0.08)";
        setTimeout(() => panel.style.boxShadow = "", 1200);
    } else {
        alert("Employee panel not found.");
    }
}

function closeEmployeePanel() {
    const modal = $("employee-modal");
    if (modal) {
        modal.setAttribute("aria-hidden", "true");
        showScreen("admin-screen", { replace: true });
    } else {
        showScreen("admin-screen", { replace: true });
    }
}

function createEmployeeFromModal() {
    const user = ($("modal-emp-username") || {}).value || "";
    const pass = ($("modal-emp-password") || {}).value || "";
    if (!user.trim() || !pass.trim()) { alert("Enter username and password"); return; }

    let employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
    if (employees.find(e => e.user === user.trim())) { alert("Employee username already exists"); return; }

    employees.push({ user: user.trim(), pass: pass.trim() });
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    if ($("modal-emp-username")) $("modal-emp-username").value = "";
    if ($("modal-emp-password")) $("modal-emp-password").value = "";
    renderEmployeeListInModal();
    renderEmployeeList();
}

function renderEmployeeListInModal() {
    const container = $("modal-employee-list");
    if (!container) return renderEmployeeList();
    const employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
    if (!employees || employees.length === 0) {
        container.innerHTML = "<em>No employees yet</em>";
        return;
    }
    container.innerHTML = "";
    employees.forEach((e, i) => {
        const row = document.createElement("div");
        row.className = "emp-row";
        const left = document.createElement("div");
        left.textContent = e.user;
        const right = document.createElement("div");
        const btn = document.createElement("button");
        btn.className = "emp-remove";
        btn.textContent = "Remove";
        btn.onclick = () => {
            if (!confirm(`Remove employee ${e.user}?`)) return;
            removeEmployee(i);
            renderEmployeeListInModal();
        };
        right.appendChild(btn);
        row.appendChild(left);
        row.appendChild(right);
        container.appendChild(row);
    });
}

// ---------- Translations / language sync ----------
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

function changeDashboardLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
    const t = dashboardTranslations[lang] || dashboardTranslations["am"];

    if ($("admin-title")) $("admin-title").innerText = t.adminTitle;
    if ($("sell-btn")) $("sell-btn").innerText = t.sell;
    if ($("buy-btn")) $("buy-btn").innerText = t.buy;
    if ($("scanner-label")) $("scanner-label").innerText = t.scanner;
    if ($("printer-label")) $("printer-label").innerText = t.printer;
    if ($("add-btn")) $("add-btn").innerText = t.add + ": 350";
    if ($("remove-btn")) $("remove-btn").innerText = t.remove + ": 350";
    if ($("download-label")) $("download-label").innerText = t.download;
    if ($("export-label")) $("export-label").innerText = t.export;
    if ($("top-date")) $("top-date").innerText = t.date;

    // sync selects
    syncLanguageSelects(lang);
}

function changeWorkerLanguage(lang) {
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

// Sync all language selects to a value
function syncLanguageSelects(lang) {
    const ids = ["global-lang-select", "menu-lang", "lang-select", "worker-lang-select"];
    ids.forEach(id => {
        const el = $(id);
        if (el) el.value = lang;
    });
}

// ---------- Stock (no required chart) ----------
function getSavedStock() {
    const s = JSON.parse(localStorage.getItem(STOCK_KEY) || "null");
    if (s) return s;
    const defaultStock = { electronics: 8500, clothing: 6200, food: 4300, furniture: 3450 };
    localStorage.setItem(STOCK_KEY, JSON.stringify(defaultStock));
    return defaultStock;
}

let stockChart = null;

function initStockIfNeeded() {
    // If a canvas exists, try to init Chart.js; otherwise just populate inputs and totals
    const stock = getSavedStock();
    if ($("stock-electronics")) $("stock-electronics").value = stock.electronics;
    if ($("stock-clothing")) $("stock-clothing").value = stock.clothing;
    if ($("stock-food")) $("stock-food").value = stock.food;
    if ($("stock-furniture")) $("stock-furniture").value = stock.furniture;

    const canvas = $("stockChart");
    if (!canvas) {
        updateTotalValue();
        return;
    }

    // If Chart.js is available and canvas exists, render pie chart
    try {
        const ctx = canvas.getContext("2d");
        const data = {
            labels: ["Electronics", "Clothing", "Food", "Furniture"],
            datasets: [{
                data: [stock.electronics, stock.clothing, stock.food, stock.furniture],
                backgroundColor: ["#ff9800", "#4caf50", "#2196f3", "#9c27b0"]
            }]
        };
        if (stockChart) stockChart.destroy();
        if (typeof Chart !== "undefined") {
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
        }
    } catch (err) {
        // Chart failed — ignore and continue
        console.warn("Chart init skipped:", err);
    }

    updateTotalValue();
}

function updateStockChart() {
    const e = Number(($("stock-electronics") || {}).value || 0);
    const c = Number(($("stock-clothing") || {}).value || 0);
    const f = Number(($("stock-food") || {}).value || 0);
    const fu = Number(($("stock-furniture") || {}).value || 0);

    const stock = { electronics: e, clothing: c, food: f, furniture: fu };
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));

    if (stockChart && stockChart.data && stockChart.data.datasets && stockChart.data.datasets[0]) {
        stockChart.data.datasets[0].data = [e, c, f, fu];
        stockChart.update();
    }

    updateTotalValue();
}

function updateTotalValue() {
    const stock = getSavedStock();
    const total = (stock.electronics || 0) + (stock.clothing || 0) + (stock.food || 0) + (stock.furniture || 0);
    if ($("total-value")) $("total-value").innerText = total.toLocaleString();
}

// Delete stock data (reset)
function deleteStockData() {
    if (!confirm("Delete all saved stock data? This cannot be undone.")) return;
    localStorage.removeItem(STOCK_KEY);
    initStockIfNeeded();
    alert("Stock data deleted and reset to defaults.");
}

// ---------- Init on load ----------
window.addEventListener("load", () => {
    // show language screen by default
    showScreen("language-screen", { replace: true });

    // sync language selects to saved language
    const lang = localStorage.getItem(LANG_KEY) || "am";
    syncLanguageSelects(lang);

    // wire top logout if present
    const topLogout = $("top-logout");
    if (topLogout) topLogout.onclick = logout;

    // ensure back button visibility
    updateBackButtonVisibility(getCurrentScreenId());
});


