async function setupCheckboxes() {
    const profileUser = getProfileUser();
    const awards = await getAwards(profileUser);

    const checkboxes = document.getElementsByClassName("checkbox");

    for (let checkbox of checkboxes) {
        const award = checkbox.getAttribute("data-award");

        if (awards.includes(award)) {
            checkbox.setAttribute("src", "/images/checked.png");
        } else {
            checkbox.setAttribute("src", "/images/unchecked.png");
        }
    }
}

async function setupDistanceRun() {
    let res = await fetch("/get-distance-run", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: getProfileUser()
        })
    });

    let { distance } = await res.json();

    document.getElementById("running-distance-label").innerHTML = `${distance}m / 100000m`;
    document.getElementById("running-distance-meter").value = distance;
}

window.addEventListener("load", () => {
    setupCheckboxes();
    setupDistanceRun();
});