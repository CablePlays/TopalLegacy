function createRecordInput(options, replace = "record-input") {
    const { title: titleText, successMessage, endpoint } = options;

    const container = document.createElement("div");
    container.classList.add("record-input");

    const append = element => container.appendChild(element);
    const inputs = {};

    // title
    const mainTitle = document.createElement("h2");
    mainTitle.innerHTML = titleText ?? "Create Record";
    append(mainTitle);

    append(createSpacer(20));

    options.inputs?.forEach(input => {
        const { id, name, description, type, required, range } = input;

        /* Name */

        const nameElement = document.createElement("h3");
        nameElement.innerHTML = name;
        append(nameElement);

        /* Description */

        if (description != null) {
            const descriptionElement = document.createElement("p");
            descriptionElement.innerHTML = description;
            append(descriptionElement);
        }

        /* Input */

        let inputElement;
        let inputSupplier;

        switch (type) {
            case "date":
                inputElement = document.createElement("input");
                inputElement.type = "date";
                setDateCurrent(inputElement);

                inputSupplier = () => {
                    const value = inputElement.value;
                    if (value) return new Date(value);
                }
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

                        append(rangeDisplay);
                    }
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

        inputs[id] = {
            nameElement,
            required,
            supplier: inputSupplier
        };

        append(createSpacer(20)); // spacer
        append(inputElement);
        append(createSpacer(20)); // spacer
    });

    /* Button */

    const button = document.createElement("button");
    button.innerHTML = "Create";
    button.classList.add("create-button");

    let used = false;

    button.addEventListener("click", () => {
        if (used) return;

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

            fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    record
                })
            });

            used = true;
            window.location.reload();
        }
    });

    append(button);

    /* Replace */

    const placeholder = document.getElementById(replace);
    placeholder.parentElement.replaceChild(container, placeholder);
}