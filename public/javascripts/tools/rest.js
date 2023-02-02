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

    return (await res.json()).awards;
}