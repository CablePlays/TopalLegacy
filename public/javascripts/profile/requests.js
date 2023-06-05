/* Awards */

function checkAwardsNone() {
    const container = document.getElementById("award-requests");

    if (container.children.length === 0) {
        container.replaceWith(createElement("p", null, NONE_TEXT));
    }
}

function createAwardRequestCard(award, date) {
    const card = document.createElement("div");
    card.classList.add("award-request");

    createElement("h3", card, getAwardName(award)); // award
    card.appendChild(createSpacer(10));
    createElement("h4", card, formatDate(date)); // date
    card.appendChild(createSpacer(20));

    const buttonContainer = createElement("div", card);
    buttonContainer.classList.add("button-container");

    /* Accept */

    const acceptButton = createElement("button", buttonContainer, "Accept");
    acceptButton.classList.add("transparent-button");

    acceptButton.addEventListener("click", () => {
        promptConfirmation("You are about to grant an award.", () => {
            card.remove();
            checkAwardsNone();

            putRequest(`/users/${getProfileUser()}/awards`, {
                award,
                complete: true
            });
        });
    });

    /* Decline */

    const declineButton = createElement("button", buttonContainer, "Decline");
    declineButton.classList.add("transparent-button");

    /* Message Area */

    card.appendChild(createSpacer(20));
    const messageInput = createElement("textarea", card);

    declineButton.addEventListener("click", () => {
        const message = messageInput.value.trim();

        promptConfirmation((message === "")
            ? "You are about to decline an award sign-off request, but you have not left the student a message."
            : "You are about to decline an award sign-off request.", () => {
                card.remove();
                checkAwardsNone();
                deleteRequest(`/users/${getProfileUser()}/awards/requests/${award}`, message === "" ? undefined : { message });
            });
    });

    return card;
}

async function loadAwardRequests() {
    const awardRequestsContainer = document.getElementById("award-requests");

    const loadingIcon = createLoadingIcon(); // loading icon
    awardRequestsContainer.appendChild(loadingIcon);

    const { awards } = await getRequest(`/users/${getProfileUser()}/awards`);

    loadingIcon.remove();

    for (let key of Object.keys(awards)) {
        const { requestDate } = awards[key];

        if (requestDate) {
            const card = createAwardRequestCard(key, requestDate);
            awardRequestsContainer.appendChild(card);
            none = false;
        }
    }

    checkAwardsNone();
}

/* Signoffs */

function checkSignoffsNone() {
    const container = document.getElementById("signoff-requests");
    const children = [...container.children];

    for (let i = 1; i < children.length; i += 2) {
        const signoffTypeContainer = children[i];

        if (signoffTypeContainer.children.length === 0) {
            children[i - 1].remove(); // remove heading
            signoffTypeContainer.remove();
        }
    }

    if (container.children.length === 0) {
        createElement("p", container, NONE_TEXT);
    }
}

function createSignoffRequestCard(signoffType, signoff, date) {
    const card = document.createElement("div");
    card.classList.add("signoff-request");

    createElement("h3", card, "Sign-Off Request"); // title
    card.appendChild(createSpacer(10));
    createElement("h4", card, formatDate(date)); // date
    card.appendChild(createSpacer(10));
    createElement("p", card, getSignoffDescription(signoffType, signoff)); // signoff description
    card.appendChild(createSpacer(20));

    const buttonContainer = createElement("div", card);
    buttonContainer.classList.add("button-container");

    const acceptButton = createElement("button", buttonContainer, "Accept");
    acceptButton.classList.add("transparent-button");

    acceptButton.addEventListener("click", () => {
        promptConfirmation("You are about to accept a sign-off request.", () => {
            card.remove();
            checkSignoffsNone();
            putRequest(`/users/${getProfileUser()}/signoffs`, {
                type: signoffType,
                signoff,
                complete: true
            });
        });
    });

    const declineButton = createElement("button", buttonContainer, "Decline");
    declineButton.classList.add("transparent-button");

    declineButton.addEventListener("click", () => {
        promptConfirmation("You are about to decline a sign-off request.", () => {
            card.remove();
            checkSignoffsNone();
            deleteRequest(`/users/${getProfileUser()}/signoffs/requests/${signoffType}/${signoff}`);
        });
    });

    return card;
}

async function loadSignoffRequests() {
    const signoffRequestsContainer = document.getElementById("signoff-requests");

    const loadingIcon = createLoadingIcon(); // loading icon
    signoffRequestsContainer.appendChild(loadingIcon);

    const { signoffs } = await getRequest(`/users/${getProfileUser()}/signoffs`);

    loadingIcon.remove();

    for (let award of AWARDS) {
        const [awardId, awardName] = award;
        const typedSignoffs = signoffs[awardId] ?? {};
        const typedSignoffRequestsContainer = document.createElement("div");

        for (let signoffId of Object.keys(typedSignoffs)) {
            const { requestDate } = typedSignoffs[signoffId];

            if (requestDate) {
                const card = createSignoffRequestCard(awardId, signoffId, requestDate);
                typedSignoffRequestsContainer.appendChild(card);
            }
        }

        if (typedSignoffRequestsContainer.children.length > 0) {
            createElement("h3", signoffRequestsContainer, awardName); // type section title
            signoffRequestsContainer.appendChild(typedSignoffRequestsContainer);
            typedSignoffRequestsContainer.classList.add("signoff-requests-container");
        }
    }

    checkSignoffsNone();
}

window.addEventListener("load", () => {
    loadAwardRequests();
    loadSignoffRequests();
});