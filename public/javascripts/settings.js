window.addEventListener("load", () => {
    document.getElementById("logout-all").addEventListener("click", async () => {
        const userEmail = getEmail();

        await fetch("/database-replace", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                range: "Users!A2:B",
                values: [
                    [userEmail, null, ""]
                ]
            })
        });

        location.reload();
    });
});