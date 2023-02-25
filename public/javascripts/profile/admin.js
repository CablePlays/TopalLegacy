/* Awards */

function createManagementRow(id, display, endpoint, data, reload) {
    const complete = data.complete === true;
    const { date, signer } = data;
    const reloadText = "Reload to view";

    const tr = document.createElement("tr");

    const displayCell = document.createElement("td");
    displayCell.innerHTML = display;
    tr.appendChild(displayCell);

    const completeCell = document.createElement("td");
    completeCell.innerHTML = complete ? "Yes" : "No";
    tr.appendChild(completeCell);

    const dateCell = document.createElement("td");
    dateCell.innerHTML = (reload ? reloadText : (date == null) ? "N/A" : formatDate(date));
    tr.appendChild(dateCell);

    const signedByCell = document.createElement("td");
    signedByCell.innerHTML = (reload ? reloadText : signer ?? "N/A");
    tr.appendChild(signedByCell);

    const toggleCell = document.createElement("td");
    toggleCell.innerHTML = (complete ? "Revoke" : "Grant");
    toggleCell.addEventListener("click", () => {
        const newComplete = !complete;

        const newTr = createManagementRow(id, display, endpoint, { complete: newComplete }, newComplete);
        tr.replaceWith(newTr);

        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                complete: newComplete,
                id,
                user: getProfileUser(),
            })
        });
    });
    tr.appendChild(toggleCell);

    return tr;
}

async function setupAwardsTable() {
    const awardsTable = document.getElementById("awards-table");

    const loading = createLoading(true);
    awardsTable.parentElement.insertBefore(loading, awardsTable);

    const profileUser = getProfileUser();
    const completedAwards = await getAwards(profileUser);

    loading.remove();

    AWARDS.forEach(award => {
        const [id, display] = award;
        const data = completedAwards[id] ?? {};
        const tr = createManagementRow(id, display, "/set-award", data);

        awardsTable.appendChild(tr);
    });

    awardsTable.style.display = "table";
}

/* Records */

const dropdownSections = []; // [visible, toggle]

function setupSection(title, element, load) {
    const section = document.createElement("div");
    let loaded = false;

    /* Top */

    const topDiv = document.createElement("div");
    topDiv.classList.add("dropdown-section-top");

    // title
    const titleElement = document.createElement("h2");
    titleElement.innerHTML = title;
    topDiv.appendChild(titleElement);

    // arrow
    const arrow = document.createElement("img");
    arrow.src = "/images/dropdown-arrow.png";
    topDiv.appendChild(arrow);

    section.appendChild(topDiv);

    /* Spacer */

    section.appendChild(createSpacer(20));

    /* Bottom */

    const bottomDiv = document.createElement("div");

    bottomDiv.appendChild(element);
    section.appendChild(bottomDiv);

    section.appendChild(createSpacer(40));

    /* Toggle */

    const toggle = visible => {
        if (visible) {
            arrow.classList.add("rotated");
            bottomDiv.style.display = "block";
        } else {
            arrow.classList.remove("rotated");
            bottomDiv.style.display = "none";
        }
    }

    toggle(false);

    const data = [false, toggle];

    /* Click */

    topDiv.addEventListener("click", () => {
        const visible = !data[0];

        if (visible) {
            dropdownSections.forEach(dropdownSection => { // close other dropdown sections
                if (dropdownSection !== data && dropdownSection[0]) {
                    dropdownSection[0] = false;
                    dropdownSection[1](false);
                }
            });

            if (!loaded) { // load
                if (load != null) load();
                loaded = true;
            }
        }

        data[0] = visible;
        toggle(visible);
    });

    /* Section */

    document.getElementById("sections-container").appendChild(section);
    dropdownSections.push(data);
}

function setupRecordsSection(title, recordType) {
    const placeholder = document.createElement("div");

    setupSection(title, placeholder, () => {
        loadRecords(placeholder, recordType, getProfileUser(), false);
    });
}

function setupRockClimbingSection() {
    const table = document.createElement("table");

    setupSection("Rock Climbing Sign-Offs", table, async () => {
        const loading = createLoading(true);
        table.replaceWith(loading);

        const headers = ["Description", "Completed", "Date", "Signed By", "Manage"];
        table.appendChild(createTableHeader(headers));
        table.classList.add("alternating");
        table.classList.add("management-table");

        const res = await fetch("/get-rock-climbing-signoffs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: getProfileUser()
            })
        });

        const values = (await res.json()).values;

        ROCK_CLIMBING_SIGNOFFS.forEach(signoff => {
            const [sectionName, items] = signoff;

            const titleRow = document.createElement("tr");
            const titleCell = document.createElement("th");
            titleCell.colSpan = headers.length;
            titleCell.innerHTML = sectionName;
            titleRow.append(titleCell);
            table.appendChild(titleRow);

            items.forEach(item => {
                const [id, display] = item;
                const data = values[id] ?? {};
                const tr = createManagementRow(id, display, "/set-rock-climbing-signoff", data);

                table.appendChild(tr);
            })
        });

        loading.replaceWith(table);
    });
}

function setupSections() {
    setupRecordsSection("Endurance Records", "endurance");
    setupRockClimbingSection();
    setupRecordsSection("Running Records", "running");
    setupRecordsSection("Service Records", "service");
}

/* Load */

window.addEventListener("load", () => {
    setupAwardsTable();
    setupSections();
});