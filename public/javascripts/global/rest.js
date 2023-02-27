async function getAwards(user) {
    const res = await fetch("/get-awards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user
        })
    });

    return (await res.json()).values;
}

async function getUserNames(user) {
    const res = await fetch("/get-user-names", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user
        })
    });

    return (await res.json()).values;
}