async function handleLogin(val) {
    const { credential } = val;

    const infoText = document.getElementById("info-text");
    infoText.innerHTML = "Please wait.";
    document.getElementById("info-container").style.display = "block";

    const { ok, error } = await putRequest("/account/handle-login", {
        token: credential
    });

    if (ok) {
        infoText.innerHTML = "Signed in.";

        // redirect
        const params = new URLSearchParams(location.search);
        location.href = params.get("redirect") ?? "/";
    } else if (error === "invalid_email") {
        infoText.innerHTML = "You must use a Treverton email!";
    } else {
        infoText.innerHTML = "Something went wrong. Please try again later.";
    }
}