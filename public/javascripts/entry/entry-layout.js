let _messageVisible = false;

function message(message) {
    if (_messageVisible === false) {
        const placeholder = document.getElementById("message");

        const messageElement = document.createElement("p");
        messageElement.id = "message";
        messageElement.classList.add("partial");
        placeholder.replaceWith(messageElement);

        const spacer = createSpacer(20);
        insertAfter(spacer, messageElement);

        _messageVisible = true;
    }

    document.getElementById("message").innerHTML = message;
}