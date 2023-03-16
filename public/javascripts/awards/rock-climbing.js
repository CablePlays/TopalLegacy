function setupBelayerSignoff() {
    const promise = new Promise(async r => {
        const json = await post("/get-rock-climbing-belayer-signoff", {
            user: getUserId()
        });
        r({
            award: json.value,
            requested: null
        });
    });

    const status = createAwardStatus("Belayer Signoff", promise);
    document.getElementById("belayer-status").replaceWith(status);
}

window.addEventListener("load", () => {
    setupBelayerSignoff();
    createSignoffDisplay({
        headings: true,
        items: ROCK_CLIMBING_SIGNOFFS,
        placeholder: "signoffs",
        type: "rockClimbing",
        additions: {
            "Abseiling": noticeRow => {
                createElement("td", noticeRow, "Abseiling at Treverton is always done while belayed on another rope (no acceleration)!")
                    .classList.add("notice");
            }
        }
    });
});