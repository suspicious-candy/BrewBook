import dotenv from "dotenv"

dotenv.config();
export const clients = new Map();

clients.set("demo-client", {
  clientId: "demo-client",
  redirectUris: [`https://localhost:${process.env.CLIENT_SERVER_PORT}/callback`]
});
