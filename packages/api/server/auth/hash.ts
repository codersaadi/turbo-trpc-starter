
import { hashPassword ,generateRandomString,verifyPassword } from "better-auth/crypto";


export const internalAuthUtils = {
    hash : hashPassword,
    generate : generateRandomString,
    // compare : c,
    // hashToBase64,
    verify : verifyPassword
}

// Re-export for convenience
export { hashPassword, verifyPassword, generateRandomString }