const loginEmail = document.querySelector("#login_email");
const loginPassword = document.querySelector("#login_password");
const loginSubmit = document.querySelector("#login_submit");
const incorrectCredText = document.querySelector("#incorrect_cred");

loginSubmit.addEventListener("click", () => {
    const email = loginEmail.value;
    const password = loginPassword.value;
    if (email === "admin1234@gmail.com" && password === "retailbuddy1234") {
        navigation.navigate("dashboard.html");
    } else {
        incorrectCredText.style.opacity = 1;
    }
});