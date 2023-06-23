window.addEventListener("load", () => {
    createLogInput({
        logType: "endurance",
        placeholder: "log-input",
        inputs: [
            {
                id: "date",
                name: "Date",
                type: "date",
                required: true
            },
            {
                id: "discipline",
                name: "Discipline",
                type: "selection",
                required: true,
                selection: {
                    options: [
                        ["running", "Running"],
                        ["mountainBiking", "Mountain Biking"],
                        ["multisport", "Multisport / Adventure Racing"],
                        ["canoeing", "Canoeing"],
                        ["horseRiding", "Horse Riding"],
                        ["ironman", "Ironman / Ironwoman"],
                        ["other", "Other (Describe In Description)"]
                    ]
                }
            },
            {
                id: "distance",
                name: "Distance",
                type: "range",
                required: true,
                range: {
                    min: 5000,
                    max: 100000,
                    step: 100,
                    value: 10000,
                    display: value => (value / 1000) + "km"
                }
            },
            {
                id: "time",
                name: "Time",
                type: "duration",
                required: true
            },
            {
                id: "description",
                name: "Description",
                description: "To make your activity more legit, describe how you felt and what the weather was like.",
                type: "textLong",
                required: true
            }
        ]
    });
    createFlexibleLD({
        placeholder: "log-display",
        logType: "endurance"
    });
});