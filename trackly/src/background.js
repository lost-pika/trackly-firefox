// src/background.js

// --- STATE MANAGEMENT ---
// We keep stats in memory to prevent "race conditions" where
// reading/writing to storage too fast causes data loss.
let websiteStatsCache = {};
let activeDomain = null;
let lastActiveTimestamp = Date.now();
let isInitialized = false;

// --- INITIALIZATION ---
async function init() {
    try {
        const data = await browser.storage.local.get("websiteStats");
        websiteStatsCache = data.websiteStats || {};
        isInitialized = true;
        
        // Immediately check for the active tab on load
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs.length > 0) {
            handleTabChange(tabs[0]);
        }
    } catch (e) {
        console.error("Init failed", e);
    }
}

init();

// --- HELPERS ---
function getDomain(url) {
    try {
        if (!url) return null;
        const u = new URL(url);
        // Allow tracking of local files and extension pages for testing purposes
        if (!['http:', 'https:', 'file:', 'moz-extension:'].includes(u.protocol)) return null;
        return u.hostname;
    } catch (e) {
        return null;
    }
}

// Update the memory cache (Fast)
function updateCache(domain, ms) {
    if (!domain || ms <= 0) return;
    
    // Store data by Date Key (YYYY-MM-DD)
    const todayKey = new Date().toISOString().split("T")[0];
    
    if (!websiteStatsCache[todayKey]) websiteStatsCache[todayKey] = {};
    if (!websiteStatsCache[todayKey][domain]) websiteStatsCache[todayKey][domain] = 0;
    
    websiteStatsCache[todayKey][domain] += ms;
}

// Save memory cache to disk (Slower, run periodically)
async function flushToStorage() {
    if (!isInitialized) return;
    await browser.storage.local.set({ websiteStats: websiteStatsCache });
}

// --- TRACKING CORE ---
function commitCurrentTime() {
    if (activeDomain && lastActiveTimestamp) {
        const now = Date.now();
        const diff = now - lastActiveTimestamp;
        // Filter out unrealistic jumps (e.g., computer sleep)
        if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
            updateCache(activeDomain, diff);
        }
    }
    lastActiveTimestamp = Date.now();
}

function handleTabChange(tab) {
    commitCurrentTime(); // Save time for previous site
    
    if (tab && tab.url) {
        activeDomain = getDomain(tab.url);
    } else {
        activeDomain = null;
    }
    lastActiveTimestamp = Date.now();
}

// --- EVENT LISTENERS ---

// 1. Tab Switching
browser.tabs.onActivated.addListener(async ({ tabId }) => {
    try {
        const tab = await browser.tabs.get(tabId);
        handleTabChange(tab);
    } catch (e) {
        activeDomain = null;
    }
});

// 2. URL Change (Navigation)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // We update on 'complete' to get the final title/url, 
    // or if the URL property changes explicitly
    if (tab.active && (changeInfo.status === 'complete' || changeInfo.url)) {
        handleTabChange(tab);
    }
});

// 3. Window Focus Change
browser.windows.onFocusChanged.addListener(async (windowId) => {
    commitCurrentTime();
    
    if (windowId === browser.windows.WINDOW_ID_NONE) {
        // Browser lost focus - stop tracking
        activeDomain = null;
    } else {
        // Browser gained focus - find active tab
        try {
            const tabs = await browser.tabs.query({ active: true, windowId });
            if (tabs.length > 0) {
                activeDomain = getDomain(tabs[0].url);
                lastActiveTimestamp = Date.now();
            }
        } catch (e) {
            activeDomain = null;
        }
    }
});

// 4. Open Dashboard
browser.action.onClicked.addListener(() => {
    browser.tabs.create({ url: "dashboard.html" });
});

// 5. Message from Dashboard (e.g. Clear Data)
browser.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === "CLEAR_TODAY_WEBSITE_STATS") {
        const todayKey = new Date().toISOString().split("T")[0];
        if (websiteStatsCache[todayKey]) {
            delete websiteStatsCache[todayKey];
            await flushToStorage();
        }
        lastActiveTimestamp = Date.now(); // Reset timer
    }
});

// --- HEARTBEAT ---
// Update memory every second so the dashboard sees "live" numbers
setInterval(() => {
    if (activeDomain) {
        const now = Date.now();
        const diff = now - lastActiveTimestamp;
        if (diff > 0) {
            updateCache(activeDomain, diff);
            lastActiveTimestamp = now;
        }
    }
}, 1000);

// Save to disk every 2 seconds
setInterval(flushToStorage, 2000);