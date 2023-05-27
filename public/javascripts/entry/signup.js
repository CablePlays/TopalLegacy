async function handleButton() {
    let email = document.getElementById("email").value.trim();

    if (email === "") {
        message("Invalid email.");
        return;
    }
    if (!email.endsWith("@treverton.co.za")) {
        message("You must use a Treverton email!");
        return;
    }

    message("Please wait.");

    const { ok, error } = await postRequest("/session/verify-email", { email });

    if (ok) {
        window.location.href = "/account/signup/verify";
    } else if (error === "email_unavailable") {
        message(`This email is already taken! If you have forgotten your password,
            you can request an email to be sent to your inbox containing the password associated with it.
            Go to the login page to do this.`);
    } else {
        message("An error occured.");
    }
}

window.addEventListener("load", () => {
    document.getElementById("signup-button").addEventListener("click", handleButton);
});