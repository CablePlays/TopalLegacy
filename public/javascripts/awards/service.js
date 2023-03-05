function setupRecordInput() {
    createRecordInput({
        endpoint: "/add-service-record",
        inputs: [
            {
                id: "date",
                name: "Date",
                type: "date",
                required: true
            },
            {
                id: "service",
                name: "Service",
                description: "What kind of service did you provide?",
                type: "text_short",
                required: true,
                range: {
                    min: 1000,
                    max: 30000,
                    step: 100,
                    value: 5000,
                    display: value => value + "m"
                }
            },
            {
                id: "time",
                name: "Hours",
                description: "How long did you work for?",
                type: "range",
                required: true,
                range: {
                    min: 1800,
                    max: 54000,
                    step: 900,
                    value: 3600,
                    display: value => formatDuration(value, false)
                }
            },
            {
                id: "description",
                name: "Description",
                description: "To make your record more reliable, describe what you did and who you worked with.",
                type: "text_long"
            }
        ]
    });
}

async function setupTotal() {
    const totalHoursLabel = document.getElementById("total-hours-label");
    totalHoursLabel.innerHTML = LOADING_TEXT;

    let res = await fetch("/get-service-time", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: getUserId()
        })
    });

    const { value } = await res.json();

    totalHoursLabel.innerHTML = `${formatDuration(value, false)} / 25h`;
    document.getElementById("total-hours-meter").value = value;
}

window.addEventListener("load", () => {
    loadRecords("records-table", "service");
    setupRecordInput();
    setupTotal();
});