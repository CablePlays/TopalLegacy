window.addEventListener("load", () => {
    createFlexibleLD({
        placeholder: "log-display",
        logType: "mountaineering"
    });
    createLogInput({
        placeholder: "log-input",
        logType: "mountaineering",
        inputs: [
            {
                id: "start_date",
                name: "Start Date",
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
                id: "days",
                name: "Number Of Days",
                type: "range",
                range: {
                    min: 1,
                    max: 30,
                    value: 3,
                    display: value => value + " day" + (value === "1" ? "" : "s")
                }
            },
            {
                id: "distance",
                name: "Hike Distance",
                type: "range",
                range: {
                    min: 3000,
                    max: 200000,
                    step: 500,
                    value: 10000,
                    display: value => (value / 1000) + "km"
                }
            },
            {
                id: "altitude_gained",
                name: "Altitude Gained",
                type: "range",
                range: {
                    min: 500,
                    max: 10000,
                    step: 100,
                    value: 3000,
                    display: value => value + "m"
                }
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
                id: "shelter",
                name: "Shelter",
                type: "selection",
                required: true,
                selection: {
                    options: [
                        ["bivi", "Bivi"],
                        ["hut", "Hut"],
                        ["cave", "Cave"],
                        ["tent", "Tent"],
                        ["combination", "Combination"],
                        ["other", "Other"]
                    ]
                }
            },
            {
                id: "trail",
                name: "Trail/Path",
                description: "Was the majority of the hike on a trail/path?",
                type: "boolean"
            },
            {
                id: "leader",
                name: "Leader",
                description: "Were you the leader of the group?",
                type: "boolean"
            },
            {
                id: "majority_above_2000m",
                name: "Elevation",
                description: "Was the majority of the hike above 2000m?",
                type: "boolean",
                required: true
            },
            {
                id: "route",
                name: "Route",
                type: "textLong",
                required: true
            },
            {
                id: "weather",
                name: "Weather Conditions",
                type: "textLong",
                required: true
            },
            {
                id: "situations",
                name: "Situations Dealt With",
                type: "textLong",
                required: true
            }
        ]
    });
});