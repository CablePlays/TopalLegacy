window.addEventListener("load", () => {
    createSignoffDisplay({
        placeholder: "signoffs",
        type: "traverse"
    });
    createFlexibleRD({
        placeholder: "hike-plan-placeholder",
        recordType: "traverseHikePlan",
        removable: true,
        singleton: true,
        inputOptions: {
            title: "Link Hike Plan",
            successMessage: "Your hike plan has been linked!",
            inputs: [
                {
                    id: "link",
                    name: "Google Doc Link",
                    type: "url",
                    required: true
                }
            ]
        }
    });
    createFlexibleRD({
        placeholder: "summaries-placeholder",
        recordType: "traverseSummaries",
        removable: true,
        singleton: true,
        inputOptions: {
            title: "Link Summaries",
            successMessage: "Your summaries have been linked!",
            inputs: [
                {
                    id: "link",
                    name: "Google Doc Link",
                    type: "url",
                    required: true
                }
            ]
        }
    });
});