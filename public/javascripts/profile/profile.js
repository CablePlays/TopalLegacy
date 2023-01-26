function setupTabs() {
    const container = document.getElementById("tab-container");

    let pathNodes = window.location.pathname.split("/");
    let selectedTab = pathNodes[pathNodes.length - 1];

    /* Click */

    for (let child of container.children) {
        child.addEventListener("click", () => {
            window.location.href = "/profile/" + child.getAttribute("data-tab");
        })
    }

    /* Selected */

    let tab;

    if (selectedTab != null) {
        for (let child of container.children) {
            if (child.getAttribute("data-tab") === selectedTab) {
                tab = child;
                break;
            }
        }
    }

    tab = tab || document.getElementById("default-tab");
    tab.classList.add("selected");
}

window.addEventListener("load", async () => {
    setupTabs();
});