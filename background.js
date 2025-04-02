console.log("✅ `background.js` chargé avec succès !");

let autoFetchInterval;
let countdown = 3600; // Initialisation du timer à 60 secondes
let timerInterval = null;


// 🔄 Met à jour le compte à rebours dans chrome.storage.local
const updateCountdown = () => {
    if (countdown > 0) {
        countdown--;
    } else {
        countdown = 3600; // ✅ Reboucle toutes les heures
        triggerExtraction(); // Déclencher immédiatement une extraction
    }
    chrome.storage.local.set({ countdown });
};

// ⏳ Fonction pour lancer l'extraction automatique immédiatement
const startAutoFetch = () => {
    console.log("⏳ Activation de l'auto-extraction...");
    
    // 🔥 Première extraction immédiate !
    triggerExtraction(); 

    if (!autoFetchInterval) {
        autoFetchInterval = setInterval(updateCountdown, 1000);
    }

    chrome.storage.local.set({ isAutoFetchActive: true, countdown });
};

// ⏹️ Fonction pour arrêter l'extraction automatique
const stopAutoFetch = () => {
    console.log("⏹️ Désactivation de l'auto-extraction.");
    clearInterval(autoFetchInterval);
    autoFetchInterval = null;
    chrome.storage.local.set({ isAutoFetchActive: false, countdown: 3600 });
};

// 🔄 Déclenchement manuel de l'extraction
const triggerExtraction = () => {
    console.log("🔄 Déclenchement immédiat de l'extraction...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            console.log("📨 Envoi de l'ordre d'extraction au content script...");
            chrome.tabs.sendMessage(tabs[0].id, { action: "extractTickets" }, (response) => {
                console.log("✅ Réponse reçue de content.js :", response);
            });
        } else {
            console.warn("⚠️ Aucun onglet actif trouvé !");
        }
    });
};

// 📩 Écoute les messages envoyés par `popup.js`
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("📩 Message reçu dans `background.js` :", message);

    if (message.action === "startAutoFetch") {
        startAutoFetch();
        sendResponse({ status: "success", message: "Auto-extraction activée et première extraction effectuée." });
    }

    if (message.action === "stopAutoFetch") {
        stopAutoFetch();
        sendResponse({ status: "success", message: "Auto-extraction désactivée." });
    }

    if (message.action === "getCountdown") {
        chrome.storage.local.get(["countdown"], (result) => {
            sendResponse({ countdown: result.countdown || 3600 });
        });
        return true;
    }
});
