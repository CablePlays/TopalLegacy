function getProfileUser() {
    const pathParts = window.location.pathname.split("/");
    return parseInt(pathParts[2]);
}

async function displayUserName() {
    const userTitle = document.getElementById("user-title");
    userTitle.innerHTML = LOADING_TEXT;

    const userInfo = await getUserInfo(getProfileUser());
    userTitle.innerHTML = userInfo.fullName;
}

function setupTabs() {
    const container = document.getElementById("tab-container");

    let pathNodes = window.location.pathname.split("/");
    let selectedTab = pathNodes[pathNodes.length - 1];

    const targetUserId = getProfileUser();

    /* Click */

    for (let tab of container.children) {
        tab.addEventListener("click", () => {
            window.location.href = "/profile/" + targetUserId + "/" + tab.getAttribute("data-tab");
        })
    }

    /* Selected */

    for (let tab of container.children) {
        if (tab.getAttribute("data-tab") === selectedTab) {
            tab.classList.add("selected");
            break;
        }
    }
}

window.addEventListener("load", () => {
    displayUserName();
    setupTabs();
});