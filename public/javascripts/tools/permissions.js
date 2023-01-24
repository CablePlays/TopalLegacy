async function getPermissions() {
    let res = await fetch("/get-permissions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });

    return await res.json();
}