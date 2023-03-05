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

async function getUserInfo(user) {
    const res = await post("/get-user-info", { user });
    return res.values;
}

async function post(endpoint, json) {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json ?? {})
    });

    if (res.headers.get("content-type")?.includes("application/json")) {
        return (await res.json());
    }
}