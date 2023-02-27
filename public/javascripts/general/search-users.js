function createProfileButton(email) {
    const profileButton = document.createElement("button");
    profileButton.innerHTML = "Profile";

    profileButton.addEventListener("click", () => {
        window.location.href = "/profile?user=" + email;
    });

    return profileButton;
}

function createItem(user, display) {
    const tr = document.createElement("tr");
    const cell = document.createElement("td");

    const displayElement = document.createElement("td");
    displayElement.innerHTML = display;
    cell.appendChild(displayElement);

    const profileButton = createProfileButton(user);
    cell.appendChild(profileButton);

    tr.appendChild(cell);
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

        const query = searchBar.value;

        // loading
        const loadingElement = createLoading();
        amountInfo.parentElement.insertBefore(loadingElement, amountInfo);

        let res = await fetch("/search-users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query
            })
        });

        const { values } = await res.json();
        const total = values.length;

        loadingElement.remove();
        amountInfo.innerHTML = `${total === 0 ? "No" : total} user${total === 1 ? "" : "s"} found`;

        values.forEach(value => {
            const { email, names } = value;
            const row = createItem(email, names.name);
            table.appendChild(row);
        });
    });
}

window.addEventListener("load", setupSearch);