"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleNext = () => {
    if (step === 1 && emailOrPhone.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login submission here
    console.log("Login submitted", { emailOrPhone, password, rememberMe });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm py-8 px-30 w-full">
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold text-gray-900 uppercase">Welcome Back</h1>
          <p className="text-sm text-gray-600">Login to continue with Festari Estates Online</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Email/Phone Number
              </label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="block w-62.5 px-3 py-2 border border-black focus:outline-none focus:ring-[#BE4D00] focus:border-[#BE4D00] text-sm"
                placeholder="020 000 0000"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-62.5 px-3 py-2 border border-black focus:outline-none focus:ring-[#BE4D00] focus:border-[#BE4D00] text-sm"
                  placeholder="••••••••"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 11V8a5 5 0 10-10 0v3m-1 0h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z"
                    />
                  </svg>
                </span>
              </div>
              <p className="text-xs text-gray-600">at least 8 characters</p>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 border-gray-400"
                  />
                  <span>Remember Me</span>
                </label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </Link>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="w-20.5 py-2 px-4 bg-[#ffffff] text-[#BE4D00] font-medium hover:bg-orange-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00] text-sm border-[#BE4D00] border"
            >
              Back
            </button>

            <button
              type={step === 2 ? "submit" : "button"}
              onClick={step === 1 ? handleNext : undefined}
              disabled={step === 1 && !emailOrPhone.trim()}
              className={
                "w-20.5 py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00] " +
                ((step === 1 && emailOrPhone.trim()) || step === 2
                  ? "bg-[#BE4D00] text-white hover:bg-orange-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed")
              }
            >
              Next
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div className="space-y-3 flex flex-col items-center">
          <button
            type="button"
            className="w-90.75 flex items-center justify-center gap-2 py-2 px-4 border border-[#BE4D00] bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login with Google
          </button>

          <button
            type="button"
            className="w-90.75 flex items-center justify-center gap-2 py-2 px-4 border border-[#BE4D00] bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Login with Apple
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          <Link href="/signup" className="text-blue-600 hover:text-blue-800">
            Don&apos;t have an account yet?
          </Link>{" "}
          Register for free
        </p>
      </div>
    </div>
  );
}
