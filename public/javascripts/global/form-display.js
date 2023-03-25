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
        - textLong
        - textShort
        - time
*/
function createRecordInput(options) {
    const {
        recordType,
        inputs: providedInputs,
        placeholder,
        subrecords,
        onFirstRecordSet, // runnable fired when record is first set
        successMessage = "Successfully created new record!",
        title: titleText,
    } = options;

    const container = document.createElement("div");
    container.classList.add("record-input");

    const inputs = {};

    // title
    createElement("h2", container, titleText ?? "Create Record");

    container.appendChild(createSpacer(20));

    providedInputs?.forEach(input => {
        const { id, name, description, type, required } = input;

        const inputElements = [];
        const descriptionElements = [];

        /* Description */

        if (description != null) {
            descriptionElements.push(createElement("p", null, description));
        }

        /* Input */

        let wrap = true; // separate info from inputs
        let separateInputs = true; // new line for each input
        let valueSupplier;

        switch (type) {
            case "boolean": {
                wrap = false;
                const inputElement = document.createElement("input");
                inputElement.type = "checkbox";
                inputElements.push(inputElement);

                valueSupplier = () => inputElement.checked;
                break;
            }
            case "date": {
                const inputElement = document.createElement("input");
                inputElement.type = "date";
                setDateCurrent(inputElement);
                inputElements.push(inputElement);

                valueSupplier = () => inputElement.value;
                break;
            }
            case "duration": {
                separateInputs = false;

                function createInput(placeholder, min, max) {
                    const element = document.createElement("input");
                    element.placeholder = placeholder;
                    element.type = "number";

                    element.addEventListener("input", () => {
                        let value = element.value;

                        if (value !== "") {
                            value = parseInt(value);
                            value = Math.max(value, min);
                            value = Math.min(value, max);

                            element.value = value;
                        }
                    })

                    inputElements.push(element);
                    return element;
                }

                const hourElement = createInput("hours", 0, 100);
                const minuteElement = createInput("minutes", 0, 59);
                const secondElement = createInput("seconds", 0, 59);

                valueSupplier = () => {
                    let blank = 0;
                    let total = 0;

                    let cycle = [secondElement, minuteElement, hourElement];

                    for (let i = 0; i < cycle.length; i++) {
                        const element = cycle[i];
                        const value = element.value;

                        if (value === "") {
                            blank++;
                        } else {
                            const multiplier = Math.pow(60, i);
                            total += value * multiplier;
                        }
                    }

                    // check that at least 1 is filled in
                    return (blank === cycle.length) ? null : total;
                };

                break;
            }
            case "range": {
                const { range } = input;

                const inputElement = document.createElement("input");
                inputElement.type = "range";
                inputElements.push(inputElement);

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

                valueSupplier = () => +inputElement.value;
                break;
            }
            case "selection": {
                const { options, value } = input.selection ?? {};

                const inputElement = document.createElement("select");
                inputElements.push(inputElement);

                if (value == null) {
                    createElement("option", inputElement, "select...").value = "";
                }

                for (let option of options) {
                    if (Array.isArray(options[0])) {
                        createElement("option", inputElement, option[1]).value = option[0];
                    } else {
                        createElement("option", inputElement, option);
                    }
                }

                if (value != null) {
                    inputElement.value = value;
                }

                valueSupplier = () => inputElement.value;
                break;
            }
            case "textLong": {
                const inputElement = document.createElement("textarea");
                inputElements.push(inputElement);
                valueSupplier = () => inputElement.value;
                break;
            }
            case "textShort": {
                const inputElement = document.createElement("input");
                inputElement.type = "text";
                inputElements.push(inputElement);
                valueSupplier = () => inputElement.value;
                break;
            }
            case "time": {
                function applyListener(element, minute) {
                    element.addEventListener("input", () => {
                        const v = element.value;

                        if (v !== "") {
                            const min = (minute ? 0 : 1);
                            const max = (minute ? 60 : 12);

                            if (v < min) {
                                element.value = min;
                            } else if (v > max) {
                                element.value = max;
                            } else {
                                const floor = Math.floor(v);

                                if (floor.toString() !== v) {
                                    element.value = Math.max(floor, 1);
                                }
                            }
                        }
                    });
                };

                const hourElement = document.createElement("input");
                hourElement.type = "number";
                hourElement.placeholder = "hour";
                applyListener(hourElement, false);
                inputElements.push(hourElement);

                const minuteElement = document.createElement("input");
                minuteElement.type = "number";
                minuteElement.placeholder = "minute";
                applyListener(minuteElement, true);
                inputElements.push(minuteElement);

                const timeType = document.createElement("select");
                createElement("option", timeType, "am");
                createElement("option", timeType, "pm");
                inputElements.push(timeType);

                separateInputs = false;
                valueSupplier = () => {
                    let hour = hourElement.value;
                    if (hour === "") return null;

                    let minute = minuteElement.value;
                    if (minute === "") return null;

                    hour = +hour;

                    if (timeType.value === "am") {
                        if (hour === 12) {
                            hour = 0;
                        }
                    } else if (hour !== 12) {
                        hour += 12;
                    }

                    return `${hour}:${minute}`;
                };

                break;
            }
            default: throw new Error("Invalid type: " + type);
        }

        /* Text */

        const textContainer = document.createElement("div");
        const nameElement = createElement("h3", textContainer, name);

        descriptionElements.forEach(elemet => {
            textContainer.appendChild(elemet);
        });

        /* Inputs */

        function appendInputs(div) {
            if (separateInputs) {
                inputElements.forEach(element => {
                    div.appendChild(element);
                });
            } else {
                const inputCollection = document.createElement("div");
                inputCollection.classList.add("input-collection");

                inputElements.forEach(element => {
                    inputCollection.appendChild(element);
                });

                div.appendChild(inputCollection);
            }
        }

        /* Display */

        if (wrap) {
            container.appendChild(textContainer);
            container.appendChild(createSpacer(20));
            appendInputs(container);
        } else {
            const inputContainer = createElement("div", container);
            inputContainer.classList.add("input-container");

            inputContainer.appendChild(textContainer);
            appendInputs(inputContainer);
        }

        container.appendChild(createSpacer(20));

        /* Save */

        inputs[id] = {
            nameElement,
            required,
            supplier: valueSupplier
        };
    });

    /* Button */

    const button = createElement("button", container, "Create");
    button.classList.add("create-button");

    let used = false;
    let recordId;

    const setRecord = a => {
        if (recordId == null) {
            onFirstRecordSet();
        }

        container.scrollIntoView();
        recordId = a;
    };

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

            container.appendChild(createSpacer(10));
            createElement("p", container, successMessage).classList.add("success-message");

            /* Request */

            if (subrecords) {
                if (recordId == null) {
                    return;
                }

                post(`/add-${recordType}-subrecord`, {
                    recordId,
                    value: record
                });
            } else {
                post(`/add-${recordType}-record`, {
                    value: record
                });
            }

            used = true;
            window.location.reload();
        }
    });

    /* Placeholder */

    if (placeholder != null) {
        ensureElement(placeholder).replaceWith(container);
    }

    return (subrecords ? { container, setRecord } : container);
}