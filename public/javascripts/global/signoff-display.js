/*
    Handles displaying a list of sign-offs.
*/

function createSignoffDisplay(options) {
    const {
        additions,
        placeholder,
        type
    } = options;

    const items = SIGNOFFS[type];
    const hasHeadings = hasHeadings(items);

    const signoffsPromise = new Promise(async r => r((await getRequest(`/users/${getUserId()}/signoffs?type=${type}`)).signoffs));

    const table = document.createElement("table");
    table.classList.add("signoff-display");

    function addLine() {
        const tr = createElement("tr", table);
        createElement("td", tr).classList.add("line");
    }

    function createItems(items) {
        if (!hasHeadings) {
            addLine();
        }

        items.forEach(item => {
            const [id, description] = item;
            const completePromise = new Promise(async r => r((await signoffsPromise)[id]?.complete === true));

            const itemRow = createElement("tr", table);

            createElement("td", itemRow, description);

            createElement("td", itemRow, e => {
                e.appendChild(createCheckbox(completePromise));
            });

            createElement("td", itemRow, e => {
                signoffsPromise.then(values => {
                    const date = values[id]?.date;

                    if (date != null) {
                        e.innerHTML = formatDate(date);
                    }
                });
            });

            /* Line */

            addLine();
        });
    };

    if (hasHeadings === true) {
        for (let item of items) {
            const [groupHeading, groupItems] = item;

            createElement("tr", table, e => {
                createElement("th", e, groupHeading);
            });

            const addition = additions?.[groupHeading];

            if (addition != null) {
                createElement("tr", table, addition);
            }

            createItems(groupItems);
        }
    } else {
        createItems(items);
    }

    /* Placeholder */

    if (placeholder != null) {
        ensureElement(placeholder).replaceWith(table);
    }

    return table;
}