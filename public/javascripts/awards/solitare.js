async function setupRecord() {
    const element = createFlexibleRD({
        recordType: "solitaire",
        removable: true,
        singleton: true,
        inputOptions: {
            title: "Add Solitaire Record",
            successMessage: "Your solitaire record has been created!",
            endpoint: "/set-solitaire-record",
            inputs: [
                {
                    id: "date",
                    name: "Date",
                    type: "date",
                    required: true
                },
                {
                    id: "location",
                    name: "Location",
                    type: "text_short",
                    required: true
                },
                {
                    id: "othersInvolved",
                    name: "Others Involved",
                    type: "text_short",
                    required: true
                },
                {
                    id: "supervisors",
                    name: "Supervisors",
                    type: "text_short",
                    required: true
                },
                {
                    id: "items",
                    name: "What I Took With Me",
                    type: "text_short",
                    required: true
                },
                {
                    id: "experienceDescription",
                    name: "The Experience Described In One Paragraph",
                    type: "text_long",
                    required: true
                }
            ]
        }
    });

    document.getElementById("record-placeholder").replaceWith(element);
}

window.addEventListener("load", () => {
    setupRecord();
});