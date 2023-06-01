function handleButton(element, runnable) {
    if (typeof element === "string") {
        element = document.getElementById(element + "-button");
    }

    element.addEventListener("click", runnable);
}

function setupButtons() {
    handleButton("logout", () => {
        logOut();
        window.location.href = "/account/login";
    });

    handleButton("change-password", () => window.location.href = "/account/change-password");

    const toggleDarkButton = document.getElementById("toggle-dark-button");
    const updateToggleDarkButtonText = enabled => toggleDarkButton.innerHTML = (enabled ? "On" : "Off");

    handleButton(toggleDarkButton, () => {
        let enabled = !getDarkTheme();
        setDarkTheme(enabled);
        updateToggleDarkButtonText(enabled);
    });

    updateToggleDarkButtonText(getDarkTheme());
}

window.addEventListener("load", () => {
    setupButtons();
});