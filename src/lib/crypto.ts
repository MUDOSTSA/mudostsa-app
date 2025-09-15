import CryptoJS from "crypto-js";
import type { MembershipInfo } from "./types";

// The fixed password for MUDOSTSA encryption
const MUDOSTSA_PASSWORD = "MUDOSTSAForTheCountry6729";

/**
 * Encrypts data using AES encryption with the MUDOSTSA password
 * @param data - The data to encrypt (will be JSON stringified)
 * @returns Encrypted string
 */
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      jsonString,
      MUDOSTSA_PASSWORD
    ).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts data that was encrypted with MUDOSTSA password
 * @param encryptedData - The encrypted string to decrypt
 * @returns Decrypted and parsed object
 */
export function decryptData(encryptedData: string): any {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(
      encryptedData,
      MUDOSTSA_PASSWORD
    );
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Decryption failed - invalid password or corrupted data");
    }

    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Creates a hash of data using SHA256
 * @param data - The data to hash
 * @returns SHA256 hash string
 */
export function hashData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.SHA256(jsonString).toString();
  } catch (error) {
    console.error("Hashing failed:", error);
    throw new Error("Failed to hash data");
  }
}

/**
 * Generates a secure random string
 * @param length - Length of the random string (default: 32)
 * @returns Random hex string
 */
export function generateRandomString(length: number = 32): string {
  return CryptoJS.lib.WordArray.random(length / 2).toString();
}

/**
 * Creates an encrypted membership token with timestamp and hash verification
 * @param membershipInfo - The membership information to encrypt
 * @returns Encrypted membership token
 */
export function createEncryptedMembershipToken(userId: string): string {
  try {
    const timestamp = new Date().toISOString();
    const tokenData = {
      userId,
      timestamp,
      hash: hashData(userId),
      nonce: generateRandomString(16),
    };

    return encryptData(tokenData);
  } catch (error) {
    console.error("Failed to create encrypted membership token:", error);
    throw new Error("Failed to create encrypted membership token");
  }
}

/**
 * Verifies and decrypts a membership token
 * @param encryptedToken - The encrypted token to verify
 * @returns Decrypted membership info if valid
 */
export function verifyEncryptedMembershipToken(encryptedToken: string): {
  timestamp: string;
  isValid: boolean;
  hoursOld: number;
  userId: string;
} {
  try {
    const tokenData = decryptData(encryptedToken);

    // Extract the original membership info (without our added fields)
    const { timestamp, hash, nonce, userId } = tokenData;

    // Verify the hash
    const expectedHash = hashData(userId);
    if (hash !== expectedHash) {
      throw new Error("Token integrity check failed");
    }

    // Check if token is not too old (optional - you can set expiration rules)
    const tokenTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - tokenTime.getTime()) / (1000 * 60 * 60);

    return {
      userId,
      timestamp,
      isValid: true,
      hoursOld: hoursDiff,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid or corrupted membership token");
  }
}
