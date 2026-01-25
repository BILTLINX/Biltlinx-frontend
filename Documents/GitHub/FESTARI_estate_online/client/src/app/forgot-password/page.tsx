"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset submission
    console.log("Password reset requested for:", emailOrPhone);
    setShowModal(true);
  };

  return (
    <>
      <div className="relative bg-white rounded-lg shadow-sm py-8 px-30 w-full h-fit">
        <div className="space-y-6 flex flex-col items-center">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Forgot your password?</h1>
            <p className="text-sm text-gray-600">
              Enter your email or phone number and we&apos;ll help you reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Phone Number
              </label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="block w-62.5 px-3 py-2 border border-black focus:outline-none focus:ring-[#BE4D00] focus:border-[#BE4D00] text-sm"
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={!emailOrPhone.trim()}
              className={
                "w-62.5 py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00] " +
                (emailOrPhone.trim()
                  ? "bg-[#BE4D00] text-white hover:bg-orange-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed")
              }
            >
              Reset password
            </button>
          </form>
        </div>

        {showModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white w-full max-w-md rounded-md shadow-lg p-6 space-y-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Back
              </button>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Forgot Password?</h3>
                <p className="text-sm text-gray-700">
                  An email has been sent to <span className="font-semibold">{emailOrPhone}</span>.<br />
                  Kindly follow the instruction to reset your password
                </p>
              </div>

              <Link
                href="/login"
                className="block w-full py-3 bg-[#BE4D00] text-white text-center font-semibold text-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00]"
              >
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
