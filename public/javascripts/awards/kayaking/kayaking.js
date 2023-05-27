window.addEventListener("load", () => {
    createSignoffDisplay({
        placeholder: "signoffs",
        type: "kayaking"
    });
    createLogInput({
        placeholder: "flat-water-paddling-form",
        logType: "flatWaterPaddling",
        title: "Create Flat Water Paddling Log",
        inputs: [
            {
                id: "date",
                name: "Date",
                type: "date",
                required: true
            },
            {
                id: "training",
                name: "Training",
                description: "The type of training that you did.",
                type: "textShort",
                required: true
            },
            {
                id: "boat",
                name: "Boat",
                type: "textShort",
                required: true
            },
            {
                id: "time",
                name: "Time",
                type: "duration",
                required: true
            },
            {
                id: "distance",
                name: "Distance",
                description: "Distance is provided as text to let you specify information like the number of lengths. Make sure you provide a unit if necessary!",
                type: "textShort",
                required: true
            },
            {
                id: "place",
                name: "Place",
                type: "textShort",
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
        placeholder: "flat-water-paddling-logs",
        logType: "flatWaterPaddling"
    });
    createLogInput({
        placeholder: "river-trip-form",
        logType: "riverTrip",
        title: "Create River Trip Log",
        inputs: [
            {
                id: "date",
                name: "Date",
                type: "date",
                required: true
            },
            {
                id: "put_in",
                name: "Put In",
                type: "time",
                required: true
            },
            {
                id: "take_out",
                name: "Take Out",
                type: "time",
                required: true
            },
            {
                id: "time",
                name: "Hours On River",
                type: "range",
                range: {
                    min: 3600,
                    max: 259200, // 3 days
                    step: 900,
                    value: 10800,
                    display: value => formatDuration(value, false)
                }
            },
            {
                id: "distance",
                name: "Distance",
                type: "range",
                range: {
                    min: 1000,
                    max: 100000,
                    step: 1000,
                    value: 5000,
                    display: value => (value / 1000) + "km"
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
                id: "river",
                name: "River",
                type: "textShort",
                required: true
            },
            {
                id: "water_level",
                name: "Water Level",
                type: "textShort",
                required: true
            },
            {
                id: "boat",
                name: "Boat",
                type: "textShort",
                required: true
            }
        ]
    });
    createFlexibleLD({
        placeholder: "river-trip-logs",
        logType: "riverTrip"
    });
});