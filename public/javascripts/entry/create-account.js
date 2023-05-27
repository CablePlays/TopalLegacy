async function handleClick() {

    /* Names */

    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();

    if (name === "" || surname === "") {
        message("Some information is missing.");
        return;
    }

    /* Password */

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

    /* Create */

    message("Creating account, please wait.");

    const { ok } = await postRequest("/session/account", {
        name,
        surname,
        password,
        token: new URLSearchParams(window.location.search).get("token")
    });

    if (ok) {
        window.location.href = "/account/signup/success";
    } else {
        message("An error occured.");
    }
}

window.addEventListener("load", () => {
    document.getElementById("create-button").addEventListener("click", handleClick);
});