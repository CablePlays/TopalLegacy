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

    searchButton.addEventListener("click", async () => {
        // clear previous results
        removeChildren(table);
        amountInfo.innerHTML = "";

        const query = searchBar.value.trim();

        // loading
        const loadingElement = createLoading();
        amountInfo.parentElement.insertBefore(loadingElement, amountInfo);

        const { values } = await post("/search-users", { query });
        const total = values.length;

        loadingElement.remove();
        amountInfo.innerHTML = `${total === 0 ? "No" : total} user${total === 1 ? "" : "s"} found`;

        values.forEach(value => {
            const { id, name, surname } = value;
            const row = createItem(id, name + " " + surname);
            table.appendChild(row);
        });
    });
}

window.addEventListener("load", setupSearch);