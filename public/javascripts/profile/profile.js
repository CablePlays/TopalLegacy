function getProfileUser() {
    const parameters = new URLSearchParams(window.location.search);
    return parameters.get("user");
}

function displayUserEmail() {
    document.getElementById("user-email").innerHTML = getProfileUser();
}

function setupTabs() {
    const container = document.getElementById("tab-container");

    let pathNodes = window.location.pathname.split("/");
    let selectedTab = pathNodes[pathNodes.length - 1];

    /* Click */

    for (let tab of container.children) {
        tab.addEventListener("click", () => {
            const search = window.location.search; // parameters
            window.location.href = "/profile/" + tab.getAttribute("data-tab") + search;
        })
    }

    /* Selected */

    if (selectedTab != null) {
        for (let tab of container.children) {
            if (tab.getAttribute("data-tab") === selectedTab) {
                tab.classList.add("selected");
                break;
            }
        }
    }
}

window.addEventListener("load", async () => {
    displayUserEmail();
    setupTabs();
});