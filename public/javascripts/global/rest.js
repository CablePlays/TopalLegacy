const REQUEST_PREFIX = "/requests";

async function getAwards(userId) {
    return (await getRequest(`/users/${userId}/awards`)).awards;
}

async function getUserInfo(userId) {
    return (await getRequest(`/users/${userId}`)).values;
}

async function _request(method, path, json) {
    const send = { method };

    if (json != null) {
        send.headers = {
            "Content-Type": "application/json"
        };
        send.body = JSON.stringify(json);
    }

    console.info("Making " + method + " request to " + path);
    const res = await fetch(REQUEST_PREFIX + path, send);

    const r = {
        ok: res.ok,
        status: res.status
    };

    if (res.headers.get("content-type")?.includes("application/json")) {
        const j = await res.json();
        Object.assign(r, j);

        if (!res.ok) {
            console.warn(j.error);
        }
    }

    return r;
}

async function deleteRequest(path, json) {
    return await _request("DELETE", path, json);
}

async function getRequest(path) {
    return await _request("GET", path);
}

async function postRequest(path, json) {
    return await _request("POST", path, json);
}

async function putRequest(path, json) {
    return await _request("PUT", path, json);
}

/* Deprecated */

async function post(endpoint, json) {
    console.warn("Old post method used: " + endpoint);

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