window.addEventListener("load", () => {
    createFlexibleLD({
        placeholder: "log-placeholder",
        logType: "solitaire",
        removable: true,
        singleton: true,
        inputOptions: {
            title: "Create Solitaire Log",
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
                    id: "othersInvolved",
                    name: "Others Involved",
                    type: "textShort",
                    required: true
                },
                {
                    id: "supervisors",
                    name: "Supervisors",
                    type: "textShort",
                    required: true
                },
                {
                    id: "items",
                    name: "What I Took With Me",
                    type: "textShort",
                    required: true
                },
                {
                    id: "experience",
                    name: "The Experience Described In One Paragraph",
                    type: "textLong",
                    required: true
                }
            ]
        }
    });
});