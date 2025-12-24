// TRANSLATIONS
const translations = {
    am: {
        loginTitle: "መግቢያ",
        username: "ኢሜይል ወይም ስልክ",
        password: "የይለፍ ቃል",
        loginBtn: "መግቢያ",
        signupLink: "አካውንት የለህም? መመዝገብ"
    },
    om: {
        loginTitle: "Seensa",
        username: "Imeelii yookiin Bilbila",
        password: "Jecha Darbii",
        loginBtn: "Seeni",
        signupLink: "Herrega hin qabduu? Galmaa'i"
    },
    en: {
        loginTitle: "Login",
        username: "Email or Phone",
        password: "Password",
        loginBtn: "Login",
        signupLink: "Don't have an account? Sign up"
    }
};

// LANGUAGE SELECTION
function setLanguage(lang) {
    localStorage.setItem("appLanguage", lang);
    showLogin();
}

// SHOW LOGIN SCREEN
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

// TEMPORARY LOGIN LOGIC
function loginUser() {
    let user = document.getElementById("login-username").value;
    let pass = document.getElementById("login-password").value;

    if (user === "" || pass === "") {
        alert("Please fill all fields");
        return;
    }

    alert("Login successful (temporary)");
}
