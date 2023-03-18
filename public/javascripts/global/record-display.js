/*
    Handles displaying records using either a table or a list for singletons.
*/

const _flexibleDisplayColumns = {
    mountaineering: [
        {
            name: "Start Date",
            type: "date",
            id: "start_date"
        },
        {
            name: "Area",
            type: "textShort",
            id: "area"
        },
        {
            name: "Number Of Days",
            type: "textShort",
            id: "days"
        },
        {
            name: "Hike Distance",
            type: "textShort",
            id: "distance"
        },
        {
            name: "Altitude Gained",
            type: "textShort",
            id: "altitude_gained"
        },
        {
            name: "Number In Party",
            type: "textShort",
            id: "party_number"
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
            id: "shelter"
        },
        {
            name: "Was the majority of the hike on a trail/path?",
            type: "boolean",
            id: "trail"
        },
        {
            name: "Were you the leader of the group?",
            type: "boolean",
            id: "leader"
        },
        {
            name: "Was the majority of the hike above 2000m?",
            type: "boolean",
            id: "majority_above_2000m"
        },
        {
            name: "Route",
            type: "textLong",
            id: "route"
        },
        {
            name: "Weather Conditions",
            type: "textLong",
            id: "weather"
        },
        {
            name: "Situations Dealt With",
            type: "textLong",
            id: "situations"
        }
    ],
    rockClimbing: [
        {
            name: "Date",
            type: "date",
            id: "date"
        },
        {
            name: "Area",
            type: "textShort",
            id: "area"
        },
        {
            name: "Number In Party",
            type: "textShort",
            id: "party_size"
        },
        {
            name: "Weather",
            type: "textShort",
            id: "weather"
        },
        {
            name: "Climbs",
            type: "subrecordsTable",
            subrecordsTable: {
                buttonText: "Add Climb"
            }
        }
    ],
    solitaire: [
        {
            name: "Date",
            type: "date",
            id: "date"
        },
        {
            name: "Location",
            type: "textShort",
            id: "location"
        },
        {
            name: "Others Involved",
            type: "textShort",
            id: "othersInvolved"
        },
        {
            name: "Supervisors",
            type: "textShort",
            id: "supervisors"
        },
        {
            name: "What I Took With Me",
            type: "textShort",
            id: "items"
        },
        {
            name: "The Experience Described In One Paragraph",
            type: "textLong",
            id: "experienceDescription"
        }
    ]
};

const _tableDisplayColumns = {
    endurance: [
        ["Date", record => formatDate(record.date)],
        ["Distance", record => (record.distance / 1000) + "km"],
        ["Time", record => formatDuration(record.time)],
        ["Description", record => record.description],
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
        singleton,
        targetUser: targetUserId
    } = options;

    const items = _flexibleDisplayColumns[recordType];

    function createSection(itemsUsing, value) {
        for (let item of itemsUsing) {
            const { id, type } = item;

            // supply values using IDs
            if (id != null) {
                delete item.id;
                item.value = value[id];
            }

            // supply subrecords table data
            if (type === "subrecordsTable") {
                item.subrecordsTable = {
                    ...item.subrecordsTable,
                    recordId: value.id,
                    recordType,
                    removable,
                    setRecord
                };
            }
        }

        if (removable === true) {
            itemsUsing.push({
                type: "custom",
                consumer: (div, section) => {
                    div.classList.add("remove-card");

                    createElement("h3", div, "Remove Record");
                    createElement("button", div, "Remove").addEventListener("click", () => {
                        post(`/remove-${recordType}-record`, { id: value.id });

                        if (singleton) {
                            window.location.reload();
                        } else {
                            section.remove();
                        }
                    });
                }
            });
        }

        return createFlexibleDisplay(itemsUsing);
    }

    const container = document.createElement("div");

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
            } else if (inputOptions != null) {
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
            container.classList.add("flexible-record-display-container");

            for (let value of values) {
                const clonedItems = [];

                for (let item of items) {
                    clonedItems.push({ ...item });
                }

                const section = createSection(clonedItems, value);
                container.appendChild(section);
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
        - text_long
        - text_short
*/
function createFlexibleDisplay(items) {
    const container = document.createElement("div");
    container.classList.add("flexible-record-display");

    for (let item of items) {
        const { name, type, value } = item;

        switch (type) {
            case "boolean":
                createElement("div", container, div => {
                    div.classList.add("boolean-container");

                    createElement("h3", div, name);
                    const booleanElement = createCheckbox(value === 1);
                    div.appendChild(booleanElement);
                });

                break;
            case "custom":
                const { consumer } = item;

                createElement("div", container, div => {
                    consumer(div, container);
                });

                break;
            case "date":
                createElement("div", container, div => {
                    createElement("h3", div, name);
                    createElement("p", div, formatDate(value));
                });

                break;
            case "subrecordsTable":
                const { subrecordsTable } = item;
                const { buttonText, recordId, recordType, removable, setRecord } = subrecordsTable;

                createElement("div", container, div => {
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
                });

                break;
            case "radio":
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
            case "textLong":
                createElement("div", container, div => {
                    createElement("h3", div, name);
                    createElement("p", div, value).classList.add("text-long");
                });

                break;
            case "textShort":
                createElement("div", container, div => {
                    createElement("h3", div, name);
                    createElement("p", div, value);
                });

                break;
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

        /* Removeable Column */

        if (removable === true) {
            table.classList.add("removable");
            createElement("th", topRow, "Remove");
        }

        /* Populate Table */

        if (values != null) {
            values.forEach(record => {
                const tr = createElement("tr", table);

                /* Info Cells */

                columns.forEach(column => {
                    createElement("td", tr, column[1](record));
                });

                /* Remove Cell */

                if (removable) {
                    const { id } = record;
                    const removeCell = createElement("td", tr, "X");

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