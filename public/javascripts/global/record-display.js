/*
    Handles displaying records using either a table or a list for singletons.
*/

const _flexibleDisplayColumns = {
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
            valueProvider: record => (record.distance / 1000) + "km"
        },
        {
            name: "Altitude Gained",
            type: "textShort",
            valueProvider: record => record.altitude_gained + "m"
        },
        {
            name: "Number In Party",
            type: "textShort",
            valueProvider: "party_number"
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
            valueProvider: record => formatDuration(record.time, false)
        },
        {
            name: "Distance On River",
            type: "textShort",
            valueProvider: record => (record.distance / 1000) + "km"
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
            customType: "subrecordsTable",
            subrecordsTable: {
                buttonText: "Add Climb",
                name: "Climbs"
            }
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
            valueProvider: "experienceDescription"
        }
    ]
};

const _tableDisplayColumns = {
    endurance: [
        ["Date", record => formatDate(record.date)],
        ["Distance", record => (record.distance / 1000) + "km"],
        ["Time", record => formatDuration(record.time)],
        ["Description", record => record.description]
    ],
    flatWaterPaddling: [
        ["Date", record => formatDate(record.date)],
        ["Training", record => record.training],
        ["Boat", record => record.boat],
        ["Time", record => record.time],
        ["Distance", record => record.distance],
        ["Place", record => record.place],
        ["Comments", record => record.comments]
    ],
    midmarMile: [
        ["Date", record => formatDate(record.date)],
        ["Distance", record => record.distance + "m"],
        ["Time", record => formatDuration(record.time)]
    ],
    running: [
        ["Date", record => formatDate(record.date)],
        ["Distance", record => (record.distance / 1000) + "km"],
        ["Time", record => formatDuration(record.time)],
        ["Description", record => record.description],
    ],
    service: [
        ["Date", record => formatDate(record.date)],
        ["Service", record => record.service],
        ["Hours", record => formatDuration(record.time, false)],
        ["Description", record => record.description],
        ["Signed Off", "signer"]
    ]
};

const _tableDisplayColumnsSubrecords = {
    rockClimbing: [
        ["Route Name", record => record.route_name],
        ["Method", record => record.method],
        ["Grade", record => record.grade],
        ["Pitches", record => record.pitches],
    ]
};

function createFlexibleRD(options) {
    const {
        inputOptions,
        placeholder,
        removable = true,
        recordType,
        setRecord, // links to subrecords form
        signable = false,
        singleton,
        targetUser: targetUserId
    } = options;

    const items = _flexibleDisplayColumns[recordType];

    function showNone() {
        createElement("p", container, "None");
    }

    function createSection(currentItems, record) {
        const { id: recordId } = record;

        for (let i = 0; i < currentItems.length; i++) {
            const item = currentItems[i];
            const { customType, valueProvider } = item;

            if (customType === "signer") {
                currentItems[i] = {
                    type: "custom",
                    consumer: div => {
                        const { signer } = record;

                        function addContent(signedOff) {
                            removeChildren(div);

                            if (signedOff == null) {
                                div.classList.remove("boolean-container");
                                div.classList.add("option-card");

                                createElement("h3", div, "Sign Off Record");
                                createElement("button", div, "Sign Off").addEventListener("click", () => {
                                    post(`/sign-${recordType}-record`, { id: recordId });
                                    addContent(true);
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
            } else if (customType === "subrecordsTable") {
                const { buttonText, name } = item.subrecordsTable ?? {};

                currentItems[i] = {
                    type: "custom",
                    consumer: div => {
                        div.style.flexBasis = "100%";

                        createElement("h3", div, name);
                        div.appendChild(createSpacer(20));

                        if (setRecord != null) {
                            createElement("button", div, buttonText).addEventListener("click", () => {
                                setRecord(recordId);
                            });
                            div.appendChild(createSpacer(20));
                        }

                        div.appendChild(createTableRD({
                            recordId,
                            recordType,
                            removable
                        }));
                    }
                };
            } else {
                // provide value
                if (typeof valueProvider === "string") {
                    item.value = record[valueProvider];
                } else if (typeof valueProvider === "function") {
                    item.value = valueProvider(record);
                }

                delete item.valueProvider;
            }
        }
        if (removable === true) {
            currentItems.push({
                type: "custom",
                consumer: (div, section) => {
                    div.classList.add("option-card");

                    createElement("h3", div, "Remove Record");
                    createElement("button", div, "Remove").addEventListener("click", () => {
                        post(`/remove-${recordType}-record`, { id: record.id });

                        if (singleton) {
                            window.location.reload();
                        } else {
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
    container.classList.add("flexible-record-display-container");

    const loading = createLoading(true);
    container.appendChild(loading);

    if (singleton) {
        post(`/get-${recordType}-record`, {
            user: targetUserId
        }).then(res => {
            const { exists, value } = res;

            loading.remove();

            if (exists) {
                container.appendChild(createSection(items, value));
            } else if (inputOptions == null) {
                showNone();
            } else {
                inputOptions.recordType = recordType;
                container.appendChild(createRecordInput(inputOptions));
            }
        });
    } else {
        post(`/get-${recordType}-records`, {
            user: targetUserId
        }).then(res => {
            const { values } = res;

            loading.remove();

            if (values.length === 0) {
                showNone();
            } else {
                for (let value of values) {
                    const clonedItems = [];

                    for (let item of items) {
                        clonedItems.push({ ...item });
                    }

                    const section = createSection(clonedItems, value);
                    container.appendChild(section);
                }
            }
        });
    }

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
*/
function createFlexibleDisplay(items) {
    const container = document.createElement("div");
    container.classList.add("flexible-record-display");

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
                    createElement("h3", div, name);
                    createElement("p", div, value).classList.add("text-long");
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
            }
            default: throw new Error("Invalid type: " + type);
        }
    }

    return container;
}

function createTableRD(options) {
    const {
        placeholder,
        recordType,
        removable = true,
        recordId, // for subrecords
        signable = false,
        targetUser: targetUserId
    } = options;

    const container = document.createElement("div");
    const subrecords = (recordId != null);
    const columns = (subrecords ? _tableDisplayColumnsSubrecords : _tableDisplayColumns)[recordType];

    /* Loading */

    const loading = createLoading(true);
    container.appendChild(loading);

    /* Get Records */

    const promise = (subrecords ? post(`/get-${recordType}-subrecords`, {
        recordId
    }) : post(`/get-${recordType}-records`, {
        user: targetUserId
    }));

    promise.then(res => {
        const { values } = res;

        /* Create Table */

        const table = document.createElement("table");
        table.classList.add("records-table");

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
            values.forEach(record => {
                const { id } = record;

                const tr = createElement("tr", table);

                /* Cells */

                columns.forEach(column => {
                    const content = column[1];

                    if (content === "signer") {
                        const { signer } = record;
                        const signCell = createElement("td", tr, "Sign Off");

                        function setContent(signedOff) {
                            if (signedOff == null) {
                                signCell.classList.add("interactive");
                                signCell.addEventListener("click", () => {
                                    post(`/sign-${recordType}-record`, { id });
                                    setContent(true);
                                });
                            } else {
                                signCell.classList.remove("interactive");
                                signCell.innerHTML = (signedOff ? "Yes" : "No");
                            }
                        }

                        setContent((signable && signer == null) ? null : signer != null);
                    } else {
                        createElement("td", tr, content(record));
                    }
                });

                /* Remove Cell */

                if (removable) {
                    const removeCell = createElement("td", tr, "X");
                    removeCell.classList.add("interactive");

                    removeCell.addEventListener("click", () => {
                        tr.remove();
                        post(`/remove-${recordType}-${subrecords ? "sub" : ""}record`, { id });
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