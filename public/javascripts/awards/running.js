function setupRecordInput() {
   const element =  createRecordInput({
        endpoint: "/add-running-record",
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
                    min: 1000,
                    max: 30000,
                    step: 100,
                    value: 5000,
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
                description: "To make your run more reliable, describe how you felt and what the weather was like.",
                type: "text_long"
            }
        ]
    });

    document.getElementById("record-input").replaceWith(element);
}

async function setupTotal() {
    const distanceLabel = document.getElementById("total-distance-label");
    distanceLabel.innerHTML = LOADING_TEXT;

    const res = await fetch("/get-distance-run", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: getUserId()
        })
    });

    const { value } = await res.json();

    distanceLabel.innerHTML = `${value / 1000}km / 100km`;
    document.getElementById("total-distance-meter").value = value;
}

window.addEventListener("load", () => {
    loadRecords("records-table", "running");
    setupRecordInput();
    setupTotal();
});