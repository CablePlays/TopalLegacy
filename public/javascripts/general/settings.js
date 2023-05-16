function handleButton(element, runnable) {
    if (typeof element === "string") {
        element = document.getElementById(element + "-button");
    }

    element.addEventListener("click", runnable);
}

function setupButtons() {
    handleButton("logout", () => {
        logOut();
        window.location.href = "login";
    });
    handleButton("logout-all", () => {
        promptConfirmation("You're about to log out of all devices you are signed into.", async () => {
            await fetch("/invalidate-session-token", {
                method: "POST"
            });

            window.location.href = "/";
        });
    });

    const toggleDarkButton = document.getElementById("toggle-dark-button");
    const updateToggleDarkButtonText = enabled => toggleDarkButton.innerHTML = (enabled ? "On" : "Off");

    handleButton(toggleDarkButton, () => {
        let enabled = !getDarkTheme();
        setDarkTheme(enabled);
        updateToggleDarkButtonText(enabled);
    });

    updateToggleDarkButtonText(getDarkTheme());
}

window.addEventListener("load", setupButtons);