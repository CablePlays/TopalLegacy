async function setupSlideshow() {
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
    }
    else {
        values.forEach(value => {
            const { id, names, user } = value;

            const card = document.createElement("div");
            card.classList.add("card");
            card.classList.add("card-basic");
            card.innerHTML = `${names.given} recently achieved the ${getAwardName(id)} award!`;

            const profileElement = document.createElement("a");
            profileElement.innerHTML = "View Profile"
            profileElement.href = `/profile?user=${user}`;
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

    const slideshow = createSlideshow(5000, cards);
    slideshow.classList.add("recent-awards-slideshow");
    document.getElementById("slideshow").replaceWith(slideshow);
}

window.addEventListener("load", () => {
    setupSlideshow();
});