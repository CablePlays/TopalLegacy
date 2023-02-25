/*
    Handles the divs that display the status of awards:
    complete, date complete and signer.
*/

window.addEventListener("load", () => {
    const statuses = document.getElementsByClassName("award-status");
    if (statuses.length === 0) return;

    const template = document.getElementById("award-status-template");
    const awards = getAwards();

    for (let status of statuses) {
        const loading = createLoading(true);
        status.parentElement.replaceChild(loading, status);

        awards.then(value => {
            const award = status.getAttribute("data-award");
            const clone = template.content.cloneNode(true).firstChild;

            const awardData = value[award];
            const complete = awardData?.complete === true;

            // status
            clone.childNodes[0].childNodes[1].src = "/images/" + (complete ? "checked.png" : "unchecked.png");
            // date
            clone.childNodes[1].childNodes[1].innerHTML = (complete ? formatDate(awardData.date) : "-");
            // signer
            clone.childNodes[2].childNodes[1].innerHTML = (complete ? awardData.signer : "-");

            loading.parentElement.replaceChild(clone, loading);
        });
    }
});