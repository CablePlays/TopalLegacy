let _confirmationPromptOnConfirm = null;

function _getConfirmationContainer() {
    return document.getElementById("confirmation-container");
}

function _hideConfirmation() {
    _getConfirmationContainer().style.display = "none";
    _confirmationPromptOnConfirm = null;
}

function promptConfirmation(text, onConfirm) {
    const confirmation = _getConfirmationContainer();
    const prompt = confirmation.children[0];

    prompt.children[2].innerHTML = text;
    _confirmationPromptOnConfirm = onConfirm;
    confirmation.style.display = "flex";
}

window.addEventListener("load", () => {
    const container = _getConfirmationContainer();
    const buttonContainer = container.children[0].children[4];

    container.addEventListener("click", e => {
        if (e.target === container) {
            _hideConfirmation(); // hide when user clicks around dialog
        }
    });
    buttonContainer.children[0].addEventListener("click", _hideConfirmation); // hide on clicked cancel
    buttonContainer.children[1].addEventListener("click", () => {
        if (_confirmationPromptOnConfirm != null) {
            _confirmationPromptOnConfirm();
        }

        _hideConfirmation();
    });
});