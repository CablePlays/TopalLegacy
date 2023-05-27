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
        setCssVariable("color-background-opposite", "rgb(255, 255, 255)");
        setCssVariable("color-highlight", "rgb(200, 200, 0)");
    } else {
        setCssVariable("color-background", "rgb(255, 255, 255)");
        setCssVariable("color-background-text", "rgb(0, 0, 0)");
        setCssVariable("color-background-opposite", "rgb(20, 20, 30)");
        setCssVariable("color-highlight", "rgb(200, 0, 0)");
    }

    for (let a of ["color-button", "color-button-active", "color-button-hover", "color-button-text"]) {
        setCssVariable(a, getCssVariable(a + "-" + (enabled ? "dark" : "light")));
    }
}

function setDarkTheme(enabled) {
    localStorage.setItem(DARK_THEME_KEY, enabled);
    displayDarkTheme(enabled);
}

displayDarkTheme(getDarkTheme()); // set initial