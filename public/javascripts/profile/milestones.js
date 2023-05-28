function loadMilestones() {
    const milestonesTable = document.getElementById("milestones-table");
    const template = [
        ["team", "Team Award", "Requires 4 awards"],
        ["halfColors", "Half Colors", "Requires 7 awards"],
        ["colors", "Colors", "Requires 10 awards"],
        ["merit", "Merit Award", "Awarded, not earned"],
        ["honors", "Honors", "Requirements coming soon"]
    ];

    const milestonesPromise = new Promise(async r => r((await getRequest(`/users/${getProfileUser()}/milestones`)).milestones));

    template.forEach(a => {
        const [id, title, description] = a;

        const tr = document.createElement("tr");
        milestonesTable.append(tr);

        const textContainer = createElement("td", tr);
        createElement("h2", textContainer, title).classList.add("title");
        createElement("p", textContainer, description).classList.add("description");

        const checkbox = document.createElement("td");
        const checkboxImage = createCheckbox(new Promise(async r => r((await milestonesPromise)[id] === true)));
        checkbox.appendChild(checkboxImage);
        tr.appendChild(checkbox);
    });
}

window.addEventListener("load", () => {
    loadMilestones();
});