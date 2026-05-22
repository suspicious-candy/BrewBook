import dotenv from "dotenv"

dotenv.config();
export const clients = new Map();

const redirectUris = [
  "brewbook://callback",
  "http://localhost:8081/callback",
];
if (process.env.CLIENT_ORIGIN) {
  redirectUris.push(`${process.env.CLIENT_ORIGIN}/callback`);
}

clients.set("demo-client", {
  clientId: "demo-client",
  redirectUris,
});
