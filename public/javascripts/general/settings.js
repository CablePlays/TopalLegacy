function handleButton(element, onClick) {
    if (typeof element === "string") {
        element = document.getElementById(element + "-button");
    }

    element.addEventListener("click", onClick);
}

function setupButtons() {
    handleButton("logout", () => {
        logOut();
        window.location.href = "/login";
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

window.addEventListener("load", () => {
    setupButtons();
});