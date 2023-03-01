function createSlideshow(period, providedCards) {
    const instant = Array.isArray(providedCards); // false > assume promise

    /* Slideshow */

    const slideshow = document.createElement("div");
    slideshow.classList.add("slideshow");

    let loadingContainer;

    if (!instant) {
        loadingContainer = document.createElement("div");
        loadingContainer.classList.add("slideshow-loading-container");
        loadingContainer.appendChild(createLoading());
        slideshow.appendChild(loadingContainer);
    }

    /* Load */

    new Promise(async r => {
        if (instant) {
            r(providedCards);
        } else {
            r(await providedCards);
        }
    }).then(cards => {
        const indicators = [];
        let current = 0;
        let resolve = () => { };

        if (!instant) {
            loadingContainer.remove();
        }

        const cardContainer = document.createElement("div");
        cardContainer.classList.add("slideshow-cards");

        const indicatorContainer = document.createElement("div");
        indicatorContainer.classList.add("slideshow-indicator-container");

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

        window.addEventListener("resize", () => update(false, true));

        /* Cards */

        cards.forEach(card => cardContainer.appendChild(card));
        slideshow.appendChild(cardContainer);

        /* Indicators */

        for (let i = 0; i < cards.length; i++) {
            const indicator = document.createElement("div");
            indicator.classList.add("slideshow-indicator");
            indicatorContainer.appendChild(indicator);
            indicators.push(indicator);

            indicator.addEventListener("click", () => resolve(i));
        }

        slideshow.appendChild(indicatorContainer);

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
    });

    return slideshow;
}