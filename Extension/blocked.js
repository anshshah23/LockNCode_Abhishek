document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("phishingAlert", (data) => {
        const phishingSite = data.phishingAlert || "Unknown Website";
        document.getElementById("blocked-site").textContent = phishingSite;
    });

    document.getElementById("go-safe").addEventListener("click", () => {
        window.location.href = "chrome://newtab/";
    });
});
