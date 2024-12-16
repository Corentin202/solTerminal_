// utils/solanaConnection.js

import { Connection, clusterApiUrl } from '@solana/web3.js';

// Définir l'environnement cible : 'devnet', 'mainnet-beta', ou 'testnet'
const ENVIRONMENT = process.env.SOLANA_ENV || 'devnet'; // Par défaut sur 'devnet', modifiable via une variable d'environnement

// Créer une connexion en fonction de l'environnement
const connection = new Connection(clusterApiUrl(ENVIRONMENT), 'confirmed');

export default connection;
