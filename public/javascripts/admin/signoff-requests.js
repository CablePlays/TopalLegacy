function getContainer() {
    return document.getElementById("requests-container");
}

function setInfo(areRequests) {
    document.getElementById("info-heading").innerHTML = (areRequests ? "What are sign-off requests?" : "No sign-off requests!");
}

function checkCount() {
    setInfo(getContainer().children.length > 0);
}

async function loadRequests() {
    const container = getContainer();

    // loading
    const loading = createLoading(true);
    container.replaceWith(loading);

    const { requests: signoffRequests } = await getRequest("/awards/requests");

    for (let request of signoffRequests) {
        const { award, id: requestId, user } = request;

        const div = document.createElement("div");
        div.classList.add("item");

        const infoContainer = createElement("div", div);
        createElement("p", infoContainer, "Request from");
        createElement("h2", infoContainer, user.fullName);
        createElement("h3", infoContainer, getAwardName(award) + " Award");

        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("button-container");

        const profileElement = document.createElement("a");
        profileElement.innerHTML = "Review";
        profileElement.target = "_blank";
        profileElement.href = `/profile/${user.id}/admin`;
        profileElement.classList.add("transparent-button");
        buttonDiv.appendChild(profileElement);

        const declineElement = document.createElement("button");
        declineElement.innerHTML = "Decline";
        declineElement.classList.add("transparent-button");
        buttonDiv.appendChild(declineElement);

        const grantElement = document.createElement("button");
        grantElement.innerHTML = "Grant";
        grantElement.classList.add("transparent-button");
        grantElement.addEventListener("click", () => {
            promptConfirmation(`You're about to grant ${user.fullName} the ${getAwardName(award)} Award.`, () => {
                putRequest(`/users/${user.id}/awards`, {
                    award,
                    complete: true
                });

                div.remove();
                checkCount();
            });
        });
        buttonDiv.appendChild(grantElement);

        div.appendChild(buttonDiv);

        const messageDescriptionElement = document.createElement("p");
        messageDescriptionElement.innerHTML = "Before you decline a sign-off, leave a message for the student down below telling them why it was declined."
        div.appendChild(messageDescriptionElement);

        const messageElement = document.createElement("textarea");
        div.appendChild(messageElement);

        // decline button function
        declineElement.addEventListener("click", () => {
            const message = messageElement.value;
            const handle = () => {
                deleteRequest(`/awards/requests/${requestId}`, { message });
                div.remove();
                checkCount();
            }

            if (message == null || message.trim().length === 0) {
                promptConfirmation("You haven't left a message for the student.", handle);
            } else {
                handle();
            }
        });

        container.appendChild(div);
    }

    loading.replaceWith(container);
}

window.addEventListener("load", () => {
    setInfo(true);
    loadRequests().then(checkCount);
});