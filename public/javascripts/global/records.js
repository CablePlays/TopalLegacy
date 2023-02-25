/*
    API that handles a table of records.
*/

const recordColumns = {
    endurance: [
        ["Date", record => formatDate(new Date(record.date))],
        ["Distance", record => (record.distance / 1000) + "km"],
        ["Time", record => formatDuration(record.time)],
        ["Description", record => record.description],
    ],
    running: [
        ["Date", record => formatDate(new Date(record.date))],
        ["Distance", record => (record.distance / 1000) + "km"],
        ["Time", record => formatDuration(record.time)],
        ["Description", record => record.description],
    ],
    service: [
        ["Date", record => formatDate(new Date(record.date))],
        ["Service", record => record.service],
        ["Hours", record => formatDuration(record.time, false)],
        ["Description", record => record.description],
    ]
}

async function loadRecords(placeholder, recordType, targetUser, removable = true) {
    if (typeof placeholder === "string") {
        placeholder = document.getElementById(placeholder);
    }

    const columns = recordColumns[recordType];

    /* Loading */

    const loading = createLoading(true);
    placeholder.replaceWith(loading);

    /* Get Records */

    let res = await fetch(`/get-${recordType}-records`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: targetUser
        })
    });

    const { records } = await res.json();

    /* Create Table */

    const table = document.createElement("table");
    table.classList.add("records-table");

    const topRow = document.createElement("tr");

    columns.forEach(column => {
        const th = document.createElement("th");
        th.innerHTML = column[0];
        topRow.append(th);
    });

    if (removable) { // removeable column
        table.classList.add("removable");

        const th = document.createElement("th");
        th.innerHTML = "Remove"
        topRow.append(th);
    }

    table.appendChild(topRow);

    /* Populate Table */

    if (records != null) {
        records.forEach(record => {
            const tr = document.createElement("tr");

            columns.forEach(column => {
                const td = document.createElement("td");
                td.innerHTML = column[1](record);
                tr.appendChild(td);
            });

            table.appendChild(tr);

            /* Remove Cell */

            if (removable) {
                const id = record.id;
                const removeCell = document.createElement("td");
                removeCell.innerHTML = "X";

                removeCell.addEventListener("click", () => {
                    tr.remove();

                    fetch(`/remove-${recordType}-record`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id
                        })
                    });
                });

                tr.appendChild(removeCell);
            }
        });

        /* Display */

        loading.replaceWith(table);
        return table;
    }
}