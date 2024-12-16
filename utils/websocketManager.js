// websocketManager.js
class ConnectionManager {
  constructor() {
    // Si une instance existe déjà, la retourner
    if (ConnectionManager.instance) {
      return ConnectionManager.instance;
    }

    // Sinon, initialiser les connexions et sauvegarder l'instance
    this.connections = new Map();
    ConnectionManager.instance = this;  // Sauvegarder l'instance dans la classe elle-même
  }

  addConnection(ws, clientId) {
    if (!clientId) {
      console.warn('Attempting to add connection without clientId');
      return;
    }
    this.connections.set(clientId, ws);
    console.log(`Client ${clientId} connected. Total connections: ${this.connections.size}`);
    this.updateGuestCount();
  }

  updateConnectionId(oldClientId, newClientId) {
    const ws = this.connections.get(oldClientId);
    if (!ws) {
      console.error(`Cannot update ID: No connection found for ${oldClientId}`);
      return;
    }
    this.connections.delete(oldClientId);
    this.connections.set(newClientId, ws);
    console.log(`Connection ID updated: ${oldClientId} -> ${newClientId}`);
  }

  removeConnection(ws) {
    let removedClientId = null;
    for (const [clientId, connection] of this.connections.entries()) {
      if (connection === ws) {
        removedClientId = clientId;
        this.connections.delete(clientId);
        console.log(`Client ${clientId} disconnected. Total connections: ${this.connections.size}`);
        break;
      }
    }

    if (ws.readyState === 1) { // WebSocket.OPEN
      try {
        ws.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }

    this.updateGuestCount();
    return removedClientId;
  }

  updateGuestCount() {
    const connectedGuests = this.connections.size;
    this.broadcast({
      type: 'guests',
      guests: connectedGuests
    });
  }

  updateBreakAttemps(brakeAttemps) {
    this.broadcast({
      type: 'brakeAttemps',
      brakeAttemps: brakeAttemps
    });
  }

  updatePrice(price) {
    this.broadcast({
      type: 'price',
      current_price: price
    });
    console.log(`Price updated: ${price}`);
  }

  sendToClient(clientId, message) {
    const ws = this.connections.get(clientId);
    if (!ws) {
      console.error(`No connection found for clientId ${clientId}`);
      return;
    }

    if (ws.readyState === 1) { // WebSocket.OPEN
      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        ws.send(messageStr);
        console.log(`Message sent to client ${clientId}:`, message);
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
        this.removeConnection(ws);
      }
    } else {
      console.error(`Connection for clientId ${clientId} is not open (state: ${ws.readyState})`);
      this.removeConnection(ws);
    }
  }

  broadcast(message) {
    if (this.connections.size === 0) {
      console.log('No connections available for broadcasting');
      return;
    }

    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    let successCount = 0;
    let failCount = 0;

    this.connections.forEach((ws, clientId) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        try {
          ws.send(messageStr);
          successCount++;
          console.log(`Broadcast successful to client ${clientId}`);
        } catch (error) {
          console.error(`Failed to broadcast to client ${clientId}:`, error);
          failCount++;
          this.removeConnection(ws);
        }
      } else {
        console.warn(`Skipping broadcast to client ${clientId} - connection not open (state: ${ws.readyState})`);
        failCount++;
        this.removeConnection(ws);
      }
    });

    console.log(`Broadcast complete - Success: ${successCount}, Failed: ${failCount}`);
  }

  getConnectionCount() {
    return this.connections.size;
  }
}

// Exporter l'instance unique de ConnectionManager
export default new ConnectionManager();
