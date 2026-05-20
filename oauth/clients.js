import dotenv from "dotenv"

dotenv.config();
export const clients = new Map();

clients.set("demo-client", {
  clientId: "demo-client",
  redirectUris: [`${process.env.CLIENT_ORIGIN}/callback`]
});
