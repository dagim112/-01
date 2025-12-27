// =======================================================
// TIKURE APP — FULL LOGIC WITH INBOUND/OUTBOUND & SELL/BUY
// =======================================================

// ---------- Storage keys ----------
const ADMIN_KEY = "tikure_admin";
const EMPLOYEES_KEY = "tikure_employees";
const STOCK_KEY = "tikure_stock";
const WAREHOUSE_KEY = "tikure_warehouse";
const OUTBOUND_LIST_KEY = "tikure_outbound_list";
const SUPPLIERS_KEY = "tikure_suppliers";
const LANG_KEY = "appLanguage";
const PROFIT_KEY = "tikure_profit";

// ---------- Helpers ----------
function $(id){ return document.getElementById(id); }
function showScreen(id){ 
    document.querySelectorAll(".screen, .step-screen").forEach(s=>s.style.display="none");
    if($(id)) $(id).style.display="block";
}
const navStack = [];
function goBack(){ 
    if(navStack.length) showScreen(navStack.pop());
}

// ---------- Language ----------
function setLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
    showScreen("role-screen");
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
    if(!u||!p){ alert("Fill all fields"); return;}
    localStorage.setItem(ADMIN_KEY, JSON.stringify({user:u, pass:p}));
    alert("Admin created");
    prepareLogin("admin");
}

// ---------- Login ----------
let loginRole = null;
function prepareLogin(role){
    loginRole=role;
    $("login-username").value="";
    $("login-password").value="";
    showScreen("login-screen");
}
function loginUser(){
    const u=$("login-username").value.trim();
    const p=$("login-password").value.trim();
    if(!u||!p){ alert("Missing fields"); return; }

    if(loginRole==="admin"){
        const a=JSON.parse(localStorage.getItem(ADMIN_KEY));
        a && a.user===u && a.pass===p ? showScreen("admin-screen") : alert("Invalid admin");
    } else {
        const e=JSON.parse(localStorage.getItem(EMPLOYEES_KEY)||"[]")
            .find(x=>x.user===u && x.pass===p);
        e ? showScreen("worker-screen") : alert("Invalid worker");
    }
}

// ---------- Logout ----------
function logout(){
    navStack.length=0;
    showScreen("language-screen");
}

// =======================================================
// 📦 STORAGE
// =======================================================
function getStock(){ return JSON.parse(localStorage.getItem(STOCK_KEY))||{total:0,money:0,items:[]}; }
function saveStock(s){ localStorage.setItem(STOCK_KEY,JSON.stringify(s)); }

function getWarehouse(){ return JSON.parse(localStorage.getItem(WAREHOUSE_KEY))||{total:0,items:[]}; }
function saveWarehouse(w){ localStorage.setItem(WAREHOUSE_KEY,JSON.stringify(w)); }

function getOutboundList(){ return JSON.parse(localStorage.getItem(OUTBOUND_LIST_KEY))||[]; }
function saveOutboundList(list){ localStorage.setItem(OUTBOUND_LIST_KEY,JSON.stringify(list)); }

function getSuppliers(){ return JSON.parse(localStorage.getItem(SUPPLIERS_KEY))||[]; }
function saveSuppliers(list){ localStorage.setItem(SUPPLIERS_KEY,JSON.stringify(list)); }

function getProfit(){ return JSON.parse(localStorage.getItem(PROFIT_KEY))||0; }
function saveProfit(value){ localStorage.setItem(PROFIT_KEY,JSON.stringify(value)); $("profit-total").innerText=value; }

// =======================================================
// 🔦 SCANNER MODE
// =======================================================
let scannerMode = null;
let inboundData = {};
let inboundCount = 0;
let outboundCount = 0;

// ---------- Admin Buttons ----------
if($("sell-btn")) $("sell-btn").onclick = ()=>setMode("SELL");
if($("buy-btn")) $("buy-btn").onclick = ()=>{ alert("Buy items from warehouse outbound list"); };

if($("add-btn")) $("add-btn").onclick = ()=>startInbound();
if($("remove-btn")) $("remove-btn").onclick = ()=>startOutbound();
if($("profit-btn")) $("profit-btn").onclick = ()=>showScreen("profit-screen");

// ---------- Worker Buttons ----------
if($("inbound-btn")) $("inbound-btn").onclick = ()=>startInbound();
if($("outbound-btn")) $("outbound-btn").onclick = ()=>startOutbound();

// ---------- SCANNER ----------
function initScanner(){
    const input=$("scanner-input");
    if(!input) return;
    input.value="";
    input.focus();
    input.onkeydown = (e)=>{
        if(e.key==="Enter"){
            const code=input.value.trim();
            input.value="";
            if(code) handleScan(code);
        }
    };
}

function handleScan(code){
    if(scannerMode==="INBOUND"){
        inboundCount++;
        $("scan-count").innerText = inboundCount;
        const warehouse = getWarehouse();
        warehouse.items.push({
            code: code,
            category: inboundData.category,
            supplier: inboundData.supplier,
            unit: inboundData.unit,
            price: inboundData.price,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        });
        warehouse.total = warehouse.items.length;
        saveWarehouse(warehouse);
        if(loginRole==="admin") saveProfit(getProfit()+parseFloat(inboundData.price));
    }

    if(scannerMode==="OUTBOUND"){
        outboundCount++;
        $("out-scan-count").innerText = outboundCount;
        const warehouse = getWarehouse();
        const index = warehouse.items.findIndex(it=>it.code===code);
        if(index===-1){ $("out-scan-info").innerText="Item not in warehouse"; return; }
        const item = warehouse.items.splice(index,1)[0];
        warehouse.total = warehouse.items.length;
        saveWarehouse(warehouse);
        saveOutboundList(getOutboundList().concat(item));
        $("out-scan-info").innerText=`Scanned ${outboundCount} items`;
    }

    $("scanner-input").focus();
}

// =======================================================
// ✅ INBOUND FLOW
// =======================================================
function startInbound(){
    inboundData = {};
    inboundCount = 0;
    scannerMode="INBOUND";
    showSuppliers();
}

function showSuppliers(){
    const list = getSuppliers();
    const container = $("supplier-list");
    container.innerHTML="";
    list.forEach((s,i)=>{
        const btn = document.createElement("button");
        btn.innerText = `${s.name} | ${s.country} | ${s.tel}`;
        btn.onclick = ()=>{ inboundData.supplier = s.name; nextInboundStep('type'); };
        container.appendChild(btn);
    });
    showScreen("inbound-step1");
}

function addSupplier(){
    const name = prompt("Supplier Name");
    if(!name) return;
    const country = prompt("Country");
    const tel = prompt("Telephone");
    const suppliers = getSuppliers();
    suppliers.push({name, country, tel});
    saveSuppliers(suppliers);
    showSuppliers();
}

function nextInboundStep(step){
    if(step==="type") showScreen("inbound-step2");
    if(step==="category"){
        // populate categories dynamically
        const catList = $("category-list");
        catList.innerHTML="";
        const options = ["Category 1","Category 2","Category 3"];
        options.forEach(o=>{
            const btn = document.createElement("button");
            btn.innerText=o;
            btn.onclick=()=>{ inboundData.category=o; nextInboundStep('unit'); };
            catList.appendChild(btn);
        });
        showScreen("inbound-step3");
    }
    if(step==="unit") showScreen("inbound-step4");
    if(step==="scan"){
        inboundData.price = parseFloat($("inbound-price").value) || 0;
        showScreen("inbound-step5");
        initScanner();
    }
}

function selectInboundOption(option){
    inboundData.type = option;
    nextInboundStep('category');
}

function selectUnit(unit){ inboundData.unit = unit; nextInboundStep('scan'); }

function finishInbound(){
    alert(`Inbound complete. Total scanned: ${inboundCount}`);
    showScreen("admin-screen");
}

function restartInboundScan(){ inboundCount=0; $("scan-count").innerText=0; $("scan-info").innerText="Ready to scan"; }

// =======================================================
// ✅ OUTBOUND FLOW
// =======================================================
function startOutbound(){
    outboundCount=0;
    scannerMode="OUTBOUND";
    showScreen("outbound-step1");
}

function setOutboundType(type){
    outboundData={type};
    showScreen("outbound-step2");
    initScanner();
}

function finishOutbound(){
    alert(`Outbound complete. Total scanned: ${outboundCount}`);
    showScreen("admin-screen");
}

function restartOutboundScan(){ outboundCount=0; $("out-scan-count").innerText=0; $("out-scan-info").innerText="Ready to scan"; }

// =======================================================
// ✅ PROFIT
// =======================================================
function filterProfit(period){
    const total = getProfit();
    alert(`Profit ${period}: ${total}`);
}

// =======================================================
// INIT
// =======================================================
window.addEventListener("load",()=>{
    showScreen("language-screen");
});











