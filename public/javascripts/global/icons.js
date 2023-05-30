function upIcon() {
    const upIcon = document.getElementById("up-icon");
    const adminIcon = document.getElementById("admin-icon");

    window.addEventListener("scroll", () => {
        console.log(window.scrollY);
        if (window.scrollY >= 300) {
            upIcon.classList.add("visible");
            adminIcon.classList.add("shifted");
        } else {
            upIcon.classList.remove("visible");
            adminIcon.classList.remove("shifted");
        }
    });
    upIcon.addEventListener("click", () => {
        window.scrollTo(0, 0);
    });
}

window.addEventListener("load", () => {
    upIcon();
});