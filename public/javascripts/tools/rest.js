async function hasAward(body) {
    const res = await fetch("/has-award", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    return (await res.json()).has;
}