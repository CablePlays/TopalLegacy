/*
    Handles the divs that display the status of awards:
    complete, date complete and signer.
*/

function createAwardStatus(options) {
    const {
        awardStatus,
        display,
        id // award or approval
    } = options;

    const clone = document.getElementById("status-display-template").content.cloneNode(true).firstChild;
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

    const userId = getUserId();
    let promise;

    if (awardStatus) {
        promise = new Promise(async r => {
            const { awards } = await getRequest(`/users/${userId}/awards`);
            r(awards[id]);
        });
    } else {
        promise = new Promise(async r => {
            const { approvals } = await getRequest(`/users/${userId}/approvals`);
            r(approvals[id]);
        });
    }

    promise.then(status => {
        const { complete, date, decline, signer, requested } = status ?? {};

        /* Top */

        // status
        top.children[0].children[1].src = checkboxImage(complete);

        // date
        top.children[1].children[1].innerHTML = (complete ? formatDate(date) : "-");

        // signer
        top.children[2].children[1].innerHTML = (complete ? signer.fullName : "-");

        /* Bottom */

        if (awardStatus && !complete) {
            bottom.style.display = "block";

            /* Message */

            const declineElement = bottom.children[1];

            if (decline != null) {
                const { date: declineDate, message: declineMessage, user: declineUser } = decline;

                declineElement.appendChild(createSpacer(20));
                createElement("h3", declineElement, "Request declined by " + declineUser.fullName);
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
                    promptConfirmation(`You're about to request a sign-off on your ${getAwardName(id)} award.`, () => {
                        postRequest("/awards/requests", { award: id });
                        
                        declineElement.style.display = "none";
                        requestDiv.style.display = "none";
                        requestedDiv.style.display = "block";
                    });
                });
            }
        }
    });

    return clone;
}

function _loadStatuses(className, awardStatus) {
    const statuses = [...document.getElementsByClassName(className)]; // put into array to prevent original from shrinking on remove
    if (statuses.length === 0) return;

    for (let status of statuses) {
        const id = status.getAttribute("data-id");
        const display = status.getAttribute("data-display") ?? "Complete";

        status.replaceWith(createAwardStatus({
            awardStatus,
            display,
            id
        }));
    }
}

window.addEventListener("load", () => {
    _loadStatuses("award-status", true);
    _loadStatuses("approval-status", false);
});