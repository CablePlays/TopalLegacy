async function setupRecord() {
    createFlexibleRD({
        placeholder: "record-placeholder",
        recordType: "solitaireLeader",
        removable: true,
        singleton: true,
        inputOptions: {
            title: "Leader Record",
            successMessage: "Your record has been created!",
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
                    type: "textShort",
                    required: true
                },
                {
                    id: "groupSupervised",
                    name: "Group Supervised",
                    type: "textLong",
                    required: true
                },
                {
                    id: "comments",
                    name: "Comments",
                    description: "Also include any problems that were overcome.",
                    type: "textLong",
                    required: true
                }
            ]
        }
    });
}

window.addEventListener("load", () => {
    setupRecord();
});