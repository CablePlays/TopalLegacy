/*
    Handles creating records by generating a UI using options.
*/

/*
    Types:
        - boolean
        - date
        - duration
        - range
        - selection
        - text_long
        - text_short
*/
function createRecordInput(options) {
    const {
        recordType,
        inputs: providedInputs,
        successMessage,
        title: titleText,
    } = options;

    const container = document.createElement("div");
    container.classList.add("record-input");

    const append = element => container.appendChild(element);
    const inputs = {};

    // title
    const mainTitle = document.createElement("h2");
    mainTitle.innerHTML = titleText ?? "Create Record";
    append(mainTitle);

    append(createSpacer(20));

    providedInputs?.forEach(input => {
        const { id, name, description, type, required } = input;
        const descriptionElements = [];

        /* Description */

        if (description != null) {
            descriptionElements.push(createElement("p", null, description));
        }

        /* Input */

        let singleRow = false;
        let inputElement;
        let inputSupplier;

        switch (type) {
            case "boolean":
                singleRow = true;
                inputElement = document.createElement("input");
                inputElement.type = "checkbox";
                inputSupplier = () => inputElement.checked;
                break;
            case "date":
                inputElement = document.createElement("input");
                inputElement.type = "date";
                setDateCurrent(inputElement);

                inputSupplier = () => inputElement.value;
                break;
            case "duration":
                inputElement = document.createElement("input");
                inputElement.type = "text";
                inputElement.placeholder = "Hours Minutes Seconds (e.g. \"1 30 0\")";

                let savedValue;

                inputElement.addEventListener("change", () => {
                    let value = inputElement.value;
                    let parts = value.split(" ");

                    while (true) { // remove empty strings
                        let i = parts.indexOf("");
                        if (i == -1) break;
                        parts.splice(i, 1);
                    }

                    let valid = true;
                    let numbers = [];

                    if (parts.length !== 3) { // check length
                        valid = false;
                    } else { // check that all are integers
                        for (let i = 0; i < parts.length; i++) {
                            let n = parseInt(parts[i]);

                            if (isNaN(n) || n < 0) {
                                valid = false;
                                break;
                            }

                            numbers.push(n);
                        }
                    }
                    if (valid) {
                        savedValue = numbers[0] * 60 * 60 + numbers[1] * 60 + numbers[2];
                        inputElement.value = formatDuration(savedValue);
                    } else {
                        savedValue = undefined;
                        inputElement.value = null;
                    }
                });

                inputSupplier = () => savedValue;
                break;
            case "range":
                const { range } = input;

                inputElement = document.createElement("input");
                inputElement.type = "range";

                if (range != null) {
                    const { min, max, step, value, display } = range;

                    if (min != null) inputElement.min = min;
                    if (max != null) inputElement.max = max;
                    if (step != null) inputElement.step = step;
                    if (value != null) inputElement.value = value;

                    if (display != null) {
                        const rangeDisplay = document.createElement("p");
                        const updateDisplay = () => rangeDisplay.innerHTML = display(inputElement.value);

                        inputElement.addEventListener("input", updateDisplay);
                        updateDisplay();

                        descriptionElements.push(rangeDisplay);
                    }
                }

                inputSupplier = () => +inputElement.value;
                break;
            case "selection":
                const { options, value } = input.selection ?? {};
                inputElement = document.createElement("select");

                if (value == null) {
                    createElement("option", inputElement, "select...").value = "";
                }

                for (let option of options) {
                    createElement("option", inputElement, option[1]).value = option[0];
                }

                if (value != null) {
                    inputElement.value = value;
                }

                inputSupplier = () => inputElement.value;
                break;
            case "text_long":
                inputElement = document.createElement("textarea");
                inputSupplier = () => inputElement.value;
                break;
            case "text_short":
                inputElement = document.createElement("input");
                inputElement.type = "text";
                inputSupplier = () => inputElement.value;
                break;
            default: throw new Error("Invalid type: " + type);
        }

        const textContainer = (singleRow ? document.createElement("div") : container);

        /* Name */

        const nameElement = document.createElement("h3");
        nameElement.innerHTML = name;
        textContainer.appendChild(nameElement);

        /* Description */

        descriptionElements.forEach(elemet => {
            textContainer.appendChild(elemet);
        });

        /* Input */

        if (singleRow) {
            const inputContainer = document.createElement("div");
            inputContainer.classList.add("input-container");

            inputContainer.appendChild(textContainer);
            inputContainer.appendChild(inputElement);

            append(inputContainer);
        } else {
            append(createSpacer(20));
            append(inputElement);
        }

        append(createSpacer(20));

        /* Save */

        inputs[id] = {
            nameElement,
            required,
            supplier: inputSupplier
        };
    });

    /* Button */

    const button = document.createElement("button");
    button.innerHTML = "Create";
    button.classList.add("create-button");

    let used = false;

    button.addEventListener("click", () => {
        if (used) {
            return;
        }

        const record = {};
        let valid = true; // all inputs are valid

        for (let id of Object.getOwnPropertyNames(inputs)) {
            const { nameElement, required, supplier } = inputs[id];
            const value = supplier();

            if (required && (value == null || typeof value === "string" && value.replaceAll(" ", "") === "")) {
                valid = false;
                nameElement.classList.add("required");
            } else {
                record[id] = value;
            }
        }

        if (valid) {

            /* Success Message */

            append(createSpacer(10)); // spacer

            const successMessageElement = document.createElement("p");
            successMessageElement.innerHTML = successMessage ?? "Successfully created new record!";
            successMessageElement.classList.add("success-message");
            append(successMessageElement);

            /* Request */

            post(`/add-${recordType}-record`, {
                value: record
            });

            used = true;
            window.location.reload();
        }
    });

    append(button);

    /* Return */

    return container;
}