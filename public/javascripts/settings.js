window.addEventListener("load", () => {
    document.getElementById("logout-all").addEventListener("click", async () => {
        await fetch("/invalidate-session-token", {
            method: "POST"
        });

        location.reload();
    });
});