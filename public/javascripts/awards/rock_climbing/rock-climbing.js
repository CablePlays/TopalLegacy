window.addEventListener("load", () => {
    createSignoffDisplay({
        placeholder: "signoffs",
        type: "rockClimbing",
        additions: {
            "Abseiling": noticeRow => {
                createElement("td", noticeRow, "Abseiling at Treverton is always done while belayed on another rope (no acceleration)!")
                    .classList.add("notice");
            }
        }
    });
    createLogInput({
        placeholder: "log-form",
        logType: "rockClimbing",
        title: "Add Day (Enter Climbs After)",
        inputs: [
            {
                id: "date",
                name: "Date",
                type: "date",
                required: true
            },
            {
                id: "area",
                name: "Area",
                type: "textShort",
                required: true
            },
            {
                id: "party_size",
                name: "Number In Party",
                type: "range",
                range: {
                    min: 1,
                    max: 20,
                    value: 5,
                    display: value => value
                }
            },

            {
                id: "weather",
                name: "Weather",
                type: "textShort",
                required: true
            }
        ]
    });
    const { setLog } = createLogInput({
        placeholder: "sublog-form",
        logType: "rockClimbing",
        sublogs: true,
        title: "Add Climb",
        onFirstLogSet: () => {
            document.getElementById("sublog-form-container").style.display = "block";
        },
        inputs: [
            {
                id: "route_name",
                name: "Route Name",
                type: "textShort",
                required: true
            },
            {
                id: "method",
                name: "Method",
                type: "selection",
                required: true,
                selection: {
                    options: [
                        "Top Rope",
                        "On Sight",
                        "Red Point",
                        "Dogged",
                        "Lead Bolt",
                        "Lead Natural",
                        "Alternate Lead",
                        "Second Bolt",
                        "Second Natural"
                    ]
                }
            },
            {
                id: "grade",
                name: "Grade",
                type: "textShort",
                required: true
            },
            {
                id: "pitches",
                name: "Pitches",
                type: "range",
                range: {
                    min: 0,
                    max: 20,
                    value: 1,
                    display: value => value
                }
            }
        ]
    });
    createFlexibleLD({
        placeholder: "logs",
        logType: "rockClimbing",
        setLog
    });
});