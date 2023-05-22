async function handleButton() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
        message("Invalid email or password.");
        return;
    }

    message("Please wait.");

    const { status, error } = await post("/login", { email, password });

    if (status === "error") {
        if (error === "invalidDetails") {
            message("Invalid email or password.");
        } else {
            message("An error occured.");
        }
    } else {
        message("Logged in.");
        window.location.href = "/";
    }
}

window.addEventListener("load", () => {
    document.getElementById("login-button").addEventListener("click", handleButton);
});