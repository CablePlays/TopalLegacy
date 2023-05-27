function loadMilestones() {
    const milestonesTable = document.getElementById("milestones-table");
    const template = [
        ["team", "Team Award"],
        ["halfColors", "Half Colors"],
        ["colors", "Colors"],
        ["merit", "Merit Award"],
        ["honors", "Honors"]
    ];

    const milestonesPromise = new Promise(async r => r((await getRequest(`/users/${getProfileUser()}/milestones`)).milestones));

    template.forEach(a => {
        const id = a[0];
        const display = a[1];

        const tr = document.createElement("tr");

        const title = document.createElement("td");
        title.innerHTML = display;
        tr.appendChild(title);

        const checkbox = document.createElement("td");
        const checkboxImage = createCheckbox(new Promise(async r => r((await milestonesPromise)[id] === true)));
        checkbox.appendChild(checkboxImage);
        tr.appendChild(checkbox);

        milestonesTable.append(tr);
    });
}

window.addEventListener("load", () => {
    loadMilestones();
});