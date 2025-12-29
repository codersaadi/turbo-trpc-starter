"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import { Loader2, Mail } from "lucide-react";
import { useTRPC } from "../../../libs/trpc/trpc-utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const trpc = useTRPC();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP dialog state
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState("");

  // Mutations
  const signupMutation = useMutation(
    trpc.auth.signup.mutationOptions({
      onSuccess: () => {
        toast.success("Check your email for a verification code");
        setShowOTPDialog(true);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create account");
      },
    }),
  );

  const verifyMutation = useMutation(
    trpc.auth.verifyEmailWithOTP.mutationOptions({
      onSuccess: () => {
        toast.success("Email verified! You can now sign in.");
        setShowOTPDialog(false);
        router.push("/login");
      },
      onError: (error) => {
        toast.error(error.message || "Invalid or expired code");
        setOtp("");
      },
    }),
  );

  const resendMutation = useMutation(
    trpc.auth.resendVerificationOTP.mutationOptions({
      onSuccess: () => {
        toast.success("New verification code sent");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to resend code");
      },
    }),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    signupMutation.mutate({ name, email, password });
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    verifyMutation.mutate({ email, otp });
  };

  const handleResendOTP = () => {
    resendMutation.mutate({ email });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Create an account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your details to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
              disabled={signupMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
              disabled={signupMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
              disabled={signupMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11"
              required
              disabled={signupMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        {/* Terms */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="underline hover:text-zinc-900 dark:hover:text-white"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline hover:text-zinc-900 dark:hover:text-white"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Mail className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <DialogTitle className="text-xl">Check your email</DialogTitle>
            <DialogDescription className="text-center">
              We sent a verification code to{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {email}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-6 py-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={verifyMutation.isPending}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button
              onClick={handleVerifyOTP}
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              disabled={verifyMutation.isPending || otp.length !== 6}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify email"
              )}
            </Button>

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendMutation.isPending}
                className="font-medium text-zinc-900 hover:underline dark:text-white disabled:opacity-50"
              >
                {resendMutation.isPending ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
