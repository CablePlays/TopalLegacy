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

    const { ok } = await putRequest("/session/change-password", { password });

    if (ok) {
        message("Your password has been changed.");
    } else {
        message("An error occured.");
    }
}

window.addEventListener("load", () => {
    document.getElementById("change-button").addEventListener("click", handleButton);
});