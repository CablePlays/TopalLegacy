function setupAddUser() {
    const input = document.getElementById("add-user-input");
    const info = document.getElementById("add-user-info");

    document.getElementById("add-user-button").addEventListener("click", () => {
        let text = input.value.replaceAll(" ", "").toLowerCase();
        if (text === "") return;

        let email = text + "@treverton.co.za";
        input.value = null;

        fetch("/set-permission", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: email,
                level: 1
            })
        });

        info.innerHTML = `Added user "${email}" (Reload to view user)`;
        info.style.display = "block";
    });
}

async function loadUsers() {
    const template = document.getElementById("user-template");
    const permissionsContainer = document.getElementById("permissions-container");
    const localUser = getEmail();

    let res = await fetch("/database-get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            range: "Permissions!A2:B"
        })
    });

    let { values } = await res.json();

    for (let row of values) {
        const user = row[0];
        if (user === localUser || user == null) continue;

        const clone = template.content.cloneNode(true).firstChild; // clone then select div
        const children = clone.children;

        let level = row[1];
        let permission;

        if (level == 1) {
            permission = 1;
        } else if (level == 2) {
            permission = 2;
        } else {
            continue;
        }

        children[0].innerHTML = user;

        let select = children[1];
        select.value = permission;

        select.addEventListener("change", () => {
            let value = parseInt(select.value);

            fetch("/set-permission", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user,
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