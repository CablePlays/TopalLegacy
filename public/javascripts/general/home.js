async function setupSlideshow() {
    const cardsPromise = new Promise(async r => {
        const { values } = await post("/get-recent-awards");
        const cards = [];

        if (values.length === 0) {
            const card = document.createElement("div");
            card.classList.add("card");
            card.classList.add("card-basic");
            card.innerHTML = "No Recent Awards";
            cards.push(card);

            const card2 = document.createElement("div");
            card2.classList.add("card");
            card2.classList.add("card-basic");
            card2.innerHTML = "Recent awards will be shown here.";
            cards.push(card2);
        } else {
            values.forEach(value => {
                const { award, user } = value;

                const card = document.createElement("div");
                card.classList.add("card");
                card.classList.add("card-basic");
                card.innerHTML = `${user.fullName} recently achieved the ${getAwardName(award)} Award`;

                const profileElement = document.createElement("a");
                profileElement.classList.add("transparent-button");
                profileElement.innerHTML = "View Profile"
                profileElement.href = "profile/" + user.id;
                card.appendChild(profileElement);

                cards.push(card);
            });
        }

        r(cards);
    });

    const slideshow = createSlideshow(5000, cardsPromise);
    slideshow.classList.add("recent-awards-slideshow");
    document.getElementById("slideshow").replaceWith(slideshow);
}

window.addEventListener("load", () => {
    setupSlideshow();
});