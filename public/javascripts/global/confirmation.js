let _onConfirm = null;

function _getConfirmation() {
    return document.getElementById("confirmation");
}

function _hideConfirmation() {
    _getConfirmation().style.display = "none";
}

function promptConfirmation(text, onConfirm) {
    const confirmation = _getConfirmation();
    const dialog = confirmation.children[0];

    dialog.children[1].innerHTML = text;
    _onConfirm = onConfirm;
    confirmation.style.display = "flex";
}

window.addEventListener("load", () => {
    const confirmation = _getConfirmation();
    const buttonContainer = confirmation.children[0].children[2];

    confirmation.addEventListener("click", e => {
        if (e.target === confirmation) {
            // hide when user clicks around dialog
            _hideConfirmation();
        }
    });
    buttonContainer.children[0].addEventListener("click", _hideConfirmation);
    buttonContainer.children[1].addEventListener("click", () => {
        if (_onConfirm != null) {
            _onConfirm();
            _onConfirm = null;
        }

        _hideConfirmation();
    });
});