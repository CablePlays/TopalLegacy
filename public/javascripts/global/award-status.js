/*
    Handles the divs that display the status of awards:
    complete, date complete and signer.
*/

function createAwardStatus(display, promise) {
    const template = document.getElementById("award-status-template");
    const clone = template.content.cloneNode(true).firstChild;

    // status
    clone.childNodes[0].childNodes[0].innerHTML = display;
    clone.childNodes[0].childNodes[1].src = IMAGE_LOADING;
    // date
    clone.childNodes[1].childNodes[1].innerHTML = LOADING_TEXT;
    // signer
    clone.childNodes[2].childNodes[1].innerHTML = LOADING_TEXT;

    promise.then(data => {
        const complete = data.complete === true;
        const { date, signer } = data;

        // status
        clone.childNodes[0].childNodes[1].src = checkboxImage(complete);
        // date
        clone.childNodes[1].childNodes[1].innerHTML = (complete ? formatDate(date) : "-");
        // signer
        clone.childNodes[2].childNodes[1].innerHTML = (complete ? signer.name : "-");
    });

    return clone;
}

window.addEventListener("load", () => {
    const statuses = [...document.getElementsByClassName("award-status")]; // put into array to prevent original from shrinking on remove
    if (statuses.length === 0) return;

    const awards = getAwards();

    for (let status of statuses) {
        const award = status.getAttribute("data-award");
        const promise = new Promise(async r => r((await awards)[award] ?? {}));
        const awardStatus = createAwardStatus("Complete", promise);

        status.parentElement.replaceChild(awardStatus, status);
    }
});