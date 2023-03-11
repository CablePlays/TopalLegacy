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

    const signoffRequests = (await post("/get-signoff-requests")).values;

    for (let request of signoffRequests) {
        const { award, id: requestId, user } = request;

        const div = document.createElement("div");
        div.classList.add("item");

        const nameElement = document.createElement("h2");
        nameElement.innerHTML = `Request from ${user.name}`;
        div.appendChild(nameElement);

        const awardElement = document.createElement("h3");
        awardElement.innerHTML = getAwardName(award) + " Award";
        div.appendChild(awardElement);

        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("button-container");

        const profileElement = document.createElement("a");
        profileElement.innerHTML = "Review";
        profileElement.target = "_blank";
        profileElement.href = `/profile/admin?user=${user.id}`;
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
            promptConfirmation(`You're about to grant ${user.name} the ${getAwardName(award)} Award.`, () => {
                post("/set-award", {
                    id: award,
                    complete: true,
                    user: user.id
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
                post("/decline-signoff-request", {
                    id: requestId,
                    message
                });

                div.remove();
                checkCount();
            }

            if (message == null || message.replaceAll(" ", "").length === 0) {
                promptConfirmation("You haven't left a message for the pupil.", handle);
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