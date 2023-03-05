async function setupSignoffs() {
    const table = document.createElement("table");
    table.classList.add("signoffs-table");

    const valuesPromise = new Promise(async r => {
        const res = await fetch("/get-rock-climbing-signoffs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: getUserId()
            })
        });

        r((await res.json()).values);
    });

    ROCK_CLIMBING_SIGNOFFS.forEach(signoff => {
        const [sectionName, items] = signoff;

        const titleRow = document.createElement("tr");
        const titleCell = document.createElement("th");
        titleCell.innerHTML = sectionName;
        titleRow.append(titleCell);
        table.appendChild(titleRow);

        if (sectionName === "Abseiling") {
            const noticeRow = document.createElement("tr");
            const noticeCell = document.createElement("td");
            const p = document.createElement("p");
            p.classList.add("notice");
            p.innerHTML = "Abseiling at Treverton is always done while belayed on another rope (no acceleration)!";
            noticeCell.appendChild(p);
            noticeRow.appendChild(noticeCell);
            table.appendChild(noticeRow);
        }

        items.forEach(item => {
            const [id, description] = item;
            const complete = new Promise(async r => r((await valuesPromise)[id]?.complete ?? false));

            const itemRow = document.createElement("tr");

            const descriptionCell = document.createElement("td");
            descriptionCell.innerHTML = description;
            itemRow.appendChild(descriptionCell);

            const completedCell = document.createElement("td");
            completedCell.appendChild(createCheckbox(complete));
            itemRow.appendChild(completedCell);

            const dateCell = document.createElement("td");
            valuesPromise.then(values => {
                let date = values[id]?.date;

                if (date != null) {
                    dateCell.innerHTML = formatDate(date);
                }
            });
            itemRow.appendChild(dateCell);

            table.appendChild(itemRow);

            const lineRow = document.createElement("tr");
            const lineCell = document.createElement("td");
            lineCell.classList.add("line");
            lineRow.appendChild(lineCell);
            table.appendChild(lineRow);
        });
    });

    // show table
    document.getElementById("signoffs").replaceWith(table);
}

function setupBelayerSignoff() {
    const promise = new Promise(async r => {
        const json = await post("/get-rock-climbing-belayer-signoff", {
            user: getUserId()
        });
        r({
            award: json.value,
            requested: null
        });
    });

    const status = createAwardStatus("Belayer Signoff", promise);
    document.getElementById("belayer-status").replaceWith(status);
}

window.addEventListener("load", () => {
    setupSignoffs();
    setupBelayerSignoff();
});