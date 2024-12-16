import pool from "../utils/db.js";
import queries from "../utils/queries.js";

async function checkUserPermission(senderPublicKey) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(queries.checkUserPermission, [senderPublicKey]);
    if (rows.length === 0) {
      throw new Error("Unauthorized user");
    }
    return rows[0].id_user;
  } finally {
    connection.release();
  }
}

async function saveMessage(message, aiExplanation, userId, decision) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
  
    await connection.execute(queries.saveMessage, [message, aiExplanation, userId, decision]);
    await connection.execute(queries.updateUser, [userId]);
  
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getMessageHistory() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(queries.getMessageHistory);
    return rows;
  } finally {
    connection.release();
  }
}

async function getCurrentPrice() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(queries.getCurrentPrice);
    return rows[0].current_price;
  } finally {
    connection.release();
  }
}

async function getWinner(recipientPublicKey) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(queries.getWinner, [recipientPublicKey]);
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  } finally {
    connection.release();
  }
}

export default { checkUserPermission, saveMessage, getMessageHistory, getCurrentPrice, getWinner };
