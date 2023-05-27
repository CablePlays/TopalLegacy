async function setupTotal() {
    const totalHoursLabel = document.getElementById("total-hours-label");
    totalHoursLabel.innerHTML = LOADING_TEXT;

    const { time } = await getRequest(`/users/${getUserId()}/logs/service-hours`);

    totalHoursLabel.innerHTML = `${formatDuration(time, false)} / 25h`;
    document.getElementById("total-hours-meter").value = time;
}

window.addEventListener("load", () => {
    createLogInput({
        placeholder: "log-input",
        logType: "service",
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
                type: "textShort",
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
                description: "To make your log more reliable, describe what you did and who you worked with.",
                type: "textLong"
            }
        ]
    });
    setupTotal();
    createTableLD({
        placeholder: "log-display",
        logType: "service"
    });
});