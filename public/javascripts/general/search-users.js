function getAmountInfo() {
    return document.getElementById("amount-info");
}

function getTable() {
    return document.getElementById("results-table");
}

function createProfileButton(email) {
    const profileButton = document.createElement("button");
    profileButton.innerHTML = "Profile";

    profileButton.addEventListener("click", () => {
        window.location.href = "/profile?user=" + email;
    });

    return profileButton;
}

function addItem(email) {
    const table = getTable();
    const row = document.createElement("tr");

    const cell1 = document.createElement("td");
    cell1.innerHTML = email;
    row.appendChild(cell1);

    const cell2 = document.createElement("td");
    const profileButton = createProfileButton(email);
    cell2.appendChild(profileButton);
    row.appendChild(cell2);

    table.appendChild(row);
}

function clearResults() {
    const table = getTable();

    while (table.firstChild) {
        table.firstChild.remove();
    }

    getAmountInfo().innerHTML = "";
}

function setupSearch() {
    const searchBar = document.getElementById("search-bar");
    const searchButton = document.getElementById("search-button");

    searchButton.addEventListener("click", async () => {
        const query = searchBar.value;
        clearResults();

        let res = await fetch("/search-users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query
            })
        });

        let { users } = await res.json();
        let total = users.length;

        getAmountInfo().innerHTML = `${total} user${total === 1 ? "" : "s"} found`;

        users.forEach(addItem);
    });
}

window.addEventListener("load", () => {
    setupSearch();
});