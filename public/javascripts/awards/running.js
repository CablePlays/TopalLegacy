function getTable() {
    return document.getElementById("logs-table");
}

function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatTime(seconds) {
    let h = Math.floor(seconds / 3600);
    seconds -= h * 3600;

    let m = Math.floor(seconds / 60);
    let s = seconds - m * 60;
    return `${h}h:${m}m:${s}s`;
}

function addRow(id, date, distance, time, description) {
    const tr = document.createElement("tr");

    let idCell = document.createElement("td");
    idCell.innerHTML = id;
    tr.appendChild(idCell);

    let dateCell = document.createElement("td");
    dateCell.innerHTML = formatDate(date);
    tr.appendChild(dateCell);

    let distanceCell = document.createElement("td");
    distanceCell.innerHTML = distance + "m";
    tr.appendChild(distanceCell);

    let timeCell = document.createElement("td");
    timeCell.innerHTML = formatTime(time);
    tr.appendChild(timeCell);

    let descriptionCell = document.createElement("td");
    descriptionCell.innerHTML = description;
    tr.appendChild(descriptionCell);

    let removeCell = document.createElement("td");
    removeCell.innerHTML = "X";
    removeCell.addEventListener("click", () => {
        tr.remove();

        fetch("/database-set", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                range: `Runs!A${id}:E`,
                values: [
                    ["", "", "", "", ""]
                ]
            })
        });
    });
    tr.appendChild(removeCell);

    getTable().appendChild(tr);
}

function setDateCurrent(dateInput) {
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString();

    if (month.length === 1) {
        month = "0" + month;
    }

    let day = date.getDate().toString();

    if (day.length === 1) {
        day = "0" + day;
    }

    dateInput.value = year + "-" + month + "-" + day;
}

function hmsToSeconds(string) {
    let parts = string.split(" ");
    if (parts.length !== 3) return null;
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
}

async function addRows() {
    let res = await fetch("/database-get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            range: "Runs!A2:E"
        })
    });

    let { values } = await res.json();
    let totalDistance = 0;

    if (values != null) {
        const user = getEmail();

        for (let i = 0; i < values.length; i++) {
            let row = values[i];

            if (row[0] === user) {
                let sheetRow = i + 2;
                let distance = parseInt(row[2]);
                totalDistance += distance;
                addRow(sheetRow, new Date(row[1]), distance, row[3], row[4] || "");
            }
        }
    }

    return totalDistance;
}

function updateDistance() {
    let value = document.getElementById("distance-input").value;
    document.getElementById("distance-display").innerHTML = value + "m";
}

function setupAddSection() {

    /* Date */

    const dateInput = document.getElementById("date-input");
    const dateLabel = document.getElementById("date-label");

    setDateCurrent(dateInput);

    /* Distance */

    const distanceInput = document.getElementById("distance-input");

    distanceInput.addEventListener("input", updateDistance);
    updateDistance();

    /* Time */

    const timeInput = document.getElementById("time-input");
    const timeLabel = document.getElementById("time-label");

    timeInput.addEventListener("change", () => {
        let value = timeInput.value;
        let parts = value.split(" ");

        while (true) { // remove empty strings
            let i = parts.indexOf("");
            if (i == -1) break;
            parts.splice(i, 1);
        }

        let valid = true;
        let numbers = [];

        if (parts.length !== 3) { // check length
            valid = false;
        } else { // check that all are integers
            for (let i = 0; i < parts.length; i++) {
                let n = parseInt(parts[i]);

                if (isNaN(n)) {
                    valid = false;
                    break;
                }

                numbers.push(n);
            }
        }
        if (valid) {
            timeInput.value = `${numbers[0]}h ${numbers[1]}m ${numbers[2]}s`;
        } else {
            timeInput.value = null;
        }
    });

    /* Description */

    const descriptionInput = document.getElementById("description-input");

    /* Add */

    const addButton = document.getElementById("add-button");
    let used = false;

    addButton.addEventListener("click", () => {
        if (used) return;

        let missingRequired = false;
        let dateInputValue = dateInput.value;

        if (dateInputValue == null || dateInputValue.length === 0) {
            dateLabel.classList.add("required");
            missingRequired = true;
        }
        
        const time = hmsToSeconds(timeInput.value);

        if (time == null) {
            timeLabel.classList.add("required");
            missingRequired = true;
        }
        if (missingRequired) {
            return;
        }

        const user = getEmail();
        const date = new Date(dateInputValue);
        const distance = parseInt(distanceInput.value);
        const description = descriptionInput.value;

        used = true;
        document.getElementById("success-prompt").style.display = "block";

        fetch("/database-add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                range: "Runs!A2:E",
                values: [
                    [user, date, distance, time, description]
                ]
            })
        });

        window.location.reload();
    });
}

window.addEventListener("load", () => {
    setupAddSection();
    addRows().then(totalDistance => {
        getTable().style.display = "table";

        // total distance display
        document.getElementById("total-distance-label").innerHTML = totalDistance + "m / 100000m";
        document.getElementById("total-distance-meter").value = totalDistance;
    })
});