window.addEventListener("load", () => {
    createLogInput({
        title: "Create Training Log",
        logType: "midmarMile",
        placeholder: "log-input",
        inputs: [
            {
                id: "date",
                name: "Date",
                type: "date",
                required: true
            },
            {
                id: "distance",
                name: "Distance",
                type: "range",
                required: true,
                range: {
                    min: 100,
                    max: 3000,
                    step: 25,
                    value: 800,
                    display: value => value + "m"
                }
            },
            {
                id: "time",
                name: "Time",
                type: "duration",
                required: true
            },
            {
                id: "comments",
                name: "Comments",
                type: "textLong"
            }
        ]
    });
    createTableLD({
        placeholder: "log-display",
        logType: "midmarMile"
    });
});