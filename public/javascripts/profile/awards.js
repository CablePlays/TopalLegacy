function approvalExtra(title, approval) {
    return card => {
        card.appendChild(createSpacer(20));

        const label = document.createElement("h3");
        label.innerHTML = title;
        card.appendChild(label);

        card.appendChild(createSpacer(20));

        const image = createCheckbox(new Promise(async r => {
            const { approvals } = await getRequest(`/users/${getProfileUser()}/approvals`);
            r(approvals[approval]?.complete === true);
        }));

        image.classList.add("checkbox");
        card.appendChild(image);
    }
}

function meterExtra(max, display, supplier) {
    return async card => {
        const label = document.createElement("h3");
        label.innerHTML = LOADING_TEXT;
        card.appendChild(label);

        const meter = document.createElement("meter");
        meter.classList.add("partial");
        meter.max = max;
        card.appendChild(meter);

        const value = await supplier();
        label.innerHTML = display(value);
        meter.value = value;
    };
}

const EXTRAS = {
    rockClimbing: {
        checkboxes: [{
            type: "approval",
            title: "Belayer Sign-Off",
            approval: "rockClimbingBelayer"
        }]
    },
    running: {
        meter: {
            display: value => `${value / 1000}km / 100km`,
            max: 100000,
            supplier: async () => (await getRequest(`/users/${getProfileUser()}/logs/distance-run`)).distance
        }
    },
    service: {
        meter: {
            display: value => `${formatDuration(value, false)} / 25h`,
            max: 90000,
            supplier: async () => (await getRequest(`/users/${getProfileUser()}/logs/service-hours`)).time
        }
    },
    venture: {
        checkboxes: [{
            type: "approval",
            title: "Proposal Approved",
            approval: "ventureProposal"
        }]
    }
}

function createCard(award, awardsPromise) {
    const [awardId, cardTitle] = award;

    /* Card */

    const card = document.createElement("div");
    card.classList.add("card");

    createElement("h2", card, cardTitle);

    const { checkboxes, meter } = EXTRAS[awardId] ?? {};

    /* Meter */

    if (meter == null) {
        card.appendChild(createSpacer(20));
    } else {
        const { display, max, supplier } = meter;
        const label = createElement("h3", card, LOADING_TEXT);

        const meterElement = createElement("meter", card);
        meterElement.max = max;

        supplier().then(value => {
            label.innerHTML = display(value);
            meterElement.value = value;
        });
    }

    /* Checkboxes */

    const checkboxesContainer = createElement("div", card);
    checkboxesContainer.classList.add("checkboxes-container");

    function createCheckboxSection(checkboxTitle, supplierPromise) {
        const checkboxContainer = createElement("div", checkboxesContainer);
        checkboxContainer.classList.add("checkbox-container");

        createElement("h3", checkboxContainer, checkboxTitle);

        const checkbox = createCheckbox(supplierPromise);
        checkbox.classList.add("checkbox");
        checkboxContainer.appendChild(checkbox);
    }

    createCheckboxSection("Achieved", new Promise(async r => r((await awardsPromise)[awardId]?.complete === true)));

    if (checkboxes != null) {
        checkboxes.forEach(checkbox => {
            const { title, type } = checkbox;
            let promise;

            if (type === "approval") {
                const { approval } = checkbox;

                promise = new Promise(async r => {
                    const { approvals } = await getRequest(`/users/${getProfileUser()}/approvals`);
                    r(approvals[approval]?.complete === true);
                });
            } else {
                throw new Error("Invalid type: " + type);
            }

            createCheckboxSection(title, promise);
        });
    }

    return card;
}

function setupAwards() {
    const profileUser = getProfileUser();
    const awardsContainer = document.getElementById("awards-container");

    const awardsPromise = getAwards(profileUser);
    AWARDS.forEach(award => {
        const card = createCard(award, awardsPromise);
        awardsContainer.appendChild(card);
    });
}

window.addEventListener("load", () => {
    setupAwards();
});