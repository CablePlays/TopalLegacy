/*
    Handles the divs that display the status of awards:
    complete, date complete and signer.
*/

function createAwardStatus(display, promise, awardId) {
    const template = document.getElementById("award-status-template");
    const clone = template.content.cloneNode(true).firstChild;
    const top = clone.children[0];
    const bottom = clone.children[1];

    // status
    top.children[0].children[0].innerHTML = display;
    top.children[0].children[1].src = IMAGE_LOADING;

    // date
    top.children[1].children[1].innerHTML = LOADING_TEXT;

    // signer
    top.children[2].children[1].innerHTML = LOADING_TEXT;

    bottom.style.display = "none";

    promise.then(json => {
        const { award, requested } = json;
        const complete = award.complete === true;
        const { date, decline, signer } = award;

        /* Top */

        // status
        top.children[0].children[1].src = checkboxImage(complete);

        // date
        top.children[1].children[1].innerHTML = (complete ? formatDate(date) : "-");

        // signer
        top.children[2].children[1].innerHTML = (complete ? signer.name : "-");

        /* Bottom */

        if (!complete && requested !== null) {
            bottom.style.display = "block";

            /* Message */

            const declineElement = bottom.children[1];

            if (decline != null) {
                const { date: declineDate, message: declineMessage, user: declineUser } = decline;

                declineElement.appendChild(createSpacer(20));
                createElement("h3", declineElement, "Request declined by " + declineUser.name);
                createElement("p", declineElement, formatDate(declineDate));

                if (declineMessage != null) {
                    createElement("p", declineElement, declineMessage);
                }
            }

            /* Request */

            const requestElement = bottom.children[2];
            const requestDiv = requestElement.children[0];
            const requestButton = requestDiv.children[3];
            const requestedDiv = requestElement.children[1];

            if (requested === true) {
                requestDiv.style.display = "none";
            } else {
                requestedDiv.style.display = "none";

                requestButton.addEventListener("click", () => {
                    promptConfirmation(`You're about to request a sign-off on your ${getAwardName(awardId)} award.`, () => {
                        declineElement.style.display = "none";
                        requestDiv.style.display = "none";
                        requestedDiv.style.display = "block";

                        post("/request-signoff", {
                            award: awardId
                        });
                    });
                });
            }
        }
    });

    return clone;
}

window.addEventListener("load", () => {
    const statuses = [...document.getElementsByClassName("award-status")]; // put into array to prevent original from shrinking on remove
    if (statuses.length === 0) return;

    for (let status of statuses) {
        const award = status.getAttribute("data-award");
        const promise = post("/get-status-data", { award });

        const awardStatus = createAwardStatus("Complete", promise, award);
        status.parentElement.replaceChild(awardStatus, status);
    }
});