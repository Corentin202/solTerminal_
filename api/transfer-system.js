// transferSystem.js
import { Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import connection from '../utils/solanaConnection.js';
import services from "../utils/services.js";
const { getWinner } = services;
import dotenv from 'dotenv';

dotenv.config();


const wallet = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.PRIVATE_KEY)));

export const createTransferTransaction = async (recipientPublicKey) => {
    if (!recipientPublicKey) {
        throw new Error('Invalid recipient public key');
    }

    // Vérifier si le destinataire a la décision 'approve_transfert' (gagnant)
    await getWinner(recipientPublicKey);

    const balance = await connection.getBalance(wallet.publicKey);
    const amountInLamports = Math.floor(balance * 0.7);
    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: recipientPublicKey,
            lamports: amountInLamports,
        })
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = blockhash;

    // Return the serialized transaction for client signing
    return transaction.serialize({ requireAllSignatures: false }).toString('base64');
};

export const executeSignedTransaction = async (signedSerializedTx) => {
    const signedTransaction = Transaction.from(Buffer.from(signedSerializedTx, 'base64'));
    
    // Server signs the transaction as well (as it's the sender)
    signedTransaction.sign(wallet);
    
    // Send and confirm the transaction
    const txId = await connection.sendTransaction(signedTransaction, [wallet]);
    await connection.confirmTransaction(txId, 'confirmed');
    
    return txId;
};