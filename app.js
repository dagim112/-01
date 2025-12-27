// =======================================================
// TIKURE / TQURE APP — FULL LOGIC WITH SCANNER
// =======================================================

// ---------- Storage keys ----------
const ADMIN_KEY = "tikure_admin";
const EMPLOYEES_KEY = "tikure_employees";
const STOCK_KEY = "tikure_stock";
const WAREHOUSE_KEY = "tikure_warehouse";
const LANG_KEY = "appLanguage";

// ---------- Helpers ----------
function $(id){ return document.getElementById(id); }

// ---------- Navigation ----------
const navStack = [];

function getCurrentScreenId() {
    const s = [...document.querySelectorAll(".screen")]
        .find(e => e.style.display !== "none");
    return s ? s.id : null;
}

function showScreen(id, options={replace:false}) {
    const cur = getCurrentScreenId();
    if (cur && !options.replace) navStack.push(cur);
    document.querySelectorAll(".screen").forEach(s=>s.style.display="none");
    if ($(id)) $(id).style.display="block";
    // focus scanner if scan screen
    if(id==="scan-screen") setTimeout(initScanner,50);
}

function goBack(){
    if (!navStack.length) return;
    showScreen(navStack.pop(), {replace:true});
}

// ---------- Language ----------
function setLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
    showScreen("role-screen",{replace:true});
}

// ---------- Roles ----------
function chooseAdmin(){
    const a = JSON.parse(localStorage.getItem(ADMIN_KEY));
    a ? prepareLogin("admin") : showScreen("admin-setup-screen");
}

function chooseWorker(){
    prepareLogin("worker");
}

// ---------- Admin setup ----------
function createInitialAdmin(){
    const u=$("setup-admin-username").value.trim();
    const p=$("setup-admin-password").value.trim();
    if(!u||!p) return alert("Fill all fields");
    localStorage.setItem(ADMIN_KEY,JSON.stringify({user:u,pass:p}));
    alert("Admin created");
    prepareLogin("admin");
}

// ---------- Login ----------
let loginRole=null;

function prepareLogin(role){
    loginRole=role;
    $("login-username").value="";
    $("login-password").value="";
    showScreen("login-screen");
}

function loginUser(){
    const u=$("login-username").value.trim();
    const p=$("login-password").value.trim();
    if(!u||!p) return alert("Missing fields");

    if(loginRole==="admin"){
        const a=JSON.parse(localStorage.getItem(ADMIN_KEY));
        a && a.user===u && a.pass===p
            ? showScreen("admin-screen",{replace:true})
            : alert("Invalid admin");
    } else {
        const e=JSON.parse(localStorage.getItem(EMPLOYEES_KEY)||"[]")
            .find(x=>x.user===u&&x.pass===p);
        e ? showScreen("worker-screen",{replace:true})
          : alert("Invalid worker");
    }
}

// ---------- Logout ----------
function logout(){
    navStack.length=0;
    showScreen("role-screen",{replace:true});
}

// =======================================================
// 📦 STOCK + WAREHOUSE DATA
// =======================================================

function getStock(){
    return JSON.parse(localStorage.getItem(STOCK_KEY)) || {total:0};
}
function saveStock(s){
    localStorage.setItem(STOCK_KEY,JSON.stringify(s));
}

function getWarehouse(){
    return JSON.parse(localStorage.getItem(WAREHOUSE_KEY)) || {total:0};
}
function saveWarehouse(w){
    localStorage.setItem(WAREHOUSE_KEY,JSON.stringify(w));
}

// =======================================================
// 🔦 SCANNER LOGIC
// =======================================================

let scannerMode = null; // SELL, BUY, INBOUND, OUTBOUND

function setMode(mode){
    scannerMode = mode;
    // Navigate to scan screen
    showScreen("scan-screen");
    $("scan-mode-title").innerText = "Scan Mode: " + mode;
    $("scan-info").innerText = "Scan an item now";
}

// ---------- Buttons ----------
// ADMIN – shop
if ($("sell-btn")) $("sell-btn").onclick = () => setMode("SELL");
if ($("buy-btn")) $("buy-btn").onclick = () => setMode("BUY");
// WORKER – warehouse
if ($("inbound-btn")) $("inbound-btn").onclick = () => setMode("INBOUND");
if ($("outbound-btn")) $("outbound-btn").onclick = () => setMode("OUTBOUND");

// ---------- Scanner ----------
function initScanner(){
    const input=$("scanner-input");
    if(!input) return;
    input.value="";
    input.focus();
    input.onkeydown=(e)=>{
        if(e.key==="Enter"){
            const code=input.value.trim();
            input.value="";
            if(code) handleScan(code);
        }
    };
}

function handleScan(code){
    if(!scannerMode){
        alert("Select Sell / Buy / Inbound / Outbound first");
        return;
    }

    let result = "";
    if(scannerMode==="SELL"){
        const s=getStock();
        s.total=Math.max(0,s.total-1);
        saveStock(s);
        result = `Sold: ${code} | Stock: ${s.total}`;
    }

    if(scannerMode==="BUY"){
        const s=getStock();
        s.total+=1;
        saveStock(s);
        result = `Bought: ${code} | Stock: ${s.total}`;
    }

    if(scannerMode==="INBOUND"){
        const w=getWarehouse();
        w.total+=1;
        saveWarehouse(w);
        result = `Inbound: ${code} | Warehouse: ${w.total}`;
    }

    if(scannerMode==="OUTBOUND"){
        const w=getWarehouse();
        w.total=Math.max(0,w.total-1);
        saveWarehouse(w);
        result = `Outbound: ${code} | Warehouse: ${w.total}`;
    }

    $("scan-info").innerText = result;
    $("scanner-input").focus();
}

// =======================================================
// 🚀 INIT
// =======================================================

window.addEventListener("load",()=>{
    showScreen("language-screen",{replace:true});
    setTimeout(initScanner,100);
});









