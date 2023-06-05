/*
    Handles displaying a list of sign-offs.
*/

function createSignoffDisplay(options) {
    const {
        additions,
        placeholder,
        type
    } = options;

    const typedSignoffs = SIGNOFFS[type];
    const headings = hasHeadings(typedSignoffs);

    const signoffsPromise = new Promise(async r => r((await getRequest(`/users/${getUserId()}/signoffs?type=${type}`)).signoffs));

    const table = document.createElement("table");
    table.classList.add("signoff-display");

    function addLine() {
        const tr = createElement("tr", table);
        createElement("td", tr).classList.add("line");
    }

    function createSignoffList(items) {
        items.forEach(item => {
            const [id, description] = item;
            const itemRow = createElement("tr", table);

            createElement("td", itemRow, description); // description

            const td1 = createElement("td", itemRow);
            const td2 = createElement("td", itemRow);

            const loadingIcon = createLoadingIcon(false);
            td1.appendChild(loadingIcon);

            signoffsPromise.then(values => {
                const signoff = values[id] ?? {};

                if (signoff.complete) {
                    loadingIcon.replaceWith(createCheckbox(true)); // checkbox
                    td2.innerHTML = formatDate(signoff.date); // date
                } else { // request button
                    const requestButton = document.createElement("button");
                    requestButton.classList.add("request-button");

                    let hasRequested = (signoff.requestDate != null);

                    const updateText = () => {
                        requestButton.innerHTML = (hasRequested ? "Revoke Request" : "Request");

                        if (hasRequested) {
                            td2.innerHTML = "Requested";
                        } else if (signoff.declined) {
                            td2.innerHTML = "Declined";
                        } else {
                            td2.innerHTML = null;
                        }
                    };

                    updateText();

                    requestButton.addEventListener("click", () => {
                        const promptConfirmationText = (hasRequested
                            ? "You are about to revoke a sign-off request."
                            : "You are about to request a sign-off."
                        );

                        promptConfirmation(promptConfirmationText, () => {
                            hasRequested = !hasRequested;
                            updateText();

                            putRequest(`/users/${getUserId()}/signoffs/requests`, {
                                type,
                                signoff: id,
                                complete: hasRequested
                            });
                        });
                    });

                    loadingIcon.replaceWith(requestButton);
                }
            });

            addLine();
        });
    };

    if (headings === true) {
        for (let item of typedSignoffs) {
            const [groupHeading, groupItems] = item;

            createElement("tr", table, e => {
                createElement("th", e, groupHeading);
            });

            const addition = additions?.[groupHeading];

            if (addition != null) {
                createElement("tr", table, addition);
            }

            createSignoffList(groupItems);
        }
    } else {
        addLine();
        createSignoffList(typedSignoffs);
    }

    /* Placeholder */

    if (placeholder != null) {
        ensureElement(placeholder).replaceWith(table);
    }

    return table;
}