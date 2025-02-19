function createProfileButton(userId) {
    const profileButton = document.createElement("button");
    profileButton.innerHTML = "Profile";

    profileButton.addEventListener("click", () => {
        window.location.href = "/profile/" + userId;
    });

    return profileButton;
}

function createItem(userId, display) {
    const tr = document.createElement("tr");

    const displayCell = document.createElement("td");
    displayCell.innerHTML = display;
    tr.appendChild(displayCell);

    const buttonCell = document.createElement("td");
    const profileButton = createProfileButton(userId);
    buttonCell.appendChild(profileButton);
    tr.appendChild(buttonCell);

    return tr;
}

function setupSearch() {
    const amountInfo = document.getElementById("amount-info");
    const searchBar = document.getElementById("search-bar");
    const searchButton = document.getElementById("search-button");
    const table = document.getElementById("results-table");

    searchBar.addEventListener("keyup", event => {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });
    searchButton.addEventListener("click", async () => {
        // clear previous results
        removeChildren(table);
        amountInfo.innerHTML = "";

        const query = searchBar.value.trim();

        // loading
        const loadingElement = createLoadingIcon();
        amountInfo.parentElement.insertBefore(loadingElement, amountInfo);

        const { users } = await getRequest("/users?search=" + query);
        const total = users.length;

        loadingElement.remove();
        amountInfo.innerHTML = `${total === 0 ? "No" : total} user${total === 1 ? "" : "s"} found`;

        users.forEach(value => {
            const { id, name, surname } = value;
            const row = createItem(id, name + " " + surname);
            table.appendChild(row);
        });
    });
}

window.addEventListener("load", () => {
    setupSearch();
});