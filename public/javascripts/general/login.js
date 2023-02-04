function setErrorVisible(visible) {
    let display = (visible ? "block" : "none");

    for (e of document.getElementsByClassName("error")) {
        e.style.display = display;
    }
}

async function handleCredentialResponse(response) {
    let { credential } = response;

    let res = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            credential
        })
    });

    let { status, error } = await res.json();

    if (status === "success") {
        setErrorVisible(false);

        const params = new URLSearchParams(document.location.search);
        let returnPath = params.get("return_path") || "/";

        window.location.href = returnPath;
    } else if (status === "error" && error === "invalid_email") {
        setErrorVisible(true);
    }
}

window.addEventListener("load", () => {

    /* Sign In With Google */

    google.accounts.id.initialize({
        client_id: "65424431927-8mpphvtc9k2sct45lg02pfaidhpmhjsf.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("login-div"), {
        theme: "outline",
        size: "large"
    });

    google.accounts.id.prompt(); // display the One Tap dialog
});