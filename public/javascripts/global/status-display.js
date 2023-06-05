/*
    Handles displaying the status of an award or approval.
*/

function _createStatusDisplay(options) {
    const {
        awardStatus,
        display,
        id // award or approval
    } = options;

    const container = document.createElement("div");
    container.classList.add("status-display");

    const topContainer = createElement("div", container);
    topContainer.classList.add("top");

    /* Status */

    const statusContainer = createElement("div", topContainer);
    statusContainer.classList.add("status-container");

    createElement("h3", statusContainer, display ?? "Complete");

    const checkboxElement = createElement("img", statusContainer);
    checkboxElement.src = IMAGE_LOADING;

    /* Date */

    const dateContainer = createElement("div", topContainer);
    dateContainer.classList.add("date-container");

    createElement("h3", dateContainer, "Date");
    const dateElement = createElement("p", dateContainer, LOADING_TEXT);

    /* Signer */

    const signerContainer = createElement("div", topContainer);
    signerContainer.classList.add("signer-container");

    createElement("h3", signerContainer, "Signed By");
    const signerElement = createElement("p", signerContainer, LOADING_TEXT);

    /* Fetch */

    const userId = getUserId();
    let promise;

    if (awardStatus) {
        promise = new Promise(async r => {
            const { awards } = await getRequest(`/users/${userId}/awards`);
            r(awards[id] ?? {});
        });
    } else {
        promise = new Promise(async r => {
            const { approvals } = await getRequest(`/users/${userId}/approvals`);
            r(approvals[id] ?? {});
        });
    }

    promise.then(json => {
        const { complete, date, signer } = json;

        /* Display Status */

        checkboxElement.src = checkboxImage(complete);
        dateElement.innerHTML = (complete ? formatDate(date) : "-");
        signerElement.innerHTML = (complete ? signer.fullName : "-");

        /* Request & Declined */

        if (awardStatus && !complete) {
            const { decline, requestDate } = json;

            container.appendChild(createSpacer(20));
            createElement("div", container).classList.add("line");
            container.appendChild(createSpacer(20));

            const bottomContainer = createElement("div", container);
            bottomContainer.classList.add("bottom");

            const updateRequestSection = (requested, reset) => {
                if (reset) {
                    bottomContainer.innerHTML = null;
                }
                if (requested) {
                    createElement("h4", bottomContainer, "Sign-Off Requested");
                    createElement("p", bottomContainer, "You have requested for this award to be signed off. Check back later to see if your request was accepted.")
                        .classList.add("partial");

                    bottomContainer.appendChild(createSpacer(10));

                    const unrequestButton = createElement("button", bottomContainer, "Cancel Request");
                    unrequestButton.classList.add("request-button");
                    unrequestButton.classList.add("transparent-button");
                    unrequestButton.addEventListener("click", () => {
                        promptConfirmation(`You're about to cancel your award sign-off request.`, () => {
                            putRequest(`/users/${userId}/awards/requests`, {
                                award: id,
                                complete: false
                            });

                            updateRequestSection(false, true);
                        });
                    });
                } else {
                    createElement("h4", bottomContainer, "Request Sign-Off");
                    createElement("p", bottomContainer, "Think you're ready for your award to be signed off? Submit a request to notify staff members.")
                        .classList.add("partial");

                    bottomContainer.appendChild(createSpacer(10));

                    const requestButton = createElement("button", bottomContainer, "Request");
                    requestButton.classList.add("request-button");
                    requestButton.classList.add("transparent-button");
                    requestButton.addEventListener("click", () => {
                        promptConfirmation(`You're about to request an award sign-off.`, () => {
                            putRequest(`/users/${userId}/awards/requests`, {
                                award: id,
                                complete: true
                            });

                            updateRequestSection(true, true);
                        });
                    });
                }
            };

            if (requestDate) {

                /* Requested & Unrequest Option */

                updateRequestSection(true);
            } else {

                /* Decline Info */

                if (decline) {
                    const { date: declineDate, message: declineMessage, user: declineUser } = decline;

                    createElement("h4", bottomContainer, "Request declined by " + declineUser.fullName);
                    createElement("p", bottomContainer, formatDate(declineDate));
                    createElement("p", bottomContainer, declineMessage ?? "No reason given.").classList.add("partial");

                    bottomContainer.appendChild(createSpacer(20));
                }

                /* Request Option */

                updateRequestSection(false);
            }
        }
    });

    return container;
}

function _loadStatuses(className, awardStatus) {
    const statuses = [...document.getElementsByClassName(className)];
    if (statuses.length === 0) return;

    for (let status of statuses) {
        const id = status.getAttribute("data-id");
        const display = status.getAttribute("data-display") ?? "Complete";

        status.replaceWith(_createStatusDisplay({
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