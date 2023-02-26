function createSlideshow(period, cards) {
    const indicators = [];
    let current = 0;
    let resolve = () => { };

    const slideshow = document.createElement("div");
    slideshow.classList.add("slideshow");

    /* Cards */

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("slideshow-cards");

    const update = (indicator, resize) => {
        const width = slideshow.clientWidth;

        if (indicator) {
            indicators.forEach(indicator => indicator.classList.remove("selected"));
            indicators[current].classList.add("selected");
        }
        if (resize) {
            cards.forEach(card => card.style.width = width + "px");
        }

        cardContainer.style.transform = `translate(-${current * width}px)`;
    }

    cards.forEach(card => cardContainer.appendChild(card));
    slideshow.appendChild(cardContainer);

    window.addEventListener("resize", () => update(false, true));

    /* Indicators */

    const indicatorContainer = document.createElement("div");
    indicatorContainer.classList.add("slideshow-indicator-container");

    for (let i = 0; i < cards.length; i++) {
        const indicator = document.createElement("div");
        indicator.classList.add("slideshow-indicator");
        indicatorContainer.appendChild(indicator);
        indicators.push(indicator);

        indicator.addEventListener("click", () => resolve(i));
    }

    /* Timer */

    setTimeout(async () => {
        update(true, true);

        while (true) {
            current = await new Promise(r => {
                resolve = r;
                setTimeout(() => r(current === cards.length - 1 ? 0 : current + 1), period)
            });

            update(true, false);
        }
    });

    slideshow.appendChild(indicatorContainer);
    return slideshow;
}