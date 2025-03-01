document.addEventListener("DOMContentLoaded", () => {
    const checkCurrentTabBtn = document.getElementById("check-current-tab");
    const checkAllTabsBtn = document.getElementById("check-all-tabs");
    const statusMessage = document.getElementById("status-message");
    const resultContainer = document.getElementById("result-container");

    function setLoadingState(isLoading) {
        statusMessage.textContent = isLoading ? "Checking..." : "";
    }

    function displayResult(result) {
        const resultText = document.createElement("p");
        if (result.status === "phishing") {
            resultText.innerHTML = `<span style='color: red;'>${result.url} is a phishing website!</span>`;
        } else if (result.status === "safe") {
            resultText.innerHTML = `<span style='color: green;'>${result.url} is safe.</span>`;
        } else {
            resultText.innerHTML = `<span style='color: orange;'>Error checking ${result.url}: ${result.message}</span>`;
        }
        resultContainer.appendChild(resultText);
    }

    checkCurrentTabBtn.addEventListener("click", () => {
        setLoadingState(true);
        resultContainer.innerHTML = "";
        chrome.runtime.sendMessage({ action: "checkCurrentTab" }, (response) => {
            setLoadingState(false);
            displayResult(response);
        });
    });

    checkAllTabsBtn.addEventListener("click", () => {
        setLoadingState(true);
        resultContainer.innerHTML = "";
        chrome.runtime.sendMessage({ action: "checkAllTabs" }, (response) => {
            setLoadingState(false);
            response.forEach(displayResult);
        });
    });
});
