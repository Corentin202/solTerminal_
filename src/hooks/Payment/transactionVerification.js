
export const verifyTransaction = async (signature, connection) => {
  try {
    // Wait for transaction confirmation
    const confirmation = await connection.confirmTransaction(signature);
    
    if (confirmation.value.err) {
      throw new Error('Transaction failed');
    }

    // Get transaction details
    const transactionDetails = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!transactionDetails) {
      throw new Error('Transaction details not found');
    }

    // Verify transaction status
    const isSuccessful = transactionDetails.meta?.err === null;
    
    if (!isSuccessful) {
      throw new Error('Transaction verification failed');
    }

    return {
      success: true,
      signature,
      timestamp: transactionDetails.blockTime,
      slot: transactionDetails.slot,
    };
  } catch (error) {
    console.error('Transaction verification error:', error);
    throw error;
  }
}