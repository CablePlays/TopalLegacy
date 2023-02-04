function setupAddUser() {
    const input = document.getElementById("add-user-input");
    const info = document.getElementById("add-user-info");

    document.getElementById("add-user-button").addEventListener("click", async () => {
        let text = input.value.replaceAll(" ", "").toLowerCase();
        if (text === "") return;

        let email = text + "@treverton.co.za";
        input.value = null;

        info.innerHTML = "Sending request...";
        info.style.display = "block";

        const res = await fetch("/set-permission-level", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: email,
                level: 1
            })
        });

        const { status, error } = await res.json();

        if (status === "success") {
            info.innerHTML = `Added user "${email}" (Reloading...)`;
            window.location.reload();
        } else if (status === "error" && error === "invalid_user") {
            info.innerHTML = `The user "${email}" does not exist!`;
        }
    });
}

async function loadUsers() {
    const template = document.getElementById("user-template");
    const permissionsContainer = document.getElementById("permissions-container");
    const user = getUser();

    let res = await fetch("/get-permission-users", {
        method: "POST"
    });

    let { records } = await res.json();

    for (let record of records) {
        const currentUser = record.user;
        if (currentUser === user) continue;

        const permission = parseInt(record.permission_level);
        if (permission !== 1 && permission !== 2) continue;

        const clone = template.content.cloneNode(true).firstChild; // clone then select div
        const children = clone.children;

        children[0].innerHTML = currentUser;

        let select = children[1];
        select.value = permission;

        select.addEventListener("change", () => {
            let value = parseInt(select.value);

            fetch("/set-permission-level", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: currentUser,
                    level: value
                })
            });

            if (value === 0) { // remove
                clone.remove();
            }
        })

        permissionsContainer.appendChild(clone);
    }
}

window.addEventListener("load", async () => {
    setupAddUser();
    loadUsers();
});