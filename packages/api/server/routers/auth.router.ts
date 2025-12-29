import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc/lambda";
import { sendEmail } from "../email/send";
import { emailVerificationTemplate } from "../email/templates/auth-email-templates";
import { TRPCError } from "@trpc/server";
import { generateOTP, verifyOTP, storeOTP } from "../auth/otp.utils";
import { hashPassword } from "../auth/hash";
import { serverDB } from "../db/server";
import { users, verifications } from "../db/schema/better-auth";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

/**
 * Authentication router for custom signup and OTP verification workflows
 */
export const authRouter = createTRPCRouter({
  /**
   * Custom signup endpoint that creates a user and sends OTP
   */
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(1, "Name is required"),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password, name } = input;

      // Check if user already exists
      const existingUser = await serverDB.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user (email not verified yet)
      const userId = createId();
      await serverDB.insert(users).values({
        id: userId,
        email,
        name,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create account entry with hashed password
      const { accounts } = await import("../db/schema/better-auth");
      await serverDB.insert(accounts).values({
        id: createId(),
        userId,
        accountId: email,
        providerId: "credential",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Generate and store OTP
      const otp = generateOTP();
      await storeOTP(email, otp, "email-verification");

      // Send verification email with OTP
      try {
        await sendEmail({
          to: email,
          subject: "Verify your email",
          react: emailVerificationTemplate({
            type: "otp",
            code: otp,
            username: name,
          }),
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        // Don't throw error here - user is created, they can request new OTP
      }

      return {
        success: true,
        message:
          "Account created. Please check your email for verification code.",
        userId,
      };
    }),

  /**
   * Verify email with OTP and create session
   */
  verifyEmailWithOTP: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().length(6, "OTP must be 6 digits"),
      })
    )
    .mutation(async ({ input }) => {
      const { email, otp } = input;

      // Verify OTP
      const isValid = await verifyOTP(email, otp, "email-verification");
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired OTP",
        });
      }

      // Get user
      const user = await serverDB.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Update user as verified
      await serverDB
        .update(users)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Delete used OTP
      await serverDB
        .delete(verifications)
        .where(eq(verifications.identifier, `${email}:email-verification`));

      return {
        success: true,
        message: "Email verified successfully. You can now sign in.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  /**
   * Resend verification OTP
   */
  resendVerificationOTP: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const { email } = input;

      // Check if user exists
      const user = await serverDB.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already verified",
        });
      }

      // Generate new OTP
      const otp = generateOTP();
      await storeOTP(email, otp, "email-verification");

      // Send email
      try {
        await sendEmail({
          to: email,
          subject: "Verify your email",
          react: emailVerificationTemplate({
            type: "otp",
            code: otp,
            username: user.name || (email.split("@")[0] as string),
          }),
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification email",
        });
      }

      return {
        success: true,
        message: "Verification code sent to your email",
      };
    }),
});
