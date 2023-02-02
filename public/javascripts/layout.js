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

    /* Login */

    const loginButton = document.getElementById("nav-login");

    loginButton.innerHTML = (isLoggedIn() ? "Sign Out" : "Login");
    loginButton.addEventListener("click", () => {
        if (isLoggedIn()) {
            logout();
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

function setupSidebar() {
    const sidebarButton = document.getElementById("sidebar-button");
    const sidebar = document.getElementById("sidebar");
    let open = false;

    sidebarButton.addEventListener("click", () => {
        if (open) {
            open = false;
            sidebarButton.classList.remove("change");
            sidebar.style.right = "-250px";
        } else {
            open = true;
            sidebarButton.classList.add("change");
            sidebar.style.right = "0";
        }
    });
}

function setupResizeListener() {
    const navContainer = document.getElementById("nav-container");
    const sidebar = document.getElementById("sidebar");
    const sidebarButton = document.getElementById("sidebar-button");

    const sidebarDisplay = sidebar.style.display;
    const sidebarButtonDisplay = sidebarButton.style.display;

    let buttonsWidth;
    let childDisplays = [];

    // save child displays
    for (let i = 0; i < navContainer.children.length; i++) {
        let child = navContainer.children[i];
        childDisplays[i] = child.style.display;
    }

    const onResize = () => {
        const navContainerWidth = navContainer.offsetWidth;

        if (buttonsWidth == null) {
            buttonsWidth = 0;

            for (let child of navContainer.children) {
                buttonsWidth += child.offsetWidth;
            }
        }
        if (buttonsWidth > navContainerWidth) {
            sidebar.style.display = sidebarDisplay;
            sidebarButton.style.display = sidebarButtonDisplay;

            for (let child of navContainer.children) {
                child.style.display = "none";
            }
        } else {
            buttonsWidth = null; // relcalculate

            sidebar.style.display = "none";
            sidebarButton.style.display = "none";

            for (let i = 0; i < navContainer.children.length; i++) {
                navContainer.children[i].style.display = childDisplays[i];
            }
        }
    };

    onResize();
    window.addEventListener("resize", onResize);
}

window.addEventListener("load", async () => {
    setupNavigation();
    setupSidebar();
    addLineInners();
    setupResizeListener();
});