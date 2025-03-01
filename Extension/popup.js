document.addEventListener("DOMContentLoaded", () => {
    const checkCurrentTabBtn = document.getElementById("check-current-tab");
    const checkAllTabsBtn = document.getElementById("check-all-tabs");
    const clearResultsBtn = document.getElementById("clear-results");
    const statusMessage = document.getElementById("status-message");
    const resultContainer = document.getElementById("result-container");

    if (!checkCurrentTabBtn || !checkAllTabsBtn || !clearResultsBtn || !statusMessage || !resultContainer) {
        console.error("One or more elements are missing in popup.html");
        return;
    }

    function setLoadingState(isLoading, button) {
        if (isLoading) {
            button.innerHTML = "Checking... <span class='loading'></span>";
            button.disabled = true;
        } else {
            button.innerHTML = button.dataset.defaultText;
            button.disabled = false;
        }
    }

    function displayResult(result) {
        const resultText = document.createElement("div");
        resultText.classList.add("result");

        if (result.status === "phishing") {
            resultText.classList.add("phishing");
            resultText.textContent = `⚠️ ${result.url} is a PHISHING site!`;
        } else if (result.status === "safe") {
            resultText.classList.add("safe");
            resultText.textContent = `✅ ${result.url} is SAFE.`;
        } else {
            resultText.classList.add("error");
            resultText.textContent = `❓ Error checking ${result.url}: ${result.message}`;
        }

        resultContainer.appendChild(resultText);
    }

    checkCurrentTabBtn.dataset.defaultText = checkCurrentTabBtn.innerHTML;
    checkAllTabsBtn.dataset.defaultText = checkAllTabsBtn.innerHTML;

    checkCurrentTabBtn.addEventListener("click", () => {
        setLoadingState(true, checkCurrentTabBtn);
        resultContainer.innerHTML = "";
        chrome.runtime.sendMessage({ action: "checkCurrentTab" }, (response) => {
            setLoadingState(false, checkCurrentTabBtn);
            if (response) {
                displayResult(response);
            } else {
                statusMessage.textContent = "❌ Error: No response from background script.";
            }
        });
    });

    checkAllTabsBtn.addEventListener("click", () => {
        setLoadingState(true, checkAllTabsBtn);
        resultContainer.innerHTML = "";
        chrome.runtime.sendMessage({ action: "checkAllTabs" }, (response) => {
            setLoadingState(false, checkAllTabsBtn);
            if (response && Array.isArray(response)) {
                response.forEach(displayResult);
            } else {
                statusMessage.textContent = "❌ Error: No response from background script.";
            }
        });
    });

    clearResultsBtn.addEventListener("click", () => {
        resultContainer.innerHTML = "";
        statusMessage.textContent = "";
    });
});
