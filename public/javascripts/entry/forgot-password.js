let requesting = false;

async function handleButton() {
    if (requesting) {
        return;
    }

    const email = document.getElementById("email").value.trim();

    if (email === "") {
        message("Invalid email.");
        return;
    }
    if (!email.endsWith("@treverton.co.za")) {
        message("That is not a Treverton email!");
        return;
    }

    message("Please wait.");
    requesting = true;

    const { error, ok } = await postRequest("/session/forgot-password", { email });

    if (ok) {
        message("An email has been sent to your inbox. Find your password there.");
    } else if (error === "invalid_email") {
        message("There is no account associated with that email.");
    } else {
        message("An error occured.");
    }

    requesting = false;
}

window.addEventListener("load", () => {
    document.getElementById("send-button").addEventListener("click", handleButton);
});