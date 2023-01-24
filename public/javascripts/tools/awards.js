/*
    Awards:
        POLAR_BEAR
        RUNNING
*/

const TOTAL_AWARDS = 2;
const LAST_COLUMN = "C";

function getColumn(award) {
    switch (award) {
        case "POLAR_BEAR": return 1;
        case "RUNNING": return 2;
        default: throw new Error("Unexpected award: " + award);
    }
}

async function hasAward(award) {
    const user = getEmail();
    let res = await fetch("/database-search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            range: `Awards!A2:${LAST_COLUMN}`,
            match: user,
            colGet: getColumn(award)
        })
    });

    let { value } = await res.json();
    return (value != null) && (value.toLowerCase() === "true");
}

function setHasAward(award, has) {
    const user = getEmail();
    let replace = [];

    for (let i = 0; i <= TOTAL_AWARDS; i++) {
        replace.push(null);
    }

    replace[getColumn(award) - 1] = (has ? true : "");

    fetch("/database-upsert", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            range: `Awards!A2:${LAST_COLUMN}`,
            values: [
                [user, ...replace]
            ]
        })
    });
}