function setupAwards() {
    const awardsTable = document.getElementById("awards-table");
    const awards = [
        ["midmar", "Midmar Mile"],
        ["polarBear", "Polar Bear"],
        ["running", "Running"]
    ];

    awards.forEach(award => {
        const tr = document.createElement("tr");

        const awardCell = document.createElement("td");
        awardCell.innerHTML = award[1];
        tr.appendChild(awardCell);

        const statusCell = document.createElement("td");
        statusCell.innerHTML = "TODO: Complete/Incomplete";
        tr.appendChild(statusCell);

        const signOffCell = document.createElement("td");
        signOffCell.innerHTML = "TODO: Grant/Revoke"
        tr.appendChild(signOffCell);

        awardsTable.appendChild(tr);
    });
}

window.addEventListener("load", () => {
    setupAwards();
});