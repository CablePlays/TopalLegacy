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