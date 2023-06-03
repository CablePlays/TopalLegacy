function createBall(container) {
    const element = createElement("div", container);
    element.classList.add("bouncy-ball");
    element.classList.add(Math.random() < 0.5 ? "a" : "b");

    const size = 20 + Math.random() * 20;
    element.style.borderRadius = `${size}px`;
    element.style.height = `${size}px`;
    element.style.width = `${size}px`;

    handleBall(element, container);
}

function handleBall(element, container) {
    const ballSize = 40;

    const toRandomPosition = () => {
        const height = container.clientHeight;
        const width = container.clientWidth;

        element.style.left = `${Math.random() * (width - ballSize)}px`;
        element.style.top = `calc(${getCssVariable("topbar-height")} + ${Math.random() * (height - ballSize)}px)`;
    };

    toRandomPosition();
    element.addEventListener("mouseenter", toRandomPosition);
}

window.addEventListener("load", () => {
    const query = new URLSearchParams(window.location.search);
    const amount = query.get("n") ?? 1000;

    const container = document.getElementsByClassName("container")[0];

    for (let i = 0; i < amount; i++) {
        setTimeout(() => createBall(container), i);
    }
});