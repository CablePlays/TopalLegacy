/*
    Handles displaying records using either a table or a list for singletons.
*/

const recordSingletonDisplays = {
    solitaire: [
        ["Date", record => formatDate(record.date)],
        ["Location", record => record.location],
        ["Others Involved", record => record.othersInvolved],
        ["Supervisors", record => record.supervisors],
        ["What I Took With Me", record => record.items],
        ["The Experience", record => record.experienceDescription]
    ]
}

const recordColumns = {
    endurance: [
        ["Date", record => formatDate(record.date)],
        ["Distance", record => (record.distance / 1000) + "km"],
        ["Time", record => formatDuration(record.time)],
        ["Description", record => record.description],
    ],
    midmarMile: [
        ["Date", record => formatDate(record.date)],
        ["Distance", record => record.distance + "m"],
        ["Time", record => formatDuration(record.time)]
    ],
    running: [
        ["Date", record => formatDate(record.date)],
        ["Distance", record => (record.distance / 1000) + "km"],
        ["Time", record => formatDuration(record.time)],
        ["Description", record => record.description],
    ],
    service: [
        ["Date", record => formatDate(record.date)],
        ["Service", record => record.service],
        ["Hours", record => formatDuration(record.time, false)],
        ["Description", record => record.description],
    ]
}

async function setupSingletonRecord(type, recordInputOptions) {
    const { exists, value } = await post(`/get-${type}-record`);
    return (exists ? _loadSingletonRecord(type, value, true) : createRecordInput(recordInputOptions));
}

async function loadSingletonRecord(type, targetUserId) {
    const { exists, value } = await post(`/get-${type}-record`, {
        user: targetUserId
    });

    return _loadSingletonRecord(type, exists ? value : null, false);
}

/*
    Loads a single record.
*/
function _loadSingletonRecord(type, record, removable) {
    const items = recordSingletonDisplays[type];

    const div = document.createElement("div");
    div.classList.add("record-singleton");

    const itemContainer = createElement("div", div);
    itemContainer.classList.add("item-container");

    for (let item of items) {
        const section = createElement("div", itemContainer);
        createElement("h3", section, item[0]);
        createElement("p", section, (record == null) ? MISSING_TEXT : item[1](record));
    }

    if (removable) {
        const removeElement = createElement("button", div, "Remove Record");

        removeElement.addEventListener("click", async () => {
            await post(`/remove-${type}-record`);
            window.location.reload();
        });
    }

    return div;
}

/*
    Loads a table of records.
*/
async function loadRecords(placeholder, recordType, targetUser, removable = true) {
    if (typeof placeholder === "string") {
        placeholder = document.getElementById(placeholder);
    }

    const columns = recordColumns[recordType];

    /* Loading */

    const loading = createLoading(true);
    placeholder.replaceWith(loading);

    /* Get Records */

    const { values } = await post(`/get-${recordType}-records`, {
        user: targetUser
    });

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
        th.innerHTML = "Remove";
        topRow.append(th);
    }

    table.appendChild(topRow);

    /* Populate Table */

    if (values != null) {
        values.forEach(record => {
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
    }
}