async function display(text, element) {
    async function delay(time) {
        await new Promise(r => setTimeout(r, time));
    }

    const words = text.split(" ");
    let displaying = "";

    for (let wi = 0; wi < words.length; wi++) {
        const word = words[wi];

        if (wi > 0) {
            displaying += " ";
        }

        for (let li = 0; li < word.length; li++) {
            const character = word[li];
            displaying += character;
            element.innerHTML = displaying;
            await delay([".", ",", "!", "?"].includes(character) ? 500 : 20);
        }
    }
}

window.addEventListener("load", () => {
    setTimeout(() => {
        const notices = document.getElementsByClassName("notice");

        for (let notice of notices) {
            display(notice.innerHTML, notice);
        }
    });
});