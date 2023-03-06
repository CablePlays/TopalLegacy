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

            const messageElement = bottom.children[1];

            if (decline != null) {
                const { date: declineDate, message: declineMessage, user: declineUser } = decline;

                messageElement.appendChild(createSpacer(20));
                createElement("h3", messageElement, "Request declined by " + declineUser.name);
                createElement("p", messageElement, formatDate(declineDate));

                if (declineMessage != null) {
                    createElement("p", messageElement, declineMessage);
                }
            }

            /* Request */

            const requestElement = bottom.children[2];
            const requestButton = requestElement.children[1];
            const requestedIndication = requestElement.children[2];

            if (requested === true) {
                requestButton.style.display = "none";
            } else {
                requestedIndication.style.display = "none";
                requestButton.addEventListener("click", () => {
                    messageElement.style.display = "none";
                    requestButton.style.display = "none";
                    requestedIndication.style.display = "block";

                    post("/request-signoff", {
                        award: awardId
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