import { internalAuthUtils } from "./hash";
import { serverDB } from "../db/server";
import { verifications } from "../db/schema/better-auth";
import { eq, and, gt } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

/**
 * OTP Generation and Verification Utilities
 * Provides secure OTP handling for email verification workflow
 */

export interface OTPData {
  otp: string;
  hashedOTP: string;
  expiresAt: Date;
}

export interface VerifyOTPResult {
  success: boolean;
  error?: string;
}

/**
 * Generate a random OTP code
 * @param length - Length of OTP (default from env or 6)
 * @returns OTP string
 */
export function generateOTP(length?: number): string {
  const otpLength = length || parseInt(process.env.OTP_LENGTH || "6", 10);
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < otpLength; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}

/**
 * Create OTP data with hash and expiration
 * @param customOTP - Optional custom OTP (for testing)
 * @returns OTP data object
 */
export async function createOTPData(customOTP?: string): Promise<OTPData> {
  const otp = customOTP || generateOTP();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10);

  const hashedOTP = await internalAuthUtils.hash(otp);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    otp,
    hashedOTP,
    expiresAt,
  };
}

/**
 * Store OTP in database
 * @param email - User email
 * @param otp - Generated OTP
 * @param type - Type of verification
 */
export async function storeOTP(
  email: string,
  otp: string,
  type: "email-verification" | "password-reset" = "email-verification"
): Promise<void> {
  const identifier = `${email}:${type}`;
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Delete any existing OTP for this email/type
  await serverDB
    .delete(verifications)
    .where(eq(verifications.identifier, identifier));

  // Store new OTP
  await serverDB.insert(verifications).values({
    id: createId(),
    identifier,
    value: otp,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Verify OTP from database
 * @param email - User email
 * @param providedOTP - OTP provided by user
 * @param type - Type of verification
 * @returns Boolean indicating if OTP is valid
 */
export async function verifyOTP(
  email: string,
  providedOTP: string,
  type: "email-verification" | "password-reset" = "email-verification"
): Promise<boolean> {
  const identifier = `${email}:${type}`;

  // Get OTP from database
  const verification = await serverDB.query.verifications.findFirst({
    where: and(
      eq(verifications.identifier, identifier),
      gt(verifications.expiresAt, new Date())
    ),
  });

  if (!verification) {
    return false;
  }

  // Check if OTP matches
  return verification.value === providedOTP;
}

/**
 * Check if OTP has expired
 * @param expiresAt - Expiration timestamp
 * @returns Boolean indicating if expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Generate a unique identifier for verification
 * Format: email-verification:{email}
 */
export function generateVerificationIdentifier(
  email: string,
  type: "email-verification" | "password-reset" = "email-verification"
): string {
  return `${type}:${email.toLowerCase()}`;
}
