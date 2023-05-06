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
    let awardPath = last;

    for (let a of ["instructor", "leader"]) {
        if (last.endsWith(a)) {
            awardPath = last.substring(0, last.length - a.length - 1);
            break;
        }
    }

    path += awardPath;

    for (let element of [...document.getElementsByClassName("sequel-awards")]) { // copy due to updating on replace
        // types
        const typesAttribute = element.getAttribute("data-types");
        const types = typesAttribute.split(" ");

        // contaainer
        const container = document.createElement("div");
        container.classList.add("sequel-container");

        for (let type of types) {
            let name;
            let href;

            switch (parseInt(type)) {
                case 0:
                    name = "Basic Award";
                    href = path;
                    break;
                case 1:
                    name = "Instructor Award";
                    href = path + "-instructor";
                    break;
                case 2:
                    name = "Leader Award";
                    href = path + "-leader";
                    break;
                default:
                    console.warn("Invalid type: " + type);
                    continue;
            }

            const instructorLink = createElement("a", container, name);
            instructorLink.href = href;
            instructorLink.classList.add("sequel-link");
        }

        element.replaceWith(container);
    }
});