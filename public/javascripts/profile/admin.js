const _TABLE_HEADER_NAMES = {
    complete: "Completed",
    date: "Date",
    signer: "Signed By",
    toggle: "Manage"
}

function createManagementRow(options) {
    const { display, setComplete, promptTextSupplier, reloadToView, status } = options;
    const { complete, date, signer } = status ?? {};
    const reloadText = "Reload to view";

    const tr = document.createElement("tr");

    if (display != null) {
        createElement("td", tr, display);
    }

    createElement("td", tr, complete ? "Yes" : "No");
    createElement("td", tr, reloadToView ? reloadText : (date == null) ? MISSING_TEXT : formatDate(date));
    createElement("td", tr, reloadToView ? reloadText : signer?.fullName ?? MISSING_TEXT);
    createElement("td", tr, complete ? "Revoke" : "Grant").addEventListener("click", () => {
        const newComplete = !complete;

        promptConfirmation(promptTextSupplier(newComplete), () => {
            options.reloadToView = newComplete;
            options.status = { complete: newComplete };

            setComplete(newComplete);
            tr.replaceWith(createManagementRow(options));
        });
    });

    return tr;
}

async function setupAwardsTable() {
    const awardsTable = document.getElementById("awards-table");

    const loading = createLoadingIcon();
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
            setComplete: complete => putRequest(`/users/${getProfileUser()}/awards`, {
                award: id,
                complete
            }),
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
        promptTextSupplier = c => c ? "You're about to grant this user a sign-off."
            : "You're about to revoke a sign-off from this user."
    } = options;

    const items = SIGNOFFS[signoffType];

    const loadingElement = createLoadingIcon();
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

    getRequest(`/users/${getProfileUser()}/signoffs?type=${signoffType}`).then(res => {
        const { signoffs } = res;

        function createItemRows(item) {
            const [id, display] = item;
            const status = signoffs[id] ?? {};

            const tr = createManagementRow({
                display,
                promptTextSupplier,
                setComplete: complete => putRequest(`/users/${getProfileUser()}/signoffs`, {
                    type: signoffType,
                    signoff: id,
                    complete
                }),
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

    const loadingElement = createLoadingIcon();
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

    getRequest(`/users/${getProfileUser()}/approvals`).then(async res => {
        const { approvals } = res;
        const status = approvals[approvalId] ?? {};

        const tr = createManagementRow({
            promptTextSupplier,
            status,
            setComplete: complete => putRequest(`/users/${getProfileUser()}/approvals`, {
                approval: approvalId,
                complete
            }),
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
    arrow.src = "/assets/icons/arrow.png";

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
        createElement("h3", div, "Logs");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableLD({
            logType: "endurance",
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

        /* Flat Water Paddling Logs */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Flat Water Paddling Logs");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableLD({
            logType: "flatWaterPaddling",
            removable: false,
            targetUser: getProfileUser()
        }));

        /* River Trip Logs */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "River Trip Logs");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleLD({
            logType: "riverTrip",
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
        createElement("h3", div, "Training Logs");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableLD({
            logType: "midmarMile",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Mountaineering Logs", div => {
        div.appendChild(createFlexibleLD({
            logType: "mountaineering",
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

        /* Logs */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Logs");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleLD({
            logType: "rockClimbing",
            removable: false,
            targetUser: getProfileUser()
        }));
    });

    createSection("Rock Climbing Instructor", div => {

        /* Book Reviews */

        createElement("h3", div, "Book Reviews");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleLD({
            logType: "rockClimbingBookReviews",
            removable: false,
            singleton: true,
            targetUser: getProfileUser()
        }));

        /* Signoffs */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "rockClimbingInstructor"
        });
    });

    createSection("Rock Climbing Leader", div => {
        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "rockClimbingLeader"
        });
    });

    createSection("Rock Climbing Instructor & Leader", div => {
        createElement("h3", div, "Instruction Logs");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableLD({
            logType: "rockClimbingInstruction",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Running", div => {
        createElement("h3", div, "Logs");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableLD({
            logType: "running",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Service", div => {
        createElement("h3", div, "Logs");

        div.appendChild(createSpacer(20));

        div.appendChild(createTableLD({
            logType: "service",
            removable: false,
            signable: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Solitaire", div => {
        createElement("h3", div, "Log");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleLD({
            logType: "solitaire",
            removable: false,
            signable: true,
            singleton: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Solitaire Instructor", div => {
        createElement("h3", div, "Log");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleLD({
            logType: "solitaireInstructor",
            removable: false,
            signable: true,
            singleton: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Solitaire Leader", div => {
        createElement("h3", div, "Log");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleLD({
            logType: "solitaireLeader",
            removable: false,
            signable: true,
            singleton: true,
            targetUser: getProfileUser()
        }));
    });

    createSection("Summit", div => {
        createElement("h3", div, "Logs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "summit"
        });
    });

    createSection("Traverse", div => {

        /* Accident Summaries */

        createElement("h3", div, "Accident Summaries");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleLD({
            logType: "traverseSummaries",
            removable: false,
            singleton: true,
            targetUser: getProfileUser()
        }));

        /* Hike Plan */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Hike Plan");

        div.appendChild(createSpacer(20));

        div.appendChild(createFlexibleLD({
            logType: "traverseHikePlan",
            removable: false,
            singleton: true,
            targetUser: getProfileUser()
        }));

        /* Signoffs */

        div.appendChild(createSpacer(20));

        createElement("h3", div, "Sign-Offs");

        div.appendChild(createSpacer(20));

        createSignoffTable({
            container: div,
            signoffType: "traverse"
        });
    });

    createSection("Venture", div => {
        createElement("h3", div, "Proposal");

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