function createCard(text, user) {
    const card = document.createElement("div");

    // title
    const h1 = document.createElement("h1");
    h1.innerHTML = "Recent Awards";
    card.appendChild(h1);

    // text
    const p = document.createElement("p");
    p.innerHTML = text;
    card.appendChild(p);

    // button
    const button = document.createElement("button");
    button.innerHTML = "Profile";
    button.addEventListener("click", () => window.location.href = `/profile/${user}`);
    card.appendChild(button);

    return card;
}

function setupSlideshow() {
    const cards = [
        createCard("Caleb Jennings recently achieved the Venture Award", 1),
        createCard("Megan Ramsey recently achieved the Polar Bear Award", 2),
        createCard("Chirs Nel recently achieved the Kyaking Award", 3)
    ];

    const slideshow = createSlideshow(cards, 5000, {
        arrows: true,
        handleArrows: (previous, next) => {
            // previous
            const previousImg = document.createElement("img");
            previousImg.src = "/assets/icons/chevron_left.svg";
            previous.appendChild(previousImg);

            // next
            const nextImg = document.createElement("img");
            nextImg.src = "/assets/icons/chevron_right.svg";
            next.appendChild(nextImg);
        }
    });

    document.getElementById("slideshow").replaceWith(slideshow);
}

window.addEventListener("load", () => {
    setupSlideshow();
});