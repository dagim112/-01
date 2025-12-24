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

    showRoleScreen();
}

translations.am.signupTitle = "መመዝገብ";
translations.am.signupBtn = "መመዝገብ";
translations.am.loginLink = "አካውንት አለህ? መግቢያ";

translations.om.signupTitle = "Galmaa'i";
translations.om.signupBtn = "Galmaa'i";
translations.om.loginLink = "Herrega qabdaa? Seeni";

translations.en.signupTitle = "Sign Up";
translations.en.signupBtn = "Create Account";
translations.en.loginLink = "Already have an account? Login";
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
function createAccount() {
    let user = document.getElementById("signup-username").value;
    let pass = document.getElementById("signup-password").value;

    if (user === "" || pass === "") {
        alert("Please fill all fields");
        return;
    }

    // Save user (temporary)
    localStorage.setItem("savedUser", user);
    localStorage.setItem("savedPass", pass);

    alert("Account created successfully!");
    showLogin();




    

  
