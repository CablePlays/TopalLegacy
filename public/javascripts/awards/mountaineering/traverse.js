window.addEventListener("load", () => {
    createSignoffDisplay({
        placeholder: "signoffs",
        type: "traverse"
    });
    createFlexibleLD({
        placeholder: "hike-plan-placeholder",
        logType: "traverseHikePlan",
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
    createFlexibleLD({
        placeholder: "summaries-placeholder",
        logType: "traverseSummaries",
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