window.addEventListener("load", () => {
    createSignoffDisplay({
        items: rockClimbingSignoffs,
        placeholder: "signoffs",
        type: "rockClimbing",
        additions: {
            "Abseiling": noticeRow => {
                createElement("td", noticeRow, "Abseiling at Treverton is always done while belayed on another rope (no acceleration)!")
                    .classList.add("notice");
            }
        }
    });
    createRecordInput({
        placeholder: "record-form",
        recordType: "rockClimbing",
        title: "Add Day",
        inputs: [
            {
                id: "date",
                name: "Date",
                type: "date",
                required: true
            },
            {
                id: "area",
                name: "Area",
                type: "text_short",
                required: true
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
                id: "weather",
                name: "Weather",
                type: "text_short",
                required: true
            }
        ]
    });
    const { setRecord } = createRecordInput({
        placeholder: "subrecord-form",
        recordType: "rockClimbing",
        subrecords: true,
        title: "Add Climb",
        onFirstRecordSet: () => {
            document.getElementById("subrecord-form-container").style.display = "block";
        },
        inputs: [
            {
                id: "route_name",
                name: "Route Name",
                type: "text_short",
                required: true
            },
            {
                id: "method",
                name: "Method",
                type: "selection",
                required: true,
                selection: {
                    options: [
                        "Top Rope",
                        "On Sight",
                        "Red Point",
                        "Dogged",
                        "Lead Bolt",
                        "Lead Natural",
                        "Alternate Lead",
                        "Second Bolt",
                        "Second Natural"
                    ]
                }
            },
            {
                id: "grade",
                name: "Grade",
                type: "text_short",
                required: true
            },
            {
                id: "pitches",
                name: "Pitches",
                type: "range",
                range: {
                    min: 0,
                    max: 50,
                    value: 0,
                    display: value => value
                }
            }
        ]
    });
    createFlexibleRD({
        placeholder: "records",
        recordType: "rockClimbing",
        setRecord
    });
});