function setupRecordInput() {
    const element = createRecordInput({
        endpoint: "/add-midmarMile-record",
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
            }
        ]
    });

    document.getElementById("record-input").replaceWith(element);
}

window.addEventListener("load", () => {
    setupRecordInput();
    createTableRD({
        placeholder: "record-display",
        recordType: "midmarMile"
    });
});