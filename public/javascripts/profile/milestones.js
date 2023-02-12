async function loadMilestones() {
    const milestoneContainer = document.getElementById("milestone-container");
    const template = [
        ["teamAward", "Team Award"],
        ["halfColors", "Half Colors"],
        ["colors", "Colors"],
        ["meritAward", "Merit Award"],
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

    template.forEach(a => {
        const id = a[0];
        const display = a[1];

        const complete = !!milestones[id];

        const div = document.createElement("div");
        div.classList.add("milestone");

        const title = document.createElement("h2");
        title.innerHTML = display;
        div.appendChild(title);

        const checkbox = document.createElement("img");
        checkbox.classList.add("checkbox");
        checkbox.src = `/images/${complete ? "checked" : "unchecked"}.png`;
        div.appendChild(checkbox);

        milestoneContainer.append(div);
    });
}

window.addEventListener("load", () => {
    loadMilestones();
});