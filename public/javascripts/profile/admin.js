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

function createSignoffTable(options) {
    const {
        container,
        signoffType,
        promptTextSupplier = c => c ? "You're about to grant this user a sign-off." : "You're about to revoke a sign-off from this user."
    } = options;

    const items = getSignoffs(signoffType);

    const loadingElement = createLoading(true);
    container.appendChild(loadingElement);

    const table = document.createElement("table");
    const headings = [
        "Description",
        _TABLE_HEADER_NAMES.complete,
        _TABLE_HEADER_NAMES.date,
        _TABLE_HEADER_NAMES.signer,
        _TABLE_HEADER_NAMES.toggle
    ];
    table.appendChild(createTableHeaders(headings));
    table.classList.add("alternating");
    table.classList.add("management-table");

    post("/get-signoffs", {
        type: signoffType,
        user: getProfileUser()
    }).then(res => {
        const { values } = res;

        function createItemRows(item) {
            const [id, display] = item;
            const status = values[id] ?? {};

            const tr = createManagementRow({
                display,
                id,
                promptTextSupplier,
                endpoint: "/set-signoff",
                signoffType,
                status
            });

            table.appendChild(tr);
        }

        if (hasHeadings(items)) {
            items.forEach(group => {
                const [groupHeading, groupItems] = group;

                const titleRow = createElement("tr", table);
                createElement("th", titleRow, groupHeading).colSpan = headings.length;

                groupItems.forEach(createItemRows);
            });
        } else {
            items.forEach(createItemRows);
        }

        loadingElement.replaceWith(table);
    });
}

function createApprovalTable(options) {
    const {
        approvalId, container,
        promptTextSupplier = c => c ? "You're about to grant this user a sign-off." : "You're about to revoke a sign-off from this user."
    } = options;

    const loadingElement = createLoading(true);
    container.appendChild(loadingElement);

    const table = document.createElement("table");
    const headings = [
        _TABLE_HEADER_NAMES.complete,
        _TABLE_HEADER_NAMES.date,
        _TABLE_HEADER_NAMES.signer,
        _TABLE_HEADER_NAMES.toggle
    ];
    table.appendChild(createTableHeaders(headings));
    table.classList.add("alternating");
    table.classList.add("management-table");

    post("/get-approval", {
        id: approvalId,
        user: getProfileUser()
    }).then(async res => {
        const { status } = res;

        const tr = createManagementRow({
            id: approvalId,
            promptTextSupplier,
            endpoint: "/set-approval",
            status: status
        });

        table.appendChild(tr);
        loadingElement.replaceWith(table);
    });
}

/* Sections */

const dropdownSections = []; // [visible, toggle]

function createSection(title, load) {
    const section = document.createElement("div");
    let loaded = false;

    /* Top */

    const topDiv = createElement("div", section);
    topDiv.classList.add("dropdown-section-top");

    // title
    createElement("h2", topDiv, title);
    // arrow
    const arrow = createElement("img", topDiv);
    arrow.src = "/images/dropdown-arrow.png";

    /* Spacer */

    section.appendChild(createSpacer(20));

    /* Bottom */

    const bottomDiv = createElement("div", section);
    const container = document.createElement("div");
    bottomDiv.appendChild(container);

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
                loaded = true;
                load(container);
            }
        }

        data[0] = visible;
        toggle(visible);
    });

    /* Section */

    document.getElementById("sections-container").appendChild(section);
    dropdownSections.push(data);
}

function setupSections() {
    createSection("Drakensberg", div => {
        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "drakensberg"
        });
    });

    createSection("Endurance", div => {
        createElement("h3", div, "Records");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableRD({
            recordType: "endurance",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Endurance Instructor", div => {
        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "enduranceInstructor"
        });
    });

    createSection("Kayaking", div => {

        /* Signoffs */

        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "kayaking"
        });

        /* Flat Water Paddling Records */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Flat Water Paddling Records");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableRD({
            recordType: "flatWaterPaddling",
            removable: false,
            targetUser: getProfileUser()
        }));

        /* River Trip Records */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "River Trip Records");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleRD({
            recordType: "riverTrip",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Kayaking Instructor", div => {
        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "kayakingInstructor"
        });
    });

    createSection("Midmar Mile", div => {
        createElement("h3", div, "Training Records");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableRD({
            recordType: "midmarMile",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Mountaineering Records", div => {
        div.appendChild(createFlexibleRD({
            recordType: "mountaineering",
            removable: false,
            targetUser: getProfileUser()
        }));
    });

    createSection("Mountaineering Instructor", div => {
        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "mountaineeringInstructor"
        });
    });

    createSection("Rock Climbing", div => {

        /* Belayer Signoff */

        createElement("h3", div, "Belayer Sign-Off");

        div.appendChild(createSpacer(20));

        createApprovalTable({
            approvalId: "rockClimbingBelayer",
            container: div
        });

        /* Signoffs */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "rockClimbing"
        });

        /* Records */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Records");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleRD({
            recordType: "rockClimbing",
            removable: false,
            targetUser: getProfileUser()
        }));
    });

    createSection("Running", div => {
        createElement("h3", div, "Records");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableRD({
            recordType: "running",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Service", div => {
        createElement("h3", div, "Records");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableRD({
            recordType: "service",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Solitaire", div => {
        createElement("h3", div, "Record");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleRD({
            recordType: "solitaire",
            removable: false,
            signable: true,
            singleton: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Solitaire Instructor", div => {
        createElement("h3", div, "Record");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleRD({
            recordType: "solitaireInstructor",
            removable: false,
            signable: true,
            singleton: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Solitaire Leader", div => {
        createElement("h3", div, "Record");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleRD({
            recordType: "solitaireLeader",
            removable: false,
            signable: true,
            singleton: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Summit", div => {
        createElement("h3", div, "Records");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "summit"
        });
    });

    createSection("Traverse", div => {

        /* Signoffs */

        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "traverse"
        });

        /* Accident Summaries */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Accident Summaries");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleRD({
            recordType: "traverseSummaries",
            removable: false,
            singleton: true,
            targetUser: getProfileUser()
        }));

        /* Hike Plan */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Hike Plan");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleRD({
            recordType: "traverseHikePlan",
            removable: false,
            singleton: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Venture Award", div => {
        createElement("h3", div, "Proposal Approved");

        div.appendChild(createSpacer(20));

        createApprovalTable({
            approvalId: "ventureProposal",
            container: div
        });
    });
}

/* Load */

window.addEventListener("load", () => {
    setupAwardsTable();
    setupSections();
});