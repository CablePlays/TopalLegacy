/*
    Handles displaying logs using either a list or a table.
*/

const _flexibleDisplayColumns = {
    // endurancef: [
    //     ["Date", log => formatDate(log.date)],
    //     ["Discipline", log => log.discipline],
    //     ["Distance", log => (log.distance / 1000) + "km"],
    //     ["Time", log => formatDuration(log.time)],
    //     ["Description", log => log.description]
    // ],
    endurance: [
        {
            name: "Date",
            type: "date",
            valueProvider: "date"
        },
        {
            name: "Discipline",
            type: "radio",
            options: [
                ["running", "Running"],
                ["mountainBiking", "Mountain Biking"],
                ["multisport", "Multisport / Adventure Racing"],
                ["canoeing", "Canoeing"],
                ["horseRiding", "Horse Riding"],
                ["ironman", "Ironman / Ironwoman"],
                ["other", "Other"]
            ],
            valueProvider: "discipline"
        },
        {
            name: "Distance",
            type: "textShort",
            valueProvider: log => (log.distance / 1000) + "km"
        },
        {
            name: "Time",
            type: "textShort",
            valueProvider: log => formatDuration(log.time)
        },
        {
            name: "Description",
            type: "textLong",
            valueProvider: "description"
        }
    ],
    mountaineering: [
        {
            name: "Start Date",
            type: "date",
            valueProvider: "start_date"
        },
        {
            name: "Area",
            type: "textShort",
            valueProvider: "area"
        },
        {
            name: "Number Of Days",
            type: "textShort",
            valueProvider: "days"
        },
        {
            name: "Hike Distance",
            type: "textShort",
            valueProvider: log => (log.distance / 1000) + "km"
        },
        {
            name: "Altitude Gained",
            type: "textShort",
            valueProvider: log => log.altitude_gained + "m"
        },
        {
            name: "Number In Party",
            type: "textShort",
            valueProvider: "party_size"
        },
        {
            name: "Shelter",
            type: "radio",
            options: [
                ["bivi", "Bivi"],
                ["hut", "Hut"],
                ["cave", "Cave"],
                ["tent", "Tent"],
                ["combination", "Combination"],
                ["other", "Other"],
            ],
            valueProvider: "shelter"
        },
        {
            name: "Was the majority of the hike on a trail/path?",
            type: "boolean",
            valueProvider: "trail"
        },
        {
            name: "Were you the leader of the group?",
            type: "boolean",
            valueProvider: "leader"
        },
        {
            name: "Was the majority of the hike above 2000m?",
            type: "boolean",
            valueProvider: "majority_above_2000m"
        },
        {
            name: "Route",
            type: "textLong",
            valueProvider: "route"
        },
        {
            name: "Weather Conditions",
            type: "textLong",
            valueProvider: "weather"
        },
        {
            name: "Situations Dealt With",
            type: "textLong",
            valueProvider: "situations"
        }
    ],
    riverTrip: [
        {
            name: "Date",
            type: "date",
            valueProvider: "date"
        },
        {
            name: "Put In",
            type: "time",
            valueProvider: "put_in"
        },
        {
            name: "Take Out",
            type: "time",
            valueProvider: "take_out"
        },
        {
            name: "Hours On River",
            type: "textShort",
            valueProvider: log => formatDuration(log.time, false)
        },
        {
            name: "Distance On River",
            type: "textShort",
            valueProvider: log => (log.distance / 1000) + "km"
        },
        {
            name: "Number In Party",
            type: "textShort",
            valueProvider: "party_size"
        },
        {
            name: "River",
            type: "textShort",
            valueProvider: "river"
        },
        {
            name: "Water Level",
            type: "textShort",
            valueProvider: "water_level"
        },
        {
            name: "Boat",
            type: "textShort",
            valueProvider: "boat"
        },
        {
            customType: "signer"
        }
    ],
    rockClimbing: [
        {
            type: "date",
            name: "Date",
            valueProvider: "date"
        },
        {
            type: "textShort",
            name: "Area",
            valueProvider: "area"
        },
        {
            name: "Number In Party",
            type: "textShort",
            valueProvider: "party_size"
        },
        {
            name: "Weather",
            type: "textShort",
            valueProvider: "weather"
        },
        {
            name: "Climbs",
            customType: "sublogsTable",
            sublogsTable: {
                buttonText: "Add Climb",
                name: "Climbs"
            }
        }
    ],
    rockClimbingBookReviews: [
        {
            name: "Link",
            type: "url",
            valueProvider: "link"
        }
    ],
    solitaire: [
        {
            name: "Date",
            type: "date",
            valueProvider: "date"
        },
        {
            name: "Location",
            type: "textShort",
            valueProvider: "location"
        },
        {
            name: "Others Involved",
            type: "textShort",
            valueProvider: "othersInvolved"
        },
        {
            name: "Supervisors",
            type: "textShort",
            valueProvider: "supervisors"
        },
        {
            name: "What I Took With Me",
            type: "textShort",
            valueProvider: "items"
        },
        {
            name: "The Experience Described In One Paragraph",
            type: "textLong",
            valueProvider: "experience"
        }
    ],
    solitaireInstructor: [
        {
            name: "Date",
            type: "date",
            valueProvider: "date"
        },
        {
            name: "Location",
            type: "textShort",
            valueProvider: "location"
        },
        {
            name: "Group Supervised",
            type: "textLong",
            valueProvider: "groupSupervised"
        },
        {
            name: "Comments & Problems Overcome",
            type: "textLong",
            valueProvider: "comments"
        }
    ],
    solitaireLeader: [
        {
            name: "Date",
            type: "date",
            valueProvider: "date"
        },
        {
            name: "Location",
            type: "textShort",
            valueProvider: "location"
        },
        {
            name: "Group Supervised",
            type: "textLong",
            valueProvider: "groupSupervised"
        },
        {
            name: "Comments & Problems Overcome",
            type: "textLong",
            valueProvider: "comments"
        }
    ],
    traverseHikePlan: [
        {
            name: "Link",
            type: "url",
            valueProvider: "link"
        }
    ],
    traverseSummaries: [
        {
            name: "Link",
            type: "url",
            valueProvider: "link"
        }
    ]
};

const _tableDisplayColumns = {
    flatWaterPaddling: [
        ["Date", log => formatDate(log.date)],
        ["Training", log => log.training],
        ["Boat", log => log.boat],
        ["Time", log => formatDuration(log.time)],
        ["Distance", log => log.distance],
        ["Place", log => log.place],
        ["Comments", log => log.comments]
    ],
    midmarMile: [
        ["Date", log => formatDate(log.date)],
        ["Distance", log => log.distance + "m"],
        ["Time", log => formatDuration(log.time)],
        ["Comments", log => log.comments]
    ],
    rockClimbingInstruction: [
        ["Date", log => formatDate(log.date)],
        ["Duration", log => formatDuration(log.duration, false)],
        ["Number Of Climbers", log => log.climbers],
        ["Location", log => log.location],
        ["Signed Off", "signer"]
    ],
    running: [
        ["Date", log => formatDate(log.date)],
        ["Distance", log => (log.distance / 1000) + "km"],
        ["Time", log => formatDuration(log.time)],
        ["Description", log => log.description],
    ],
    service: [
        ["Date", log => formatDate(log.date)],
        ["Service", log => log.service],
        ["Hours", log => formatDuration(log.time, false)],
        ["Description", log => log.description],
        ["Signed Off", "signer"]
    ]
};

const _tableDisplayColumnsSublogs = {
    rockClimbing: [
        ["Route Name", log => log.route_name],
        ["Method", log => log.method],
        ["Grade", log => log.grade],
        ["Pitches", log => log.pitches],
    ]
};

function createFlexibleLD(options) {
    const {
        inputOptions,
        placeholder,
        removable = true,
        logType,
        setLog, // links to sublogs form
        signable = false,
        singleton,
        targetUser: targetUserId = getUserId()
    } = options;

    const items = _flexibleDisplayColumns[logType];

    function showNone() {
        createElement("p", container, NONE_TEXT);
    }

    function createSection(currentItems, log) {
        const { id: logId } = log;

        for (let i = 0; i < currentItems.length; i++) {
            const item = currentItems[i];
            const { customType, valueProvider } = item;

            if (customType === "signer") {
                currentItems[i] = {
                    type: "custom",
                    consumer: div => {
                        const { signer } = log;

                        function addContent(signedOff) {
                            removeChildren(div);

                            if (signedOff == null) {
                                div.classList.remove("boolean-container");
                                div.classList.add("option-card");

                                createElement("h3", div, "Sign Off Log");
                                createElement("button", div, "Sign Off").addEventListener("click", () => {
                                    addContent(true);
                                    putRequest(`/logs/${logType}/${logId}`, { signedOff: true });
                                });
                            } else {
                                div.classList.add("boolean-container");
                                div.classList.remove("option-card");

                                createElement("h3", div, "Signed Off");
                                div.appendChild(createCheckbox(signedOff));
                            }
                        }

                        addContent((signable && signer == null) ? null : signer != null);
                    }
                };
            } else if (customType === "sublogsTable") {
                const { buttonText, name } = item.sublogsTable ?? {};

                currentItems[i] = {
                    type: "custom",
                    consumer: div => {
                        div.style.flexBasis = "100%";

                        createElement("h3", div, name);
                        div.appendChild(createSpacer(20));

                        if (setLog != null) {
                            createElement("button", div, buttonText).addEventListener("click", () => {
                                setLog(logId);
                            });
                            div.appendChild(createSpacer(20));
                        }

                        div.appendChild(createTableLD({
                            logId,
                            logType,
                            removable
                        }));
                    }
                };
            } else {
                // provide value
                if (typeof valueProvider === "string") {
                    item.value = log[valueProvider];
                } else if (typeof valueProvider === "function") {
                    item.value = valueProvider(log);
                }

                delete item.valueProvider;
            }
        }
        if (removable === true) {
            currentItems.push({
                type: "custom",
                consumer: (div, section) => {
                    div.classList.add("option-card");

                    createElement("h3", div, "Remove Log");
                    createElement("button", div, "Remove").addEventListener("click", () => {
                        if (singleton) {
                            deleteRequest(`/users/${targetUserId}/logs/${logType}`);
                            window.location.reload();
                        } else {
                            deleteRequest(`/logs/${logType}/${logId}`);

                            if (section.parentElement.children.length === 1) {
                                showNone();
                            }

                            section.remove();
                        }
                    });
                }
            });
        }

        return createFlexibleDisplay(currentItems);
    }

    const container = document.createElement("div");
    container.classList.add("flexible-log-display-container");

    const loading = createLoadingIcon();
    container.appendChild(loading);

    getRequest(`/users/${targetUserId}/logs/${logType}`).then(res => {
        const { logs } = res;

        loading.remove();

        if (singleton) {
            if (logs.length === 0) {
                if (inputOptions == null) {
                    showNone();
                } else {
                    inputOptions.logType = logType;
                    container.appendChild(createLogInput(inputOptions));
                }
            } else {
                container.appendChild(createSection(items, logs[0]));
            }
        } else if (logs.length === 0) {
            showNone();
        } else {
            for (let log of logs) {
                const clonedItems = [];

                for (let item of items) {
                    clonedItems.push({ ...item });
                }

                const section = createSection(clonedItems, log);
                container.appendChild(section);
            }
        }
    });

    /* Placeholder */

    if (placeholder != null) {
        ensureElement(placeholder).replaceWith(container);
    }

    return container;
}

/*
    Types:
        - boolean
        - custom
        - date
        - number
        - radio
        - textLong
        - textShort
        - time
        - url
*/
function createFlexibleDisplay(items) {
    const container = document.createElement("div");
    container.classList.add("flexible-log-display");

    for (let item of items) {
        const { name, type, value } = item;

        switch (type) {
            case "boolean": {
                createElement("div", container, div => {
                    div.classList.add("boolean-container");

                    createElement("h3", div, name);
                    div.appendChild(createCheckbox(value === true || value === 1));
                });

                break;
            }
            case "custom": {
                const { consumer } = item;

                createElement("div", container, div => {
                    consumer(div, container);
                });

                break;
            }
            case "date": {
                createElement("div", container, div => {
                    createElement("h3", div, name);
                    createElement("p", div, formatDate(value));
                });

                break;
            }
            case "radio": {
                createElement("div", container, div => {
                    const { options } = item;

                    createElement("h3", div, name);

                    let radioContainer = createElement("div", div);
                    radioContainer.classList.add("radio-container");

                    for (let option of options) {
                        const [optionId, optionDisplay] = option;

                        const radioOption = createElement("div", radioContainer);
                        radioOption.classList.add("radio-option");

                        createElement("p", radioOption, optionDisplay);
                        radioOption.appendChild(createCheckbox(value === optionId));
                    }
                });

                break;
            }
            case "textLong": {
                createElement("div", container, div => {
                    div.classList.add("text-long-container");
                    createElement("h3", div, name);
                    createElement("p", div, value);
                });

                break;
            }
            case "textShort": {
                createElement("div", container, div => {
                    createElement("h3", div, name);
                    createElement("p", div, value);
                });

                break;
            }
            case "time": {
                createElement("div", container, div => {
                    createElement("h3", div, name);
                    createElement("p", div, formatTime(value));
                });

                break;
            } case "url": {
                createElement("div", container, div => {
                    createElement("h3", div, name);
                    const a = createElement("a", div, value);
                    a.classList.add("link");
                    a.href = value;
                    a.target = "_blank";
                });

                break;
            }
            default: throw new Error("Invalid type: " + type);
        }
    }

    return container;
}

function createTableLD(options) {
    const {
        placeholder,
        logType,
        removable = true,
        logId, // for sublogs
        signable = false,
        targetUser: targetUserId = getUserId()
    } = options;

    const container = document.createElement("div");
    const sublogs = (logId != null);
    const columns = (sublogs ? _tableDisplayColumnsSublogs : _tableDisplayColumns)[logType];

    /* Loading */

    const loading = createLoadingIcon();
    container.appendChild(loading);

    /* Get Logs */

    let promise;

    if (sublogs) {
        promise = new Promise(async r => r((await getRequest(`/logs/${logType}/${logId}`)).sublogs));
    } else {
        promise = new Promise(async r => r((await getRequest(`/users/${targetUserId}/logs/${logType}`)).logs));
    }

    promise.then(values => {

        /* Create Table */

        const table = document.createElement("table");
        table.classList.add("logs-table");

        const topRow = createElement("tr", table);

        columns.forEach(column => {
            createElement("th", topRow, column[0]);
        });

        /* Removable Heading */

        if (removable) {
            createElement("th", topRow, "Remove");
        }

        /* Populate Table */

        if (values != null) {
            values.forEach(log => {
                const { id } = log;

                const tr = createElement("tr", table);

                /* Cells */

                columns.forEach(column => {
                    const content = column[1];

                    if (content === "signer") {
                        const { signer } = log;
                        const signCell = createElement("td", tr, "Sign Off");

                        function setContent(signedOff) {
                            if (signedOff == null) { // signable
                                signCell.classList.add("interactive");
                                signCell.addEventListener("click", () => {
                                    putRequest(`/logs/${logType}/${id}`, { signedOff: true });
                                    setContent(true);
                                });
                            } else {
                                signCell.classList.remove("interactive");
                                signCell.innerHTML = (signedOff ? "Yes" : "No");
                            }
                        }

                        setContent((signable && signer == null) ? null : signer != null);
                    } else {
                        createElement("td", tr, content(log));
                    }
                });

                /* Remove Cell */

                if (removable) {
                    const removeCell = createElement("td", tr, "X");
                    removeCell.classList.add("interactive");

                    removeCell.addEventListener("click", () => {
                        tr.remove();

                        if (sublogs) {
                            deleteRequest(`/logs/${logType}/sub/${id}`);
                        } else {
                            deleteRequest(`/logs/${logType}/${id}`);
                        }
                    });
                }
            });
        }

        /* Display */

        loading.replaceWith(table);
    });

    /* Placeholder */

    if (placeholder != null) {
        ensureElement(placeholder).replaceWith(container);
    }

    return container;
}