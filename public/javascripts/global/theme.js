const DARK_THEME_KEY = "darkTheme";
const r = document.querySelector(":root");

function getCssVariable(variable) {
    return getComputedStyle(r).getPropertyValue("--" + variable);
}

function setCssVariable(variable, value) {
    r.style.setProperty("--" + variable, value);
}

function getDarkTheme() {
    return localStorage.getItem(DARK_THEME_KEY) !== "false"; // default dark
}

/*
    Internal use only.
*/
function displayDarkTheme(enabled) {
    if (enabled) {
        setCssVariable("color-background", "rgb(20, 20, 30)");
        setCssVariable("color-background-text", "rgb(220, 220, 220)");
    } else {
        setCssVariable("color-background", "rgb(255, 255, 255)");
        setCssVariable("color-background-text", "rgb(0, 0, 0)");
        setCssVariable("color-background-text-secondary", "rgb(60, 60, 60)");
    }
}

function setDarkTheme(enabled) {
    localStorage.setItem(DARK_THEME_KEY, enabled);
    displayDarkTheme(enabled);
}

// set initial
displayDarkTheme(getDarkTheme());