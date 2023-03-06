const TABLE_HEADER_NAMES = {
    complete: "Completed",
    date: "Date",
    signer: "Signed By",
    toggle: "Manage"
}

/* Awards */

function createManagementRow(id, display, promptTextSupplier, endpoint, status, reload = false) {
    const complete = status.complete === true;
    const { date, signer } = status;
    const reloadText = "Reload to view";

    const tr = document.createElement("tr");

    if (display != null) {
        const displayCell = document.createElement("td");
        displayCell.innerHTML = display;
        tr.appendChild(displayCell);
    }

    const completeCell = document.createElement("td");
    completeCell.innerHTML = complete ? "Yes" : "No";
    tr.appendChild(completeCell);

    const dateCell = document.createElement("td");
    dateCell.innerHTML = (reload ? reloadText : (date == null) ? "N/A" : formatDate(date));
    tr.appendChild(dateCell);

    const signedByCell = document.createElement("td");
    signedByCell.innerHTML = (reload ? reloadText : signer?.name ?? "N/A");
    tr.appendChild(signedByCell);

    const toggleCell = document.createElement("td");
    toggleCell.innerHTML = (complete ? "Revoke" : "Grant");
    toggleCell.addEventListener("click", () => {
        const newComplete = !complete;

        promptConfirmation(promptTextSupplier(newComplete), () => {
            const newTr = createManagementRow(id, display, promptTextSupplier, endpoint, { complete: newComplete }, newComplete);
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
    });
    tr.appendChild(toggleCell);

    return tr;
}

async function setupAwardsTable() {
    const awardsTable = document.getElementById("awards-table");

    const loading = createLoading(true);
    awardsTable.replaceWith(loading);

    awardsTable.appendChild(createTableHeaders([
        "Award", TABLE_HEADER_NAMES.complete, TABLE_HEADER_NAMES.date, TABLE_HEADER_NAMES.signer, TABLE_HEADER_NAMES.toggle
    ]));

    const userAwardData = await getAwards(getProfileUser());

    AWARDS.forEach(award => {
        const [id, display] = award;
        const data = userAwardData[id] ?? {};

        const tr = createManagementRow(id, display,
            c => c ? `You're about to grant this user the ${display} Award.`
                : `You're about to revoke the ${display} Award from this user.`,
            "/set-award", data);

        awardsTable.appendChild(tr);
    });

    loading.replaceWith(awardsTable);
}

/* Sections */

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
    const div = document.createElement("div");
    const profileUser = getProfileUser();

    setupSection("Rock Climbing", div, async () => {

        /* Belayer Signoff Header */

        const belayerSignoffHeader = document.createElement("h3");
        belayerSignoffHeader.innerHTML = "Belayer Sign-Off";

        div.appendChild(belayerSignoffHeader);
        div.appendChild(createSpacer(20));

        /* Belayer Signoff Table */

        const belayerSignoffLoading = createLoading(true);
        div.appendChild(belayerSignoffLoading);
        div.appendChild(createSpacer(20));

        const belayerSignoffTable = createTable([
            TABLE_HEADER_NAMES.complete, TABLE_HEADER_NAMES.date, TABLE_HEADER_NAMES.signer, TABLE_HEADER_NAMES.toggle
        ]);

        belayerSignoffTable.classList.add("alternating");
        belayerSignoffTable.classList.add("management-table");

        const belayerSignoffPromise = fetch("/get-rock-climbing-belayer-signoff", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: profileUser
            })
        });

        belayerSignoffPromise.then(async res => {
            const { value } = await res.json();
            const tr = createManagementRow(undefined, undefined,
                c => c ? "You are about to grant this user the belayer sign-off."
                    : "You are about to revoke the belayer sign-off from this user.",
                "/set-rock-climbing-belayer-signoff", value);

            belayerSignoffTable.appendChild(tr);
            belayerSignoffLoading.replaceWith(belayerSignoffTable);
        });

        /* Signoffs Header */

        const signoffsHeader = document.createElement("h3");
        signoffsHeader.innerHTML = "Sign-Offs";
        div.appendChild(signoffsHeader);
        div.appendChild(createSpacer(20));

        /* Signoffs Table */

        const signoffsLoading = createLoading(true);
        div.appendChild(signoffsLoading);

        const signoffsTable = document.createElement("table");
        const headers = [
            "Description",
            TABLE_HEADER_NAMES.complete,
            TABLE_HEADER_NAMES.date,
            TABLE_HEADER_NAMES.signer,
            TABLE_HEADER_NAMES.toggle
        ];
        signoffsTable.appendChild(createTableHeaders(headers));
        signoffsTable.classList.add("alternating");
        signoffsTable.classList.add("management-table");

        const signoffsPromise = fetch("/get-rock-climbing-signoffs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: profileUser
            })
        });

        signoffsPromise.then(async res => {
            const { values } = await res.json();

            ROCK_CLIMBING_SIGNOFFS.forEach(category => {
                const [sectionName, items] = category;

                const titleRow = document.createElement("tr");
                const titleCell = document.createElement("th");
                titleCell.colSpan = headers.length;
                titleCell.innerHTML = sectionName;
                titleRow.append(titleCell);
                signoffsTable.appendChild(titleRow);

                items.forEach(item => {
                    const [id, display] = item;
                    const data = values[id] ?? {};
                    const tr = createManagementRow(id, display,
                        c => c ? "You're about to grant this user a rock climbing sign-off."
                            : "You're about to revoke a rock climbing sign-off from this user.",
                        "/set-rock-climbing-signoff", data);

                    signoffsTable.appendChild(tr);
                });
            });

            signoffsLoading.replaceWith(signoffsTable);
        });
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