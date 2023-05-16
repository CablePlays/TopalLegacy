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