async function loadMilestones() {
    const milestonesTable = document.getElementById("milestones-table");

    const loading = createLoading();
    milestonesTable.parentElement.insertBefore(loading, milestonesTable);

    const template = [
        ["team", "Team Award"],
        ["halfColors", "Half Colors"],
        ["colors", "Colors"],
        ["merit", "Merit Award"],
        ["honors", "Honors"]
    ];

    const res = await fetch("/get-milestones", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: getProfileUser()
        })
    });

    const milestones = (await res.json()).values;
    loading.remove();

    template.forEach(a => {
        const id = a[0];
        const display = a[1];

        const complete = (milestones[id] === true);

        const tr = document.createElement("tr");

        const title = document.createElement("td");
        title.innerHTML = display;
        tr.appendChild(title);

        const checkbox = document.createElement("td");
        const checkboxImage = document.createElement("img");
        checkboxImage.src = "/images/" + (complete ? "checked.png" : "unchecked.png");
        checkbox.appendChild(checkboxImage);
        tr.appendChild(checkbox);

        milestonesTable.append(tr);
    });
}

window.addEventListener("load", () => {
    loadMilestones();
});