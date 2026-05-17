import dotenv from "dotenv"
import { randomBytes, createHash } from "crypto";

dotenv.config();

export function base64url(input){
    return input.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

export function sha256Base64url(str){
    const hash = createHash("sha256").update(str).digest();
    return base64url(hash);
}

export function generateCode(){
    return base64url(randomBytes(32));
}