// ---------- app.js (FULL with scanner support) ----------

// ---------- Simple persistence keys ----------
const ADMIN_KEY = "tikure_admin";
const EMPLOYEES_KEY = "tikure_employees";
const STOCK_KEY = "tikure_stock";
const LANG_KEY = "appLanguage";

// ---------- Small DOM helper ----------
function $(id){ return document.getElementById(id); }

// ---------- Navigation history ----------
const navStack = [];

function getCurrentScreenId() {
    const visible = Array.from(document.querySelectorAll(".screen"))
        .find(s => s.style.display !== "none");
    return visible ? visible.id : null;
}

function showScreen(id, options = { replace:false }) {
    const current = getCurrentScreenId();
    if (current && !options.replace) navStack.push(current);

    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    if ($(id)) $(id).style.display = "block";

    updateBackButtonVisibility(id);

    // re-focus scanner when screen changes
    setTimeout(initScanner, 50);
}

function goBack(){
    if (navStack.length === 0) return;
    showScreen(navStack.pop(), { replace:true });
}

// ---------- Header controls ----------
function updateBackButtonVisibility(){
    if ($("back-btn")) $("back-btn").style.display = "inline-block";
    if ($("top-logout")) $("top-logout").style.display = "inline-block";
}

// ---------- Language ----------
function setLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
    showScreen("role-screen", { replace:true });
}

// ---------- Role ----------
function chooseAdmin(){
    const admin = JSON.parse(localStorage.getItem(ADMIN_KEY));
    admin ? prepareLogin("admin") : showScreen("admin-setup-screen");
}

function chooseWorker(){
    prepareLogin("worker");
}

// ---------- Admin setup ----------
function createInitialAdmin(){
    const u = $("setup-admin-username").value.trim();
    const p = $("setup-admin-password").value.trim();
    if (!u || !p) return alert("Fill all fields");
    localStorage.setItem(ADMIN_KEY, JSON.stringify({user:u, pass:p}));
    alert("Admin created");
    prepareLogin("admin");
}

// ---------- Login ----------
let loginRole = null;

function prepareLogin(role){
    loginRole = role;
    $("login-username").value = "";
    $("login-password").value = "";
    $("login-title").innerText = role === "admin" ? "Admin Login" : "Worker Login";
    showScreen("login-screen");
}

function loginUser(){
    const u = $("login-username").value.trim();
    const p = $("login-password").value.trim();
    if (!u || !p) return alert("Missing fields");

    if (loginRole === "admin") {
        const a = JSON.parse(localStorage.getItem(ADMIN_KEY));
        if (a && a.user === u && a.pass === p) openAdminAfterLogin();
        else alert("Invalid admin");
    } else {
        const emps = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
        const ok = emps.find(e => e.user === u && e.pass === p);
        ok ? openWorkerAfterLogin(u) : alert("Invalid worker");
    }
}

// ---------- After login ----------
function openAdminAfterLogin(){
    showScreen("admin-screen", { replace:true });
}

function openWorkerAfterLogin(){
    showScreen("worker-screen", { replace:true });
}

// ---------- Logout ----------
function logout(){
    navStack.length = 0;
    showScreen("role-screen", { replace:true });
}

// =======================================================
// 🔦 SCANNER SUPPORT (STAZA 2D)
// =======================================================

let scannerInput = null;

function initScanner(){
    scannerInput = $("scanner-input");
    if (!scannerInput) return;

    scannerInput.value = "";
    scannerInput.focus();

    scannerInput.onkeydown = (e) => {
        if (e.key === "Enter") {
            const code = scannerInput.value.trim();
            scannerInput.value = "";
            if (code) handleScan(code);
        }
    };
}

function handleScan(code){
    console.log("SCANNED:", code);
    const screen = getCurrentScreenId();

    if (screen === "admin-screen") {
        alert("Admin scanned: " + code);
        // TODO: add stock logic
    }

    if (screen === "worker-screen") {
        alert("Worker scanned: " + code);
        // TODO: inbound / outbound logic
    }
}

// ---------- App init ----------
window.addEventListener("load", () => {
    showScreen("language-screen", { replace:true });
    setTimeout(initScanner, 100);
});






