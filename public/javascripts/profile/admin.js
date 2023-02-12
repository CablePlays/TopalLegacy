/* Runs */

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

function createRow(date, distance, time, description) {
    const tr = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.innerHTML = formatDate(date);
    tr.appendChild(dateCell);

    const distanceCell = document.createElement("td");
    distanceCell.innerHTML = distance + "m";
    tr.appendChild(distanceCell);

    const timeCell = document.createElement("td");
    timeCell.innerHTML = formatTime(time);
    tr.appendChild(timeCell);

    const descriptionCell = document.createElement("td");
    descriptionCell.innerHTML = description;
    tr.appendChild(descriptionCell);

    return tr;
}

async function loadRuns() {
    const profileUser = getProfileUser();
    const runRecordsTable = document.getElementById("run-records");

    const res = await fetch("/get-run-entries", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: profileUser
        })
    });

    const { entries } = await res.json();
    let totalDistance = 0;

    if (entries != null) {
        entries.forEach(entry => {
            const distance = parseInt(entry.distance);
            totalDistance += distance;
            const row = createRow(new Date(entry.date), distance, entry.time, entry.description);
            runRecordsTable.appendChild(row);
        });
    }

    document.getElementById("run-distance-label").innerHTML = `${totalDistance}m / 100000m`;
    document.getElementById("run-distance-meter").value = totalDistance;
    runRecordsTable.style.display = "table";
}

/* Awards */

async function setupAwards() {
    const awardsTable = document.getElementById("awards-table");
    const awards = [
        ["midmar_mile", "Midmar Mile"],
        ["polar_bear", "Polar Bear"],
        ["running", "Running"]
    ];

    const profileUser = getProfileUser();
    const completedAwards = await getAwards(profileUser);

    awards.forEach(award => {
        const id = award[0];
        const display = award[1];

        const tr = document.createElement("tr");
        let completed = completedAwards.includes(id);

        const awardCell = document.createElement("td");
        awardCell.innerHTML = display;
        tr.appendChild(awardCell);

        const statusCell = document.createElement("td");
        tr.appendChild(statusCell);

        const manageCell = document.createElement("td");
        manageCell.addEventListener("click", () => {
            completed = !completed;
            updateCompleted();

            let updating = {};
            updating[id] = completed;

            fetch("/set-awards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: profileUser,
                    awards: updating
                })
            });
        });
        tr.appendChild(manageCell);

        const updateCompleted = () => {
            manageCell.innerHTML = (completed ? "Revoke" : "Grant");
            statusCell.innerHTML = (completed ? "Yes" : "No");
        };

        updateCompleted();
        awardsTable.appendChild(tr);
    });

    awardsTable.style.display = "table";
}

/* Load */

window.addEventListener("load", () => {
    setupAwards();
    loadRuns();
});