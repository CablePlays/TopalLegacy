/*
    Handles displaying a list of sign-offs.
*/

function createSignoffDisplay(options) {
    const {
        additions,
        headings,
        items,
        placeholder,
        type
    } = options;

    const valuesPromise = new Promise(async r => {
        const res = await post("/get-signoffs", {
            type,
            user: getUserId()
        });

        r(res.values);
    });

    const table = document.createElement("table");
    table.classList.add("signoff-display");

    function createItems(items) {
        items.forEach(item => {
            const [id, description] = item;
            const completePromise = new Promise(async r => r((await valuesPromise)[id]?.complete === true));

            const itemRow = createElement("tr", table);

            createElement("td", itemRow, description);

            createElement("td", itemRow, e => {
                e.appendChild(createCheckbox(completePromise));
            });

            createElement("td", itemRow, e => {
                valuesPromise.then(values => {
                    const date = values[id]?.date;

                    if (date != null) {
                        e.innerHTML = formatDate(date);
                    }
                });
            });

            /* Line */

            createElement("tr", table, e => {
                createElement("td", e).classList.add("line");
            });
        });
    };

    if (headings === true) {
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