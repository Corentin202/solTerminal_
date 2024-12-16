// Imports nécessaires
import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import connection from '../utils/solanaConnection.js'; // Connexion centralisée à Solana
import { Buffer } from 'buffer';
import crypto from 'crypto'; // Import pour les fonctions de hachage
import pool from '../utils/sqlConnection.js'; // Connexion à la base de données
import queries from "../utils/queries.js";
import dotenv from 'dotenv';

dotenv.config();

// Program ID de ton smart contract
const programId = new PublicKey(process.env.PROGRAM_ID);
const recipientWallet = new PublicKey(process.env.WALLET);

// Calcul du discriminateur pour l'instruction send_payment
const sendPaymentDiscriminator = crypto.createHash('sha256')
    .update('global:send_payment')
    .digest()
    .slice(0, 8);

/**
 * Fonction pour créer une transaction utilisant ton smart contract.
 * @param {string} senderPublicKey - Clé publique de l'expéditeur.
 * @returns {Promise<{transaction: string, lastValidBlockHeight: number}>} - Transaction sérialisée en base64 et son dernier bloc valide.
 */
export const createDevnetPaymentTransaction = async (senderPublicKey) => {
    try {
        const senderPublicKeyParsed = new PublicKey(senderPublicKey);

        // Vérifier si l'utilisateur a déjà payé
        const [user] = await pool.query(queries.checkUserPayment, [senderPublicKey]);
        if (user.length > 0 && user[0].payment_status === 1) {
            throw new Error('User has already paid');
        }

        // Récupérer les informations de prix depuis la base de données
        const [priceResult] = await pool.query(queries.getPriceInfo);

        if (!priceResult || priceResult.length === 0) {
            throw new Error('Price data not found');
        }
        
        // Extraire les données de prix
        const { min_price, max_price, current_price } = priceResult[0];

        // Calculer le montant en SOL
        let amountinsol = Math.max(current_price, min_price); // Respecte le prix minimum
        let amount = amountinsol * 1000000000; // Conversion en lamports (1 SOL = 10^9 lamports)

        // Arrondir à 4 décimales
        amount = Math.round(amount * 10000) / 10000;

        // Création de la transaction
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');

        // Création du buffer pour le montant
        const amountBuffer = Buffer.alloc(8);
        amountBuffer.writeBigUInt64LE(BigInt(amount), 0);

        // Données de l'instruction incluant le discriminateur et le montant
        const data = Buffer.concat([
            sendPaymentDiscriminator,
            amountBuffer
        ]);

        const instruction = new TransactionInstruction({
            keys: [
                { 
                    pubkey: senderPublicKeyParsed, 
                    isSigner: true, 
                    isWritable: true 
                },
                { 
                    pubkey: recipientWallet, 
                    isSigner: false, 
                    isWritable: true 
                },
                {
                    pubkey: SystemProgram.programId, 
                    isSigner: false, 
                    isWritable: false
                }
            ],
            programId, 
            data: data
        });

        const transaction = new Transaction({
            feePayer: senderPublicKeyParsed,
            blockhash,
            lastValidBlockHeight,
        }).add(instruction);

        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
        });

        return {
            transaction: serializedTransaction.toString('base64'),
            lastValidBlockHeight,
            blockhash,
            amountinsol,
            max_price
        };

    } catch (error) {
        console.error('Transaction creation error:', error);
        throw error;
    }
};