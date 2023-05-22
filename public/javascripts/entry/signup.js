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
    
    const { status, error } = await post("/signup", { email });

    if (status === "error") {
        if (error === "emailTaken") {
            message(`This email is already taken! If you have forgotten your password,
                you can request an email to be sent to your inbox containing the password associated with it.
                Go to the login page to do this.`);
        } else {
            message("An error occured.");
        }
    } else {
        window.location.href = "/account/signup/verify";
    }
}

window.addEventListener("load", () => {
    document.getElementById("signup-button").addEventListener("click", handleButton);
});