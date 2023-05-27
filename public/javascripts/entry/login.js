async function handleButton() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
        message("Invalid email or password.");
        return;
    }

    message("Please wait.");

    const { error, ok } = await putRequest("/session/account", { email, password });

    if (ok) {
        message("Logged in.");
        window.location.href = "/";
    } else if (error === "invalid_details") {
        message("Invalid email or password.");
    } else {
        message("An error occured.");
    }
}

window.addEventListener("load", () => {
    document.getElementById("login-button").addEventListener("click", handleButton);
});