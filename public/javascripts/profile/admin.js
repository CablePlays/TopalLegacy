const _TABLE_HEADER_NAMES = {
    complete: "Completed",
    date: "Date",
    signer: "Signed By",
    toggle: "Manage"
}

function createManagementRow(options) {
    const { display, endpoint, id, promptTextSupplier, reloadToView, signoffType, status } = options;
    const { complete, date, signer } = status ?? {};
    const reloadText = "Reload to view";

    const tr = document.createElement("tr");

    if (display != null) {
        createElement("td", tr, display);
    }

    createElement("td", tr, complete ? "Yes" : "No");
    createElement("td", tr, reloadToView ? reloadText : (date == null) ? MISSING_TEXT : formatDate(date));
    createElement("td", tr, reloadToView ? reloadText : signer?.name ?? MISSING_TEXT);
    createElement("td", tr, complete ? "Revoke" : "Grant").addEventListener("click", () => {
        const newComplete = !complete;

        promptConfirmation(promptTextSupplier(newComplete), () => {
            options.reloadToView = newComplete;
            options.status = { complete: newComplete };

            tr.replaceWith(createManagementRow(options));

            post(endpoint, {
                complete: newComplete,
                id,
                type: signoffType,
                user: getProfileUser()
            });
        });
    });

    return tr;
}

/* Awards*/

async function setupAwardsTable() {
    const awardsTable = document.getElementById("awards-table");

    const loading = createLoading(true);
    awardsTable.replaceWith(loading);

    awardsTable.appendChild(createTableHeaders([
        "Award", _TABLE_HEADER_NAMES.complete, _TABLE_HEADER_NAMES.date, _TABLE_HEADER_NAMES.signer, _TABLE_HEADER_NAMES.toggle
    ]));

    const userAwardData = await getAwards(getProfileUser());

    AWARDS.forEach(award => {
        const [id, display] = award;
        const data = userAwardData[id] ?? {};

        const tr = createManagementRow({
            display,
            id,
            promptTextSupplier: c => c ? `You're about to grant this user the ${display} Award.`
                : `You're about to revoke the ${display} Award from this user.`,
            endpoint: "/set-award",
            status: data
        });

        awardsTable.appendChild(tr);
    });

    loading.replaceWith(awardsTable);
}

/* Sections */

const dropdownSections = []; // [visible, toggle]

function createSection(title, element, load) {
    const section = document.createElement("div");
    let loaded = false;

    /* Top */

    const topDiv = createElement("div", section);
    topDiv.classList.add("dropdown-section-top");

    // title
    createElement("h2", topDiv, title);
    // arrow
    createElement("img", topDiv).src = "/images/dropdown-arrow.png";

    /* Spacer */

    section.appendChild(createSpacer(20));

    /* Bottom */

    const e = createElement("div", section);
    bottomDiv.appendChild(element);

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

function createFlexibleRDSection(title, recordType, singleton) {
    const placeholder = document.createElement("div");

    createSection(title, placeholder, () => {
        createFlexibleRD({
            placeholder,
            recordType,
            removable: false,
            singleton,
            targetUser: getProfileUser()
        });
    });
}

function createTableRDSection(title, recordType) {
    const placeholder = document.createElement("div");

    createSection(title, placeholder, () => {
        createTableRD({
            placeholder,
            recordType,
            removable: false,
            targetUser: getProfileUser()
        });
    });
}

function setupRockClimbingSection() {
    const div = document.createElement("div");
    const profileUser = getProfileUser();

    createSection("Rock Climbing", div, async () => {

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
            _TABLE_HEADER_NAMES.complete, _TABLE_HEADER_NAMES.date, _TABLE_HEADER_NAMES.signer, _TABLE_HEADER_NAMES.toggle
        ]);

        belayerSignoffTable.classList.add("alternating");
        belayerSignoffTable.classList.add("management-table");

        post("/get-rock-climbing-belayer-signoff", {
            user: profileUser
        }).then(async res => {
            const { value } = res;
            const tr = createManagementRow({
                promptTextSupplier: c => c ? "You are about to grant this user the belayer sign-off."
                    : "You are about to revoke the belayer sign-off from this user.",
                endpoint: "/set-rock-climbing-belayer-signoff",
                status: value
            });

            belayerSignoffTable.appendChild(tr);
            belayerSignoffLoading.replaceWith(belayerSignoffTable);
        });

        /* Signoffs Header */

        createElement("h3", div, "Sign-Offs");
        div.appendChild(createSpacer(20));

        /* Signoffs Table */

        const signoffsLoading = createLoading(true);
        div.appendChild(signoffsLoading);

        const signoffsTable = document.createElement("table");
        const headers = [
            "Description",
            _TABLE_HEADER_NAMES.complete,
            _TABLE_HEADER_NAMES.date,
            _TABLE_HEADER_NAMES.signer,
            _TABLE_HEADER_NAMES.toggle
        ];
        signoffsTable.appendChild(createTableHeaders(headers));
        signoffsTable.classList.add("alternating");
        signoffsTable.classList.add("management-table");

        const signoffsPromise = post("/get-signoffs", {
            type: "rockClimbing",
            user: profileUser
        });

        signoffsPromise.then(async res => {
            const { values } = res;

            ROCK_CLIMBING_SIGNOFFS.forEach(category => {
                const [sectionName, items] = category;

                const titleRow = createElement("tr", signoffsTable);
                createElement("th", titleRow, sectionName).colSpan = headers.length;

                items.forEach(item => {
                    const [id, display] = item;
                    const data = values[id] ?? {};

                    const tr = createManagementRow({
                        display,
                        id,
                        promptTextSupplier: c => c ? "You're about to grant this user a rock climbing sign-off."
                            : "You're about to revoke a rock climbing sign-off from this user.",
                        endpoint: "/set-signoff",
                        signoffType: "rockClimbing",
                        status: data
                    });

                    signoffsTable.appendChild(tr);
                });
            });

            signoffsLoading.replaceWith(signoffsTable);
        });
    });
}

function setupSections() {
    createTableRDSection("Endurance Records", "endurance");
    createTableRDSection("Midmar Mile Training", "midmarMile");
    createFlexibleRDSection("Mountaineering Records", "mountaineering");
    setupRockClimbingSection();
    createTableRDSection("Running Records", "running");
    createTableRDSection("Service Records", "service");
    createFlexibleRDSection("Solitaire Record", "solitaire", true);
}

/* Load */

window.addEventListener("load", () => {
    setupAwardsTable();
    setupSections();
});