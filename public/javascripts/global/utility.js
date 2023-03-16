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

    if (typeof consumer === "function") {
        consumer(element);
    } else if (consumer != null) {
        element.innerHTML = consumer;
    }

    if (parentElement != null) {
        parentElement.appendChild(element);
    }

    return element;
}

function ensureElement(elementOrId) {
    return (typeof elementOrId === "string") ? document.getElementById(elementOrId) : elementOrId;
}