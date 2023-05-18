async function handleButton() {
    const password = document.getElementById("password").value;
    const passwordV = document.getElementById("verify-password").value;

    if (password != passwordV) {
        message("Passwords do not match.");
        return;
    }

    const minLength = 8;

    if (password.length < minLength) {
        message("Password must be at least " + minLength + " characters.");
        return;
    }

    message("Please wait.");

    const { status } = await post("/reset-password", { password });

    if (status === "error") {
        message("An error occured.");
    } else {
        message("Your password has been reset.");
    }
}

window.addEventListener("load", () => {
    document.getElementById("change-button").addEventListener("click", handleButton);
});