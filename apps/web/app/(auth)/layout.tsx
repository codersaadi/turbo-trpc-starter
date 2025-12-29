import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth Layout - Professional split-screen design
 * Left: Branding/hero section, Right: Auth form
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />

        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg
              className="absolute top-1/4 left-1/4 w-64 h-64 text-zinc-800/50"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <circle
                cx="100"
                cy="100"
                r="60"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <circle
                cx="100"
                cy="100"
                r="40"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </svg>
          </div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border border-zinc-700/30 rounded-full" />
          <div className="absolute top-40 right-40 w-24 h-24 border border-zinc-700/30 rounded-lg rotate-45" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              BaseKit
            </h1>
          </div>

          <div className="space-y-6">
            <blockquote className="text-lg text-zinc-400 leading-relaxed max-w-md">
              "A modern foundation for building exceptional applications. Fast,
              secure, and production-ready."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                <span className="text-sm font-medium text-white">BK</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">BaseKit Team</p>
                <p className="text-sm text-zinc-500">Building for developers</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-zinc-600">
            © 2024 BaseKit. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-zinc-950 p-6 sm:p-12">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
