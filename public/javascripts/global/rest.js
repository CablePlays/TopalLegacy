async function getAwards(user) {
    const json = await post("/get-awards", { user });
    return json.values;
}

async function getUserInfo(user) {
    const json = await post("/get-user-info", { user });
    return json.values;
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