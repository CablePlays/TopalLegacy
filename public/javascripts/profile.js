function setupTabs() {
    const container = document.getElementById("tab-container");
    const divContainer = document.getElementById("tab-div-container");
    let params = new URLSearchParams(document.location.search);
    let selectedTab = params.get("tab");

    /* Click */

    for (let child of container.children) {
        child.addEventListener("click", () => {
            console.log("clicked");
            window.location.href = "/profile?tab=" + child.getAttribute("data-tab");
        })
    }

    /* Selected */

    let tab;
    let tabDiv;

    if (selectedTab != null) {
        for (let child of container.children) {
            if (child.getAttribute("data-tab") === selectedTab) {
                tab = child;
                break;
            }
        }
        for (let child of divContainer.children) {
            if (child.getAttribute("data-tab") === selectedTab) {
                tabDiv = child;
                break;
            }
        }
    }

    tab = tab || document.getElementById("default-tab");
    tabDiv = tabDiv || document.getElementById("default-tab-div");

    tab.classList.add("selected");
    tabDiv.style.display = "block";
}

window.addEventListener("load", async () => {
    setupTabs();
});