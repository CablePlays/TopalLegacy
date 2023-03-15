async function setupSlideshow() {
    const cardsPromise = new Promise(async r => {
        const res = await fetch("/get-recent-awards", {
            method: "POST"
        });

        const { values } = await res.json();
        const cards = [];

        if (values.length === 0) {
            const card = document.createElement("div");
            card.classList.add("card");
            card.classList.add("card-basic");
            card.innerHTML = "No Recent Awards";
            cards.push(card);
        } else {
            values.forEach(value => {
                const { award, user } = value;

                const card = document.createElement("div");
                card.classList.add("card");
                card.classList.add("card-basic");
                card.innerHTML = `${user.givenName} recently achieved the ${getAwardName(award)} award!`;

                const profileElement = document.createElement("a");
                profileElement.classList.add("transparent-button");
                profileElement.innerHTML = "View Profile"
                profileElement.href = `/profile?user=${user.id}`;
                card.appendChild(profileElement);

                cards.push(card);
            });
        }
        if (values.length <= 2) {
            const card = document.createElement("div");
            card.classList.add("card");
            card.classList.add("card-highlight");
            card.innerHTML = "Earn an award and get displayed here!";
            cards.push(card);
        }

        r(cards);
    });

    const slideshow = createSlideshow(5000, cardsPromise);
    slideshow.classList.add("recent-awards-slideshow");
    document.getElementById("slideshow").replaceWith(slideshow);
}

function test() {
    const section = createFlexibleSection([
        {
            name: "Start Date",
            type: "date",
            value: new Date()
        },
        {
            name: "Area",
            type: "text_short",
            value: "A place"
        },
        {
            name: "Number Of Days",
            type: "text_short",
            value: 2
        },
        {
            name: "Hike Distance",
            type: "text_short",
            value: "1.2km"
        },
        {
            name: "Altitude Gained",
            type: "text_short",
            value: "1300m"
        },
        {
            name: "Number In Party",
            type: "text_short",
            value: 7
        },
        {
            name: "Shelter",
            type: "radio",
            options: ["Bivi", "Hut", "Cave", "Tent", "Combination", "Other"],
            value: 1
        },
        {
            name: "Was the majority of the hike on a trail/path?",
            type: "boolean",
            value: true
        },
        {
            name: "Were you the leader of the group?",
            type: "boolean",
            value: false
        },
        {
            name: "Was the majority of the hike above 2000m?",
            type: "boolean",
            value: false
        },
        {
            name: "Route",
            type: "text_long",
            value: "We went around many mountains and over some hills through some valleys."
        },
        {
            name: "Weather Conditions",
            type: "text_long",
            value: "It was very hot and sunnny the first day, and it was overcast the next day on the way back."
        },
        {
            name: "Situations Dealt With",
            type: "text_long",
            value: "Somebody's tent blew off the edge of a cliff because they didn't tie it down properly."
        }
    ]);

    document.getElementById("b").replaceWith(section);
}

window.addEventListener("load", () => {
    setupSlideshow();
    test();
});