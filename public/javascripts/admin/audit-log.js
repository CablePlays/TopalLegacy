function camelCaseToSentence(str) {
    let capitalized = str.replace(/([A-Z])/g, ' $1'); // replace uppercase letters with space followed by the uppercase letter

    return capitalized.replace(/^\w/, match => { // capitalize the first letter of each word
        return match.toUpperCase();
    });
}

function getText(record) {
    const { type } = record;

    function highlight(str) {
        return `<span class=highlight>${str}</span>`;
    }

    switch (type) {
        case "changePermission": return `${highlight(record.actor.fullName)} changed permission for ${highlight(record.user.fullName)}: ${record.has ? "granted" : "revoked"} ${highlight(getPermissionName(record.permission))}`;
        case "declineAwardSignoffRequest": return `${highlight(record.actor.fullName)} declined the ${highlight(getAwardName(record.award))} award sign-off request from ${highlight(record.user.fullName)}`;
        case "declineSignoffRequest": return `${highlight(record.actor.fullName)} declined a ${highlight(getAwardName(record.signoffType))} sign-off request from ${highlight(record.user.fullName)}: ${highlight(getSignoffDescription(record.signoffType, record.signoff))}`;
        case "grantApproval": return `${highlight(record.actor.fullName)} granted ${highlight(record.user.fullName)} the ${highlight(camelCaseToSentence(record.approval))} approval`;
        case "grantAward": return `${highlight(record.actor.fullName)} granted ${highlight(record.user.fullName)} the ${highlight(getAwardName(record.award))} award`;
        case "grantSignoff": return `${highlight(record.actor.fullName)} granted ${highlight(record.user.fullName)} a ${highlight(getAwardName(record.signoffType))} sign-off: ${highlight(getSignoffDescription(record.signoffType, record.signoff))}`;
        case "revokeApproval": return `${highlight(record.actor.fullName)} revoked the ${highlight(camelCaseToSentence(record.approval))} approval from ${highlight(record.user.fullName)}`;
        case "revokeAward": return `${highlight(record.actor.fullName)} revoked the ${highlight(getAwardName(record.award))} award from ${highlight(record.user.fullName)}`;
        case "revokeSignoff": return `${highlight(record.actor.fullName)} revoked a ${highlight(getAwardName(record.signoffType))} sign-off from ${highlight(record.user.fullName)}: ${highlight(getSignoffDescription(record.signoffType, record.signoff))}`;
        default: throw new Error("Invalid type: " + type);
    };
}

async function loadAuditLogs() {
    const container = document.createElement("div");
    container.id = "audit-log-container";
    document.getElementById("audit-logs").replaceWith(container);

    const loadingElement = createLoadingIcon();
    container.appendChild(loadingElement);

    const { records } = await getRequest("/audit-log");

    loadingElement.remove();

    if (records.length === 0) {
        createElement("p", container, NONE_TEXT);
    } else {
        records.forEach(record => {
            const { date } = record;
            const recordContainer = createElement("div", container);
            recordContainer.classList.add("record");

            createElement("p", recordContainer, formatDate(date)).classList.add("date");
            createElement("p", recordContainer, getText(record));
        });
    }
}

window.addEventListener("load", () => {
    loadAuditLogs();
});