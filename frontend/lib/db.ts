// Nel file db.ts - aggiungi gestione errori
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("❌ MONGODB_URI non definita! Controlla il file .env");
}

const client = new MongoClient(uri);

let isConnected = false;

export const connectToDatabase = async () => {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (error) {
      throw error;
    }
  }
  return client;
};

export { client };
