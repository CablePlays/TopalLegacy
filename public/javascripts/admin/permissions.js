function setupAddUser() {
    const inputElement = document.getElementById("add-user-input");
    const statusElement = document.getElementById("add-user-status");

    document.getElementById("add-user-button").addEventListener("click", async () => {
        const text = inputElement.value.replaceAll(" ", "").toLowerCase();
        if (text === "") return;

        const email = text + "@treverton.co.za";
        inputElement.value = null;

        statusElement.innerHTML = "Please wait...";
        statusElement.style.display = "block";

        const { ok, error } = await putRequest("/permissions/users", {
            user: email,
            permission: "manageAwards",
            has: true
        });

        if (ok) {
            statusElement.innerHTML = `Added user "${email}" (Reloading...)`;
            window.location.reload();
        } else if (error === "self") {
            statusElement.innerHTML = `You cannot manage your own permissions!`;
        } else if (error === "invalid_user") {
            statusElement.innerHTML = `The user "${email}" does not exist!`;
        } else {
            statusElement.innerHTML = "Could not add user.";
        }
    });
}

async function loadUsers() {
    const template = document.getElementById("user-template");
    const permissionsContainer = document.getElementById("permissions-container");
    const userId = getUserId();

    // loading
    const loading = createLoading(true);
    permissionsContainer.replaceWith(loading);

    const { users } = await getRequest("/permissions/users");

    for (let user of users) {
        const { user: currentUser, permissions } = user;
        if (currentUser.id === userId) continue;

        const clone = template.content.cloneNode(true).firstChild; // clone then select div
        const children = clone.children;

        children[0].innerHTML = currentUser.fullName;

        const table = children[1];

        for (let permission of PERMISSIONS) {
            const [id, display] = permission;

            const tr = document.createElement("tr");

            const displayCell = document.createElement("td");
            displayCell.innerHTML = display;
            tr.appendChild(displayCell);

            const checkboxCell = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = permissions[id];
            checkbox.addEventListener("click", () => {
                putRequest("/permissions/users", {
                    user: currentUser.email,
                    permission: id,
                    has: checkbox.checked
                });
            });
            checkboxCell.appendChild(checkbox);
            tr.appendChild(checkboxCell);

            table.appendChild(tr);
        }

        permissionsContainer.appendChild(clone);
    }

    loading.replaceWith(permissionsContainer);
}

window.addEventListener("load", () => {
    setupAddUser();
    loadUsers();
});