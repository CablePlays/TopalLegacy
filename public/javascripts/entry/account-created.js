window.addEventListener("load", async () => {
    const info = document.getElementById("info");
    const seconds = 5;

    for (let i = 0; i < seconds; i++) {
        let second = seconds - i;
        info.innerHTML = "Redirecting in " + second + "...";
        await new Promise(r => setTimeout(r, 1000)); // wait 1 second
    }

    info.innerHTML = "Redirecting...";
    window.location.href = "/";
});