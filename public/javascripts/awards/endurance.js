function setupRecordInput() {
    const element = createRecordInput({
        recordType: "endurance",
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
                description: "To make your record more reliable, describe how you felt and what the weather was like.",
                type: "text_long"
            }
        ]
    });

    document.getElementById("record-input").replaceWith(element);
}

window.addEventListener("load", () => {
    setupRecordInput();
    createTableRD({
        placeholder: "record-display",
        recordType: "endurance"
    });
});