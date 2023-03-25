/*
    Handles displaying a list of sign-offs.
*/

const _signoffs = {
    drakensberg: [
        ["pitchTent", "Competent to pitch a tent"],
        ["cooker", "Can use a storm cooker"],
        ["ecologicalAwareness", "Ecological awareness"],
        ["backPack", "Able to pack a back pack"]
    ],
    kayaking: [
        ["timeTrial", "Time trial"],
        ["circuits", "Figure of 8 slalom circuits"],
        ["noviceKayakingTest", "Novice kayaking test"],
        ["safetyChecks", "Safety and equipment checks"],
        ["mooiRiverStretch", "One stretch of the Mooi River"],
        ["theoryTest", "Passed theory test"],
        ["riverSafetyTest", "Basic river safety test"]
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

function getSignoffs(signoffType) {
    return _signoffs[signoffType];
}

function hasHeadings(signoffs) {
    return Array.isArray(signoffs[0][1]);
}

function createSignoffDisplay(options) {
    const {
        additions,
        placeholder,
        type
    } = options;

    const items = getSignoffs(type);
    const headings = hasHeadings(items);

    const valuesPromise = new Promise(async r => {
        const res = await post("/get-signoffs", {
            type,
            user: getUserId()
        });

        r(res.values);
    });

    const table = document.createElement("table");
    table.classList.add("signoff-display");

    function addLine() {
        const tr = createElement("tr", table);
        createElement("td", tr).classList.add("line");
    }

    function createItems(items) {
        if (!headings) {
            addLine();
        }

        items.forEach(item => {
            const [id, description] = item;
            const completePromise = new Promise(async r => r((await valuesPromise)[id]?.complete === true));

            const itemRow = createElement("tr", table);

            createElement("td", itemRow, description);

            createElement("td", itemRow, e => {
                e.appendChild(createCheckbox(completePromise));
            });

            createElement("td", itemRow, e => {
                valuesPromise.then(values => {
                    const date = values[id]?.date;

                    if (date != null) {
                        e.innerHTML = formatDate(date);
                    }
                });
            });

            /* Line */

            addLine();
        });
    };

    if (headings === true) {
        for (let item of items) {
            const [groupHeading, groupItems] = item;

            createElement("tr", table, e => {
                createElement("th", e, groupHeading);
            });

            const addition = additions?.[groupHeading];

            if (addition != null) {
                createElement("tr", table, addition);
            }

            createItems(groupItems);
        }
    } else {
        createItems(items);
    }

    /* Placeholder */

    if (placeholder != null) {
        ensureElement(placeholder).replaceWith(table);
    }

    return table;
}