import { Client, Databases, TablesDB } from 'appwrite';

const client = new Client();
client
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) // Your Appwrite Endpoint
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!); // Your project ID
export const databases = new Databases(client);
export const tablesDB = new TablesDB(client);
export { client };
