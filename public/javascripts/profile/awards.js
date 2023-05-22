function meterExtra(max, display, endpoint) {
    return async card => {
        const label = document.createElement("h3");
        label.innerHTML = LOADING_TEXT;
        card.appendChild(label);

        const meter = document.createElement("meter");
        meter.classList.add("partial");
        meter.max = max;
        card.appendChild(meter);

        let res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: getProfileUser()
            })
        });

        let { value } = await res.json();

        label.innerHTML = display(value);
        meter.value = value;
    };
}

function setupAwards() {
    const profileUser = getProfileUser();
    const awardsContainer = document.getElementById("awards-container");

    const extras = {
        rockClimbing: {
            after: card => {
                card.appendChild(createSpacer(20));

                const label = document.createElement("h3");
                label.innerHTML = "Belayer Signoff";
                card.appendChild(label);

                card.appendChild(createSpacer(20));

                const image = createCheckbox(new Promise(async r => {
                    const { status } = await post("/get-approval", {
                        id: "rockClimbingBelayer",
                        user: getProfileUser()
                    });

                    r(status.complete === true);
                }));
                image.classList.add("checkbox");
                card.appendChild(image);
            }
        },
        running: {
            before: meterExtra(100000, value => `${value / 1000}km / 100km`, "/get-distance-run")
        },
        service: {
            before: meterExtra(90000, value => `${formatDuration(value, false)} / 25h`, "/get-service-time")
        }
    };

    const awards = getAwards(profileUser);

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

        const checkbox = createCheckbox(new Promise(async r => r((await awards)[id]?.complete === true)));
        checkbox.classList.add("checkbox");
        card.appendChild(checkbox);

        if (extra.after != null) extra.after(card);
        awardsContainer.appendChild(card);
    });
}

window.addEventListener("load", () => {
    setupAwards();
});