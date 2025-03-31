document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleAutoFetch");
    const statusText = document.getElementById("status");
    const timerText = document.getElementById("timer");

    let countdown = 60;
    let interval;

    const updateTimer = () => {
        chrome.runtime.sendMessage({ action: "getCountdown" }, (response) => {
          const countdown = response.countdown;
          const minutes = Math.floor(countdown / 60);
          const seconds = countdown % 60;
          timerText.innerText = `🔄 Prochaine extraction dans : ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        });
      };      

    chrome.storage.local.get(["isAutoFetchActive"], (result) => {
        console.log("🔍 Vérification du statut d'auto-extraction :", result);
        if (result.isAutoFetchActive) {
            startAutoFetch();
        } else {
            stopAutoFetch();
        }
    });

    const startAutoFetch = () => {
        console.log("✅ Démarrage de l'auto-extraction !");
        statusText.innerText = "Statut : ✅ Actif";
        timerText.innerText = "⏳ Extraction immédiate en cours...";
        countdown = 60;

        chrome.runtime.sendMessage({ action: "startAutoFetch" }, (response) => {
            console.log("📩 Réponse du background.js :", response);
            if (response.status === "success") {
                timerText.innerText = `🔄 Prochaine extraction dans : ${Math.floor(countdown / 60)}:${(countdown % 60 < 10 ? "0" : "") + (countdown % 60)}`;
            }
        });

        interval = setInterval(updateTimer, 1000);
        toggleButton.innerText = "⏹️ Arrêter Extraction Auto";
    };

    const stopAutoFetch = () => {
        console.log("⏹️ Arrêt de l'auto-extraction !");
        chrome.storage.local.set({ isAutoFetchActive: false });
        statusText.innerText = "Statut : ❌ Inactif";
        timerText.innerText = "🔄 Prochaine extraction dans : --:--";

        chrome.runtime.sendMessage({ action: "stopAutoFetch" }, (response) => {
            console.log("📩 Réponse du background.js :", response);
        });

        clearInterval(interval);
        toggleButton.innerText = "⏳ Activer Extraction Auto";
    };

    toggleButton.addEventListener("click", () => {
        chrome.storage.local.get(["isAutoFetchActive"], (result) => {
            if (result.isAutoFetchActive) {
                stopAutoFetch();
            } else {
                startAutoFetch();
            }
        });
    });
});
