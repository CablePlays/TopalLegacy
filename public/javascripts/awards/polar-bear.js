function setCompleted(completed) {
    document.getElementById("indicator").style.backgroundColor = (completed ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)");
}

async function checkCompleted() {
    let awards = await getAwards();
    setCompleted(awards.includes("polar_bear"));
}

window.addEventListener("load", () => {
    checkCompleted();
});