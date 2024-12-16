import express from "express";
import cors from "cors"; // Importer le middleware CORS
import { createServer } from "https";
import { WebSocketServer } from "ws"; // Importation correcte de WebSocketServer
import config from "./configs/config.js";
import { applySecurityMiddlewares } from "./configs/security.js";
import TimerManager from "./utils/timerManager.js";
import manager from "./utils/websocketManager.js";
import services from "./utils/services.js";
const { checkUserPermission, saveMessage, getMessageHistory, getCurrentPrice } = services;
import { converseWithAI } from "./utils/openaiAssistant.js";
import { initDB } from "./utils/db.js";
import bodyParser from "body-parser";
import createTransactionHandler from "./api/create-transaction.js"; // Importer votre fichier handler
import confirmPaymentHandler from "./api/confirm-payment.js"; // Importer votre fichier handler
import { createTransferTransaction, executeSignedTransaction } from "./api/transfer-system.js";
const { json } = bodyParser;

const app = express();

// Appliquer les middlewares de sécurité
applySecurityMiddlewares(app);

// Utiliser les options CORS de la configuration
app.use(cors(config.cors.options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Charger les fichiers de certificat SSL à partir de la configuration
const credentials = {
  key: config.ssl.key,
  cert: config.ssl.cert,
  ca: config.ssl.ca,
};

const server = createServer(credentials, app);

// Créer un serveur WebSocket avec 'wss'
const wss = new WebSocketServer({
  server, // Passe l'instance du serveur HTTPS
  path: '/ws', // Chemin pour les connexions WebSocket
});

const timerManager = new TimerManager(60);
let connectedGuests = 0;

wss.on('connection', (ws) => {
  connectedGuests++;

  // Ajouter la connexion initiale avec un ID temporaire unique
  const tempClientId = `temp-${Date.now()}-${Math.random()}`;
  ws.clientId = tempClientId;
  manager.addConnection(ws, tempClientId);

  // Mettre à jour le compte des invités
  manager.broadcast({
    type: 'guests',
    guests: connectedGuests
  });

  // Mettre à jour le prix actuel
  getCurrentPrice().then((price) => {
    manager.broadcast({
      type: 'price',
      current_price: price
    });
  });

  // Gérer les messages reçus
  ws.on('message', async (messageData) => {
    try {
      const data = JSON.parse(messageData);

      if (data.action === "register" && data.clientId) {
        const oldClientId = ws.clientId;
        ws.clientId = data.clientId;
        manager.updateConnectionId(oldClientId, data.clientId);
        console.log(`Registered customer : ${ws.clientId}`);
      } else if (data.action === "register") {
        console.error("Unregistered client: 'clientId' missing!");
        return;
      }

      if (data.action === "message_history") {
        const history = await getMessageHistory();
        ws.send(JSON.stringify({
          type: "history",
          data: history
        }));
        return;
      }

      if (data.action === "get_timer") {
        const remainingTime = timerManager.getRemainingTime();
        ws.send(JSON.stringify({
          type: "timer",
          remaining_seconds: remainingTime
        }));
        return;
      }

      const { message, senderPublicKey } = data;
      if (!message || !senderPublicKey) {
        ws.send(JSON.stringify({ success: false, error: "Missing message or public key" }));
        return;
      }

      const userId = await checkUserPermission(senderPublicKey);
      timerManager.reset();

      const userMessageResponse = { success: true, message, ai_response: null };
      manager.broadcast(userMessageResponse);

      try {
        const aiResponse = await converseWithAI(message);
        const explanation = aiResponse.explanation || '';
        const decision = aiResponse.decision || null;

        await saveMessage(message, explanation, userId, decision);

        const aiMessageResponse = {
          success: true,
          ai_response: explanation,
          decision: decision,
          type: "timer",
          remaining_seconds: timerManager.getRemainingTime(),
        };

        if (decision === "approve_transfert") {
          manager.broadcast(aiMessageResponse);
          const personalizedResponse = {
            type: "transfer_button",
            showTransferButton: true,
            transferButtonDetails: {
              label: "Claim",
              action: "confirm_transfer",
              recipientPublicKey: senderPublicKey
            }
          };
          manager.sendToClient(ws.clientId, personalizedResponse);
        } else {
          manager.broadcast(aiMessageResponse);
        }
      } catch (error) {
        console.error("Error while processing AI response:", error);
        ws.send(JSON.stringify({ 
          type: "error",
          success: false, 
          error: `Unknown error: ${error.message}` 
        }));
      }
    } catch (error) {
      console.error("Error parsing message:", error);
      ws.send(JSON.stringify({ 
        type: "error",
        success: false, 
        error: "Invalid message format" 
      }));
    }
  });

  // Gérer la déconnexion
  ws.on('close', () => {
    connectedGuests--;
    manager.removeConnection(ws.clientId);
    manager.broadcast({
      type: 'guests',
      guests: connectedGuests
    });
  });
});


app.post("/create-transaction", json(), createTransactionHandler);
app.post("/confirm-payment", json(), confirmPaymentHandler);
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/transfer-funds", json(), async (req, res) => {
  const { recipientPublicKey } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!recipientPublicKey) {
    return res.status(400).json({ success: false, error: 'Missing recipient public key' });
  }

  try {
    const serializedTx = await createTransferTransaction(recipientPublicKey);
    res.json({ success: true, transaction: serializedTx });
  } catch (error) {
    console.error('Error while creating transaction:', error);
    res.json({ success: false, error: error.message });
  }
});

app.post("/execute-transfer", json(), async (req, res) => {
  const { signedTransaction } = req.body;

  if (!signedTransaction) {
    return res.status(400).json({ success: false, error: 'Missing signed transaction' });
  }

  try {
    const txId = await executeSignedTransaction(signedTransaction);
    res.json({ success: true, transactionId: txId });
  } catch (error) {
    console.error('Error during transaction execution:', error);
    res.json({ success: false, error: error.message });
  }
});

server.listen(8000, async () => {
  await initDB();
  console.log("Server running on port 8000 with HTTPS (WebSocket enabled)");
});