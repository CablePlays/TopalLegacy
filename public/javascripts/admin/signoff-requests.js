const STATS_CONTAINER_ID = "stats-container";

async function load() {
    const statsContainer = document.getElementById(STATS_CONTAINER_ID);

    // loading icon
    const loadingIconContainer = createElement("div", statsContainer);
    loadingIconContainer.appendChild(createSpacer(20));
    const loadingIcon = createLoadingIcon();
    loadingIconContainer.appendChild(loadingIcon);

    const { total, users } = await getRequest(`/requests`);

    loadingIconContainer.remove();
    loadStats(total);
    loadRequests(users);
}

function loadStats(totalRequests) {
    const statsContainer = document.getElementById(STATS_CONTAINER_ID);

    for (let award of AWARDS) {
        const [id, name] = award;
        const count = totalRequests[id] ?? 0;

        if (count > 0) {
            createElement("p", statsContainer, name + ": " + count);
        }
    }

    if (statsContainer.children.length === 0) {
        createElement("p", statsContainer, NONE_TEXT);
    }
}

function loadRequests(userRequests) {
    const requestsContainer = document.getElementById("requests-container");
    userRequests.sort((a, b) => a.details.fullName.localeCompare(b.details.fullName)); // sort by full name

    for (let userData of userRequests) {
        const { details, requests } = userData;

        const card = createElement("div", requestsContainer);
        card.classList.add("request");

        createElement("h3", card, details.fullName);
        card.appendChild(createSpacer(10));

        for (let award of AWARDS) {
            const [id, name] = award;
            const count = requests[id] ?? 0;

            if (count > 0) {
                createElement("p", card, name + ": " + count);
            }
        }

        card.appendChild(createSpacer(20));

        const link = createElement("a", card, "View Requests");
        link.classList.add("transparent-button")
        link.href = `/profile/${details.id}/requests`;
        link.target = "_blank";
    }
}

window.addEventListener("load", () => {
    load();
});