window.addEventListener("load", () => {
    createFlexibleLD({
        placeholder: "log-placeholder",
        logType: "solitaireInstructor",
        removable: true,
        singleton: true,
        inputOptions: {
            title: "Instructor Log",
            successMessage: "Your log has been created!",
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
});