window.addEventListener("load", () => {
    document.getElementById("logout-button").addEventListener("click", async () => {
        logout();
        location.reload();
    });
    document.getElementById("logout-all-button").addEventListener("click", async () => {
        await fetch("/invalidate-session-token", {
            method: "POST"
        });

        window.location.href = "/";
    });
});