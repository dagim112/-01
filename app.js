// LOGIN + SIGNUP TRANSLATIONS
const translations = {
    am: {
        loginTitle: "መግቢያ",
        username: "ኢሜይል ወይም ስልክ",
        password: "የይለፍ ቃል",
        loginBtn: "መግቢያ",
        signupLink: "አካውንት የለህም? መመዝገብ",
        signupTitle: "መመዝገብ",
        signupBtn: "መመዝገብ",
        loginLink: "አካውንት አለህ? መግቢያ"
    },
    om: {
        loginTitle: "Seensa",
        username: "Imeelii yookiin Bilbila",
        password: "Jecha Darbii",
        loginBtn: "Seeni",
        signupLink: "Herrega hin qabduu? Galmaa'i",
        signupTitle: "Galmaa'i",
        signupBtn: "Galmaa'i",
        loginLink: "Herrega qabdaa? Seeni"
    },
    en: {
        loginTitle: "Login",
        username: "Email or Phone",
        password: "Password",
        loginBtn: "Login",
        signupLink: "Don't have an account? Sign up",
        signupTitle: "Sign Up",
        signupBtn: "Create Account",
        loginLink: "Already have an account? Login"
    }
};

// SET LANGUAGE
function setLanguage(lang) {
    localStorage.setItem("appLanguage", lang);
    showLogin();
}

// SHOW LOGIN
function showLogin() {
    document.getElementById("language-screen").style.display = "none";
    document.getElementById("login-screen").style.display = "block";

    let lang = localStorage.getItem("appLanguage") || "am";
    let t = translations[lang];

    document.getElementById("login-title").innerText = t.loginTitle;
    document.getElementById("login-username").placeholder = t.username;
    document.getElementById("login-password").placeholder = t.password;
    document.getElementById("login-btn").innerText = t.loginBtn;
    document.getElementById("signup-link").innerText = t.signupLink;
}

// SHOW SIGNUP
function showSignup() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("signup-screen").style.display = "block";

    let lang = localStorage.getItem("appLanguage") || "am";
    let t = translations[lang];

    document.getElementById("signup-title").innerText = t.signupTitle;
    document.getElementById("signup-username").placeholder = t.username;
    document.getElementById("signup-password").placeholder = t.password;
    document.getElementById("signup-btn").innerText = t.signupBtn;
    document.getElementById("login-link").innerText = t.loginLink;
}

// CREATE ACCOUNT
function createAccount() {
    let user = document.getElementById("signup-username").value;
    let pass = document.getElementById("signup-password").value;

    if (user === "" || pass === "") {
        alert("Please fill all fields");
        return;
    }

    localStorage.setItem("savedUser", user);
    localStorage.setItem("savedPass", pass);

    alert("Account created successfully!");
    showLogin();
}

// SHOW ROLE SCREEN
function loginUser() {
    let user = document.getElementById("login-username").value;
    let pass = document.getElementById("login-password").value;

    if (user === "" || pass === "") {
        alert("Please fill all fields");
        return;
    }

    showRoleScreen();
}

function showRoleScreen() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("signup-screen").style.display = "none";
    document.getElementById("role-screen").style.display = "block";
}

// DASHBOARD TRANSLATIONS
const dashboardTranslations = {
    am: {
        adminTitle: "የእርምራ ለመመልከት ቁጥር",
        sell: "ስ.ን (መሸጫ)",
        buy: "ስን (መግዛት)",
        scanner: "ስን ፈቃድ",
        printer: "የእርምራ ማሳያ",
        add: "➕ አን መጨመሪያ ቁጥር: 350",
        remove: "➖ አመ አውልቃል: 350",
        download: "የላኪ መረጃ",
        export: "የተላከ መረጃ",
        date: "Tue. Apr 30",
        appTitle: "ጥቁሬ"
    },
    om: {
        adminTitle: "Lakkoofsa Qabeenyaa Guyyaa",
        sell: "Gurguri (Sell)",
        buy: "Bitii (Buy)",
        scanner: "Skanneer fayyadami",
        printer: "Maxxansa Odeeffannoo",
        add: "➕ Lakkoofsa dabali: 350",
        remove: "➖ Lakkoofsa hir'isi: 350",
        download: "Odeeffannoo buusi",
        export: "Odeeffannoo ergi",
        date: "Tal. Ebla 30",
        appTitle: "ጥቁሬ"
    },
    en: {
        adminTitle: "Daily stock value",
        sell: "Sell",
        buy: "Buy",
        scanner: "Use scanner",
        printer: "Print report",
        add: "➕ Add quantity: 350",
        remove: "➖ Remove quantity: 350",
        download: "Download data",
        export: "Export data",
        date: "Tue. Apr 30",
        appTitle: "Tikure"
    }
};

// CHANGE ADMIN LANGUAGE
function changeDashboardLanguage(lang) {
    localStorage.setItem("appLanguage", lang);
    const t = dashboardTranslations[lang];

    document.querySelector(".app-title").innerText = t.appTitle;
    document.getElementById("admin-title").innerText = t.adminTitle;
    document.getElementById("sell-btn").innerText = t.sell;
    document.getElementById("buy-btn").innerText = t.buy;
    document.getElementById("scanner-label").innerText = t.scanner;
    document.getElementById("printer-label").innerText = t.printer;
    document.getElementById("add-btn").innerText = t.add;
    document.getElementById("remove-btn").innerText = t.remove;
    document.getElementById("download-label").innerText = t.download;
    document.getElementById("export-label").innerText = t.export;
    document.getElementById("top-date").innerText = t.date;

    const select = document.getElementById("lang-select");
    if (select) select.value = lang;
}

// SELECT ROLE
function selectRole(role) {
    document.getElementById("role-screen").style.display = "none";

    if (role === "admin") {
        document.getElementById("admin-screen").style.display = "block";
        const lang = localStorage.getItem("appLanguage") || "am";
        changeDashboardLanguage(lang);
        initStockChart();
    } else {
        document.getElementById("worker-screen").style.display = "block";
    }
}

// PIE CHART
let stockChart;

function initStockChart() {
    const ctx = document.getElementById("stockChart").getContext("2d");

    const data = {
        labels: ["Electronics", "Clothing", "Food", "Furniture"],
        datasets: [{
            data: [8500, 6200, 4300, 3450],
            backgroundColor: ["#ff9800", "#4caf50", "#2196f3", "#9c27b0"]
        }]
    };

    if (stockChart) stockChart.destroy();

    stockChart = new Chart(ctx, {
        type: "pie",
        data: data,
        options: {
            plugins: {
                legend: { labels: { color: "#ffffff" } }
            }
        }
    });
}

function updateStockChart() {
    const e = Number(document.getElementById("stock-electronics").value || 0);
    const c = Number(document.getElementById("stock-clothing").value || 0);
    const f = Number(document.getElementById("stock-food").value || 0);
    const fu = Number(document.getElementById("stock-furniture").value || 0);

    stockChart.data.datasets[0].data = [e, c, f, fu];
    stockChart.update();

    const total = e + c + f + fu;
    document.getElementById("total-value").innerText = total.toLocaleString();
}

