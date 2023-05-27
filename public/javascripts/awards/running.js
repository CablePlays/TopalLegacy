async function setupTotal() {
    const distanceLabel = document.getElementById("total-distance-label");
    distanceLabel.innerHTML = LOADING_TEXT;

    const { distance } = await getRequest(`/users/${getUserId()}/logs/distance-run`);

    distanceLabel.innerHTML = `${distance / 1000}km / 100km`;
    document.getElementById("total-distance-meter").value = distance;
}

window.addEventListener("load", () => {
    setupTotal();

    createTableLD({
        placeholder: "log-display",
        logType: "running"
    });
    createLogInput({
        placeholder: "log-input",
        logType: "running",
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
                description: "To make your run more legit, describe how you felt and what the weather was like.",
                type: "textLong"
            }
        ]
    });
});