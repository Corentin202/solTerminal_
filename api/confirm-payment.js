import pool from '../utils/sqlConnection.js';
import manager from "../utils/websocketManager.js";
import queries from '../utils/queries.js';

async function confirmPaymentHandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { signature, walletAddress, timestamp } = req.body;

    if (!signature || !walletAddress || !timestamp) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required parameters' 
        });
    }

    try {
        // Récupérer les informations de prix actuelles depuis la base de données
        const [priceData] = await pool.query(queries.getPriceData);
        if (!priceData.length) {
            return res.status(404).json({ success: false, error: 'Price information not found' });
        }

        const { current_price: amountinsol, max_price } = priceData[0];

        // Calculer le nouveau prix avec une augmentation de 2 %
        const newPrice = Math.min(amountinsol * 1.02, max_price);

        // Mettre à jour le prix dans la base de données
        await pool.query(queries.updatePrice, [newPrice]);

        // Vérifier si l'utilisateur existe déjà dans la base de données
        const [existingUser] = await pool.query(queries.checkUserExists, [walletAddress]);
        if (existingUser.length > 0) {
            // Si l'utilisateur existe, mettre à jour son statut
            await pool.query(queries.updateUserPaymentStatus2, [true, existingUser[0].id_user]);
        } else {
            // Sinon, insérer un nouvel utilisateur
            await pool.query(queries.insertNewUser, [walletAddress, true]);
        }

        console.log('Transaction updates completed successfully');

        // mettre à jour le current price
        manager.updatePrice(newPrice);
        
        res.status(200).json({ 
            success: true, 
            message: 'Payment confirmation recorded' 
        });
    } catch (error) {
        console.error("Error confirming payment:", error);
        res.status(500).json({ 
            success: false, 
            error: 'Error recording payment confirmation' 
        });
    }
}

export default confirmPaymentHandler;