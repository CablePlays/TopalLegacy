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
        const { award, id, user } = request;

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
        profileElement.innerHTML = "View Profile";
        profileElement.href = `/profile/admin?user=${user.id}`;
        profileElement.classList.add("transparent-button");
        buttonDiv.appendChild(profileElement);

        const declineElement = document.createElement("button");
        declineElement.innerHTML = "Decline";
        declineElement.classList.add("transparent-button");
        buttonDiv.appendChild(declineElement);

        div.appendChild(buttonDiv);

        const messageDescriptionElement = document.createElement("p");
        messageDescriptionElement.innerHTM = "Before you decline a sign-off, add a message for the student down below telling them why it was declined."
        div.appendChild(messageDescriptionElement);

        const messageElement = document.createElement("textarea");
        div.appendChild(messageElement);

        // decline button function
        declineElement.addEventListener("click", () => {
            post("/decline-signoff-request", {
                id,
                message: messageElement.value
            });

            div.remove();
            checkCount();
        });

        container.appendChild(div);
    }

    loading.replaceWith(container);
}

window.addEventListener("load", () => {
    setInfo(true);
    loadRequests().then(checkCount);
});