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
    ["kayaking", "Kayaking"], ["kayakingInstructor", "Kayaking Instructor"], ["kayakingLeader", "Kayaking Leader"],
    ["midmarMile", "Midmar Mile"], ["midmarMileInstructor", "Midmar Mile Instructor"], ["midmarMileLeader", "Midmar Mile Leader"],
    ["mountaineeringInstructor", "Mountaineering Instructor"], ["mountaineeringLeader", "Mountaineering Leader"],
    ["polarBear", "Polar Bear"], ["polarBearInstructor", "Polar Bear Instructor"], ["polarBearLeader", "Polar Bear Leader"],
    ["rockClimbing", "Rock Climbing"], ["rockClimbingInstructor", "Rock Climbing Instructor"], ["rockClimbingLeader", "Rock Climbing Leader"],
    ["running", "Running"],
    ["service", "Service"], ["serviceInstructor", "Service Instructor"], ["serviceLeader", "Service Leader"],
    ["solitaire", "Solitaire"], ["solitaireInstructor", "Solitaire Instructor"], ["solitaireLeader", "Solitaire Leader"],
    ["summit", "Summit"],
    ["traverse", "Traverse"],
    ["venture", "Venture"], ["ventureLeader", "Venture Leader"]
];

const PERMISSIONS = [
    ["manageAwards", "Manage Awards"],
    ["managePermissions", "Manage Permissions"],
    ["viewLogs", "View Logs"]
];

const SIGNOFFS = {
    drakensberg: [
        ["pitchTent", "Competent to pitch a tent"],
        ["cooker", "Can use a storm cooker"],
        ["ecologicalAwareness", "Ecological awareness"],
        ["backPack", "Able to pack a back pack"]
    ],
    enduranceInstructor: [
        ["bothAwardsTwice", "Achieved both awards twice in two years"],
        ["readBook", "Read a book on training and is knowledgeable in training methods for one category of races"],
        ["instruct", "Practical ability to instruct a novice in basic training in running, MTB or AR - and has spent time doing so"],
        ["who", "Familiarity with <i>Who's Who</i> in current endurance sport (from reading of running magazines, internet, TV)"],
        ["firstAid", "First-aid training - or satisfies MIC of his or her familiarity with endurance problems and their treatment"],
        ["mentalAttitude", "Exhibits a healthy mental attitude towards the sport and towards others"],
        ["organisingEvents", "Performs voluntary service (either at Treverton or elsewhere) in administration and organizational roles - a minimum organizing three events"]
    ],
    kayaking: [
        ["timeTrial", "Time trial"],
        ["circuits", "Figure of 8 slalom circuits"],
        ["noviceKayakingTest", "Novice kayaking test"],
        ["safetyChecks", "Safety and equipment checks"],
        ["mooiRiver", "One stretch of the Mooi River"],
        ["theoryTest", "Passed theory test"],
        ["riverSafetyTest", "Basic river safety test"]
    ],
    kayakingInstructor: [
        ["mooiRiver", "Complete a minimum of six stretches of the Mooi River above 3km (medium to high water conditions)"],
        ["instruct", "Show practical ability to instruct under supervision"],
        ["attitude", "Have shown correct attitude"],
        ["skill", "Develop a high degree of skill"],
        ["knowledge", `Read at least one book on kayaking/canoeing and be able to show
        a breadth of knowledge to the MIC in conversation as well as in your instruction of others`],
        ["monitor", "Spend time acting as a duty equipment monitor in and around the boat shed"],
        ["rescue", "Demonstrate practical ability to rescue someone in the river - X-rescue, H-rescue & self-rescue"],
        ["firstAid", "Valid basic first aid and CPR training (level one)"]
    ],
    mountaineeringInstructor: [
        ["firstAid", "Valid basic First-Aid and CPR (level one)"],
        ["handling", "Proven practical ability to lead a berg trip with understanding of planning, route finding, advanced map reading as well as ability to handle people"],
        ["rescueProcedues", "Knowledge of rescue procedures (refer to Dragons Wrath or internet)"],
        ["history", "History of the Drakensberg (Barrier of Spears or other book) - able to give a two minute report"],
        ["ropeWork", "Holds a rock climbing award and is competent; able to demonstrate and explain rope work"],
        ["logs", "Has kept an accurate log of hikes and has shown ability in planning hikes as an assistant leader"]
    ],
    rockClimbing: [
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
    ],
    rockClimbingInstructor: [
        ["bookReviews", "Two book reviews (technical climbing)"],
        ["knots", "Demonstrate the use and ability of tying the following knots: MR8, clove hitch, Italian hitch, butterfly knot"],
        ["equipment", "Maintenance and care of equipment"],
        ["belays", "Set up at least three different belays at different locations, with anchors"],
        ["devices", "Demonstrate the correct and safe use of the following devices: chocks, nuts, wedges, friends and any other protection device(s)"],
        ["firstAid", "Valid basic First Aid and CPR (level 1)"],
        ["rescueTechniques", `Rescue Techniques: Solve problems by performing a lower;
       and demonstrate the ability to get into and out of a system (using direct and indirect belay systems)`],
        ["logs", "Maintenance of a clear log of climbs and instruction time"],
        ["attitude", "Correct attitude — responsibility, ability, helpfulness"],
        ["climbingGrade", "Practical climbing grade 16+ with sport climbing (minimum of 10 different climbs at two different locations)"],
        ["leadClimbsSport", "Protected lead climbs on rock placing protection (Sport) (at least 10 different climbs)"],
        ["leadClimbsTrad", "Protected lead climbs on rock placing protection (Trad) (at least 3 different climbs)"],
        ["traverse", "Low traverse on outside wall in less than 45 seconds"],
        ["protection", `Practical protection of climbs and setting up of multiple belays
       (e.g. set up and use top-top rope systems and bottom-top rope systems with anchors)`],
        ["ascendRope", "Demonstrate the ability to ascend a rope by using prusik"],
    ],
    rockClimbingLeader: [
        ["experience", "Considerable experience in instructing and lead climbing, and an attitude of service towards rock climbing and Outdoor Pursuits in general"],
        ["logs", "At least 25 hours of supervised instruction and a minumum of 30 climbs logged"],
        ["descriptions", "Demonstrate the ability to read and interpret route book descriptions"],
        ["hoist", "Demonstrate an assisted and unassisted hoist"],
        ["tangles", "Demonstrate the ability to handle jams, tangles and pendulums"],
        ["abseiling", "Demonstrate ability to set up a releasable abseil and supervise a group abseiling"]
    ],
    summit: [
        ["preparedness", "Passed hiking preparedness test"],
        ["mapReading", "Passed map reading test"],
        ["routeFinding", "Passed route finding test"]
    ],
    traverse: [
        ["summary", "Summary of facts"],
        ["hikePlan", "Detailed hike plan"]
    ]
};

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
    if (minute.length === 1) {
        minute = "0" + minute;
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

function insertAfter(newElement, targetElement) {
    const parent = targetElement.parentNode;

    if (parent.lastChild === targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}

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