console.log("🟢 Content script `content.js` chargé !");

// 🔍 Fonction pour extraire les tickets
const extractTickets = () => {
    console.log("🔍 Début de l'extraction des tickets...");

    let tickets = [];
    const rows = document.querySelectorAll("table.tbl-grid-data-container tbody tr");

    console.log(`📌 Nombre de lignes trouvées : ${rows.length}`);

    rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        console.log(`🔎 Analyse de la ligne ${index + 1}, colonnes détectées : ${columns.length}`);

        if (columns.length > 0) {
            let lastUpdate = columns[4]?.innerText.trim() || "";
            let ticketNumber = columns[6]?.innerText.trim() || "";
            let priority = columns[7]?.innerText.trim() || "";

            console.log(`📜 Ticket extrait (avant vérif) → Numéro: "${ticketNumber}", Date: "${lastUpdate}", Priorité: "${priority}"`);

            // Vérification des valeurs récupérées
            if (!ticketNumber || ticketNumber === "-") {
                console.warn(`⚠️ Ticket ignoré (ligne ${index + 1}) : numéro de ticket vide`);
                return;
            }

            if (!lastUpdate) {
                console.warn(`⚠️ Date de mise à jour manquante pour le ticket ${ticketNumber}`);
            }

            if (!priority) {
                console.warn(`⚠️ Priorité manquante pour le ticket ${ticketNumber}`);
            }

            tickets.push({ lastUpdate, ticketNumber, priority });
        }
    });

    console.log(`✅ Extraction terminée, ${tickets.length} ticket(s) extrait(s) !`);
    return tickets;
};

// 📤 Envoi des tickets au backend
const sendTicketsToBackend = async (tickets) => {
    if (tickets.length === 0) {
        console.warn("⚠️ Aucun ticket à envoyer.");
        return;
    }

    console.log("📡 Envoi des tickets au backend :", tickets);

    try {
        const response = await fetch("http://localhost:5000/api/tickets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tickets),
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ Réponse du serveur :", result);
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi des tickets :", error);
    }
};

// 🔄 Écoute des messages du background.js ou popup.js
chrome.runtime.onMessage.addListener((message) => {
    console.log("📩 Message reçu dans `content.js` :", message);

    if (message.action === "extractTickets") {
        console.log("🔍 Extraction déclenchée !");
        const tickets = extractTickets();
        console.log(`📩 Tickets extraits :`, tickets);
        sendTicketsToBackend(tickets);
    }
});
