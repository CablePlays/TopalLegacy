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

    const { status, error } = await post("/forgot-password", { email });

    if (status === "error") {
        if (error === "invalidEmail") {
            message("There is no account associated with that email.");
        } else {
            message("An error occured.");
        }
    } else {
        message("An email has been sent to your inbox. Find your password there.");
    }

    requesting = false;
}

window.addEventListener("load", () => {
    document.getElementById("send-button").addEventListener("click", handleButton);
});