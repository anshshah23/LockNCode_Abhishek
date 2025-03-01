const SAFE_REDIRECT_URL = "chrome://newtab/"; // Safe Redirect Page
const API_URL = "http://localhost:8880/check-phishing/";

async function checkPhishing(url, tabId, sendResponse) {
    const domain = new URL(url).href;
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: [domain] })
        });

        const data = await response.json();
        const isPhishing = data.results.some((result) => result.url === domain && result.phishing);

        if (isPhishing) {
            chrome.storage.local.set({ phishingAlert: domain });
            chrome.tabs.update(tabId, { url: SAFE_REDIRECT_URL }); // Redirect to a safe page
            sendResponse({ status: "phishing", url: domain });
        } else {
            sendResponse({ status: "safe", url: domain });
        }
    } catch (error) {
        console.error("Error checking phishing status:", error);
        sendResponse({ status: "error", message: "Failed to check website." });
    }
}

// Runs on every tab update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") {
        checkPhishing(tab.url, tabId, () => { });
    }
});

// Handles manual user checks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkCurrentTab") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                checkPhishing(tabs[0].url, tabs[0].id, sendResponse);
            }
        });
        return true;
    } else if (message.action === "checkAllTabs") {
        chrome.tabs.query({}, (tabs) => {
            let results = [];
            let completed = 0;
            tabs.forEach((tab) => {
                checkPhishing(tab.url, tab.id, (res) => {
                    results.push(res);
                    completed++;
                    if (completed === tabs.length) {
                        sendResponse(results);
                    }
                });
            });
        });
        return true;
    }
});


chrome.webRequest.onBeforeRequest.addListener(
    async function (details) {
        const url = details.url;
        const apiUrl = "http://localhost:8880/check-phishing/";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url })
            });

            const result = await response.json();

            if (result.status === "phishing") {
                return { redirectUrl: chrome.runtime.getURL("blocked.html") };
            }
        } catch (error) {
            console.error("API Error:", error);
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
