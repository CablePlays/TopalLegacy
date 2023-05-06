/*
    Handles displaying navigation between basic, instructor and leader awards.
*/

window.addEventListener("load", () => {
    const url = window.location.href;
    const parts = url.split("/");
    const last = parts[parts.length - 1];

    // create path excluding last
    let path = parts[0] + "//";

    for (let i = 2; i < parts.length - 1; i++) {
        path += parts[i] + "/";
    }

    // get award path (excludes sequel appendage)
    let awardPath;
    let types = []; // basic, instructor, leader

    if (last.endsWith("instructor")) {
        awardPath = last.substring(0, last.length - "-instructor".length);
        types.push(0);
        types.push(2);
    } else if (last.endsWith("leader")) {
        awardPath = last.substring(0, last.length - "-leader".length);
        types.push(0);
        types.push(1);
    } else {
        awardPath = last;
        types.push(1);
        types.push(2);
    }

    path += awardPath;

    for (let element of [...document.getElementsByClassName("sequel-awards")]) { // copy due to updating on replace
        const container = document.createElement("div");
        container.classList.add("sequel-container");

        if (types.includes(0)) {
            const instructorLink = createElement("a", container, "Basic Award");
            instructorLink.href = path;
            instructorLink.classList.add("instructor-link");
        }
        if (types.includes(1)) {
            const instructorLink = createElement("a", container, "Instructor Award");
            instructorLink.href = path + "-instructor";
            instructorLink.classList.add("instructor-link");
        }
        if (types.includes(2)) {
            const leaderLink = createElement("a", container, "Leader Award");
            leaderLink.href = path + "-leader";
            leaderLink.classList.add("leader-link");
        }

        element.replaceWith(container);
    }
});