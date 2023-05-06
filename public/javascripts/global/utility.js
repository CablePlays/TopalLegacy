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
    ["endurance", "Endurance"], ["enduranceInstructor", "Endurance Instructor"], ["enduranceLeader", "Endurance Leader"],
    ["kayaking", "Kayaking"],
    ["midmarMile", "Midmar Mile"], ["midmarMileInstructor", "Midmar Mile Instructor"], ["midmarMileLeader", "Midmar Mile Leader"],
    ["mountainBiking", "Mountain Biking"],
    ["mountaineeringInstructor", "Mountainering Instructor"], ["mountaineeringLeader", "Mountainering Leader"],
    ["polarBear", "Polar Bear"], ["polarBearInstructor", "Polar Bear Instructor"], ["polarBearLeader", "Polar Bear Leader"],
    ["rockClimbing", "Rock Climbing"],
    ["running", "Running"],
    ["service", "Service"], ["serviceInstructor", "Service Instructor"], ["serviceLeader", "Service Leader"],
    ["solitaire", "Solitaire"], ["solitaireInstructor", "Solitaire Instructor"], ["solitaireLeader", "Solitaire Leader"],
    ["summit", "Summit"],
    ["traverse", "Traverse"],
    ["venture", "Venture"]
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

/* Formatting */

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

function formatTime(time) {
    let [hour, minute] = time.split(":");
    let period;

    if (hour < 12) {
        period = "am";

        if (hour === "0") {
            hour = 12;
        }
    } else {
        period = "pm";

        if (hour !== "12") {
            hour -= 12;
        }
    }

    let format = `${hour}:${minute}${period}`;
    return format;
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

/* Element */

function removeChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
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