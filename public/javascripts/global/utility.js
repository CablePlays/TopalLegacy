/* Text */
const LOADING_TEXT = "Loading...";
const MISSING_TEXT = "N/A";

/* Images */
const IMAGE_ADMIN = "/images/admin-icon.gif";
const IMAGE_CHECKBOX_CHECKED = "/images/checked.png";
const IMAGE_CHECKBOX_UNCHECKED = "/images/unchecked.png";
const IMAGE_LOADING = "/images/loading.gif";

const AWARDS = [
    ["drakensberg", "Drakensberg"],
    ["endurance", "Endurance"],
    ["kayaking", "Kayaking"],
    ["midmarMile", "Midmar Mile"],
    ["mountainBiking", "Mountain Biking"],
    ["polarBear", "Polar Bear"],
    ["rockClimbing", "Rock Climbing"],
    ["running", "Running"],
    ["service", "Service"],
    ["solitaire", "Solitaire"],
    ["summit", "Summit"],
    ["traverse", "Traverse"],
    ["venture", "Venture"],
];

const PERMISSIONS = [
    ["manageAwards", "Manage Awards"],
    ["managePermissions", "Manage Permissions"],
    ["viewLogs", "View Logs"]
];

function getAwardName(id) {
    for (let award of AWARDS) {
        if (award[0] === id) {
            return award[1];
        }
    }

    return null;
}

const ROCK_CLIMBING_SIGNOFFS = [
    [
        "Knots",
        [
            ["knots1", "Threaded figure of eight, tied off"],
            ["knots2", "Figure of eight in a bight"],
            ["knots3", "Tape knot"],
            ["knots4", "Double fisherman's knot"]
        ]
    ],
    [
        "Harness",
        [
            ["harness1", "Purpse and use of all types"],
            ["harness2", "Doubling back of straps"],
            ["harness3", "Knowledge of appropriate tie-in / belay points"],
            ["harness4", "Calls (belayer, climber, slack/tight rope)"],
            ["harness5", "Rope usage - 9mm, 11mm - static, dynamic"],
            ["harness6", "Rope coiling"],
            ["harness7", "Rope care (sun, sand, abrasion)"],
        ]
    ],
    [
        "Belaying",
        [
            ["belaying1", "ATC"],
            ["belaying2", "Figure of eight (11mm & 9mm ropes)"],
            ["belaying3", "Sticht plate"],
            ["belaying4", "Belaying a lead climber"],
            ["belaying5", "Arrest and hold a fall correctly"],
            ["belaying6", "Safety checks (knot, harness, karabiner locked, helmet)"],
            ["belaying7", "Demonstrate the ability of spotting technique"],
            ["belaying8", "Two climbs on Neil Solomon wall (one on each side)"],
            ["belaying9", "Two different climbs on inside wall (excluding overhangs)"],
            ["belaying10", "Low traverse - external wall (record your time)"],
            ["belaying11", "Chimneying - external wall internal climb (set at second notch or steeper, or roof)"],
        ]
    ],
    [
        "Wall Lead Climb",
        [
            ["wallLeadClimb1", "Placing quick draws"],
            ["wallLeadClimb2", "Clipping"],
            ["wallLeadClimb3", "Lowering off chains"],
        ]
    ],
    [
        "Abseiling",
        [
            ["abseiling1", "Figure of eight"],
            ["abseiling2", "ATC"],
            ["abseiling3", "Stance (abseiling position)"],
        ]
    ],
    [
        "Final Tests",
        [
            ["finalTests1", "Theory test (based on <i>Reach Beyond</i>)"],
            ["finalTests2", "One abseil (on real rock)"],
            ["finalTests3", "Two climbs (on real rock)"]
        ]
    ]
];

function removeChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
}

function formatDate(date) {
    if (typeof date === "string") {
        date = new Date(date);
    }

    let day = date.getDate() + "";
    if (day.length === 1) day = "0" + day;

    let month = date.getMonth() + 1 + "";
    if (month.length === 1) month = "0" + month;

    return `${day}/${month}/${date.getFullYear()}`;
}

function formatDuration(seconds, showSeconds = true) {
    let h = Math.floor(seconds / 3600);
    seconds -= h * 3600;

    let m = Math.floor(seconds / 60);
    let s = seconds - m * 60;

    let formatted = `${h}h ${m}m`;

    if (showSeconds === true) {
        formatted += ` ${s}s`;
    }

    return formatted;
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

function createTableHeaders(headers) {
    const tr = document.createElement("tr");

    headers.forEach(title => {
        const th = document.createElement("th");
        th.innerHTML = title;
        tr.appendChild(th);
    })

    return tr;
}

function createTable(headers) {
    const table = document.createElement("table");
    table.appendChild(createTableHeaders(headers));
    return table;
}

function checkboxImage(checked) {
    return (checked ? IMAGE_CHECKBOX_CHECKED : IMAGE_CHECKBOX_UNCHECKED);
}

function createCheckbox(condition) {
    const checkbox = document.createElement("img");

    if (typeof condition === "boolean") {
        checkbox.src = checkboxImage(condition);
    } else { // assume promise
        checkbox.src = IMAGE_LOADING;
        condition.then(val => checkbox.src = checkboxImage(val));
    }

    return checkbox;
}

function createLoading(center = false) {
    const loading = document.createElement("img");
    loading.src = IMAGE_LOADING;
    loading.classList.add("loading");

    if (center) {
        loading.classList.add("center");
    }

    return loading;
}

function createSpacer(space) {
    const div = document.createElement("div");
    div.classList.add("spacer");
    div.classList.add("v" + space);
    return div;
}

function createElement(type, parentElement, consumer) {
    const element = document.createElement(type);

    if (typeof consumer === "string") {
        element.innerHTML = consumer;
    } else if (typeof consumer === "function") {
        consumer(element);
    }

    parentElement.appendChild(element);
    return element;
}