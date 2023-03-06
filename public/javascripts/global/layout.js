function addLineInners() {
    for (let element of document.getElementsByClassName("line")) {
        let inner = document.createElement("div");
        inner.classList.add("line-inner");
        element.appendChild(inner);
    }
}

window.addEventListener("load", () => {
    addLineInners();
});