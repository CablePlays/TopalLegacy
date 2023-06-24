function createSlideshow(providedCards, period, options) {
    const instant = Array.isArray(providedCards); // false > assume promise
    const { arrows, handleArrows, loadingCard } = options ?? {};

    /* Slideshow */

    const slideshow = document.createElement("div");
    slideshow.classList.add("slideshow");

    if (!instant) {
        slideshow.appendChild(loadingCard);
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
            loadingCard.remove();
        }

        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card-container");

        const indicatorContainer = document.createElement("div");
        indicatorContainer.classList.add("indicator-container");

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

        cards.forEach(card => {
            card.classList.add("card");
            cardContainer.appendChild(card);
        });

        /* Indicators */

        for (let i = 0; i < cards.length; i++) {
            const indicator = document.createElement("div");
            indicator.classList.add("indicator");
            indicatorContainer.appendChild(indicator);
            indicators.push(indicator);

            indicator.addEventListener("click", () => resolve(i));
        }

        /* Add */

        update(true, true);
        slideshow.appendChild(cardContainer);
        slideshow.appendChild(indicatorContainer);

        /* Cycle */

        const goPrevious = () => {
            resolve(current === 0 ? cards.length - 1 : current - 1);
        };

        const getNext = () => (current === cards.length - 1) ? 0 : current + 1;

        const goNext = () => {
            resolve(getNext());
        };

        /* Arrows */

        if (arrows === true) {
            // previous
            const previous = document.createElement("div");
            previous.classList.add("previous");
            previous.addEventListener("click", goPrevious);
            slideshow.appendChild(previous);

            // next
            const next = document.createElement("div");
            next.classList.add("next");
            next.addEventListener("click", goNext);
            slideshow.appendChild(next);

            if (handleArrows) {
                handleArrows(previous, next);
            }
        }

        /* Timer */

        setTimeout(async () => {
            while (true) {
                current = await new Promise(r => {
                    resolve = r;
                    setTimeout(() => r(getNext()), period);
                });

                update(true, false);
            }
        });
    });

    return slideshow;
}