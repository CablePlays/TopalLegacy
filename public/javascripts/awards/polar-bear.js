const info = `
    Mr. Neil Solomon who introduced the Outdoor Persuits and Post-Matric programmes to Treverton instituted this unique and exclusive club.
    It is based upon other crazy awards the world over in which people brave frigid waters.
    This experience is said to aid the body's immunity against illness due to an increase in antioxidant production in the body!
    So if for nothing else, do it for your health!
`;

function setCompleted(completed) {
    document.getElementById("indicator").style.backgroundColor = (completed ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)");
}

async function checkCompleted() {
    let awards = await getAwards();
    setCompleted(awards.polar_bear);
}

window.addEventListener("load", () => {
    document.getElementById("info").innerHTML = info;
    checkCompleted();
});