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

function setupAwards() {
    const profileUser = getProfileUser();
    const awardsContainer = document.getElementById("awards-container");

    const extras = {
        rock_climbing: {
            after: card => {
                card.appendChild(createSpacer(20));

                const label = document.createElement("h3");
                label.innerHTML = "Belayer Signoff";
                card.appendChild(label);

                card.appendChild(createSpacer(20));

                const image = createCheckbox(new Promise(async r => {
                    const { approvals } = await getRequest(`/users/${profileUser}/approvals`);
                    r(approvals.rockClimbingBelayer?.complete === true);
                }));
                image.classList.add("checkbox");
                card.appendChild(image);
            }
        },
        running: {
            before: meterExtra(100000, value => `${value / 1000}km / 100km`, async () =>
                (await getRequest(`/users/${profileUser}/logs/distance-run`)).distance)
        },
        service: {
            before: meterExtra(90000, value => `${formatDuration(value, false)} / 25h`, async () =>
                (await getRequest(`/users/${profileUser}/logs/service-hours`)).time)
        }
    };

    const awardsPromise = getAwards(profileUser);

    AWARDS.forEach(award => {
        const [id, display] = award;

        const card = document.createElement("div");
        card.classList.add("card");

        const title = document.createElement("h2");
        title.innerHTML = display;
        card.appendChild(title);

        const extra = extras[id] ?? {};
        if (extra.before != null) extra.before(card);

        card.appendChild(createSpacer(20));

        const checkbox = createCheckbox(new Promise(async r => r((await awardsPromise)[id]?.complete === true)));
        checkbox.classList.add("checkbox");
        card.appendChild(checkbox);

        if (extra.after != null) extra.after(card);
        awardsContainer.appendChild(card);
    });
}

window.addEventListener("load", () => {
    setupAwards();
});