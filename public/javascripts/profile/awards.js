function meterExtra(max, display, endpoint) {
    return async card => {
        const label = document.createElement("h3");
        label.innerHTML = "Loading...";
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
        running: meterExtra(100000, value => `${value / 1000}km / 100km`, "/get-distance-run"),
        service: meterExtra(90000, value => `${formatDuration(value, false)} / 25h`, "/get-service-time")
    };

    const awards = getAwards(profileUser);

    AWARDS.forEach(award => {
        const id = award[0];
        const display = award[1];

        const card = document.createElement("div");
        card.classList.add("card");

        const title = document.createElement("h2");
        title.innerHTML = display;
        card.appendChild(title);

        const extra = extras[id];
        if (extra != null) extra(card);

        card.appendChild(createSpacer(20));

        const image = document.createElement("img");
        image.src = "/images/loading.gif";
        image.classList.add("checkbox");
        card.appendChild(image);

        awardsContainer.appendChild(card);

        awards.then(value => {
            const complete = value[id]?.complete === true;
            image.src = "/images/" + (complete ? "checked.png" : "unchecked.png");
        });
    });
}

window.addEventListener("load", () => {
    setupAwards();
});