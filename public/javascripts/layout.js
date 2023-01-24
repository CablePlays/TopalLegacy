function setupNavigation() {
    document.getElementById("nav-home").addEventListener("click", () => {
        window.location.href = "/";
    });
    document.getElementById("nav-permissions").addEventListener("click", () => {
        window.location.href = "/permissions";
    });
    document.getElementById("nav-settings").addEventListener("click", () => {
        window.location.href = "/settings";
    });
    document.getElementById("nav-sign_awards").addEventListener("click", () => {
        window.location.href = "/sign-awards";
    });

    /* Login */

    const loginButton = document.getElementById("nav-login");

    loginButton.innerHTML = (isLoggedIn() ? "Sign Out" : "Login");
    loginButton.addEventListener("click", () => {
        if (isLoggedIn()) {
            logOut();
        }

        window.location.href = "/login";
    });
}

function addLineInners() {
    for (let element of document.getElementsByClassName("line")) {
        let inner = document.createElement("div");
        inner.classList.add("line-inner");
        element.appendChild(inner);
    }
}

window.addEventListener("load", async () => {
    setupNavigation();
    addLineInners();

    const navContainer = document.getElementById("nav-container");

    window.addEventListener("resize", () => {
        let navContainerWidth = navContainer.offsetWidth;
        console.log("Width: " + navContainerWidth);
    });
});