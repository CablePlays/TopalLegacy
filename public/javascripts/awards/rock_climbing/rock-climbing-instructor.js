window.addEventListener("load", () => {
    createSignoffDisplay({
        placeholder: "signoffs",
        type: "rockClimbingInstructor"
    });
    createFlexibleLD({
        placeholder: "book-review-placeholder",
        logType: "rockClimbingBookReviews",
        removable: true,
        singleton: true,
        inputOptions: {
            title: "Link Book Reviews",
            successMessage: "Your book reviews have been linked!",
            inputs: [
                {
                    id: "link",
                    name: "Google Doc Link",
                    type: "url",
                    required: true
                }
            ]
        }
    });
    createLogInput({
        placeholder: "instruction-log-form",
        logType: "rockClimbingInstruction",
        title: "Create Instruction Log",
        inputs: [
            {
                id: "date",
                name: "Date",
                type: "date",
                required: true
            },
            {
                id: "duration",
                name: "Duration",
                description: "How long did you instruct for?",
                type: "range",
                range: {
                    min: 900,
                    max: 18000,
                    step: 60,
                    value: 1800,
                    display: value => formatDuration(value, false)
                }
            },
            {
                id: "climbers",
                name: "Number Of Climbers",
                type: "range",
                range: {
                    min: 1,
                    max: 20,
                    value: 5,
                    display: value => value + " " + (value == 1 ? "person" : "people")
                }
            },
            {
                id: "location",
                name: "Location",
                type: "textShort",
                required: true
            }
        ]
    });
    createTableLD({
        placeholder: "instruction-logs",
        logType: "rockClimbingInstruction"
    });
});