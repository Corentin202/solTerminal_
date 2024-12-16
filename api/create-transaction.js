import { createDevnetPaymentTransaction } from '../utils/createTransaction.js';

async function createTransactionHandler(req, res) {
    // Vérifie que la méthode HTTP est POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { senderPublicKey } = req.body;

    // Validation de l'entrée : vérifie si la clé publique de l'expéditeur est présente
    if (!senderPublicKey) {
        return res.status(400).json({ success: false, error: 'Clé publique de l\'expéditeur manquante' });
    }

    try {
        const { transaction, lastValidBlockHeight } = await createDevnetPaymentTransaction(senderPublicKey);
        res.status(200).json({ success: true, transaction, lastValidBlockHeight });

    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ success: false, error: 'Error creating transaction' });
    }
}

export default createTransactionHandler;
