window.addEventListener("load", () => {
    createSignoffDisplay({
        items: traverseSignoffs,
        placeholder: "signoffs",
        type: "traverse"
    });
});