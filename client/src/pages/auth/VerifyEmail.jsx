import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Zap, Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import api from "../../api/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus("error");
        return;
      }
      try {
        await api.post("/api/auth/verify-email", { token });
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };
    performVerification();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
            <Zap size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Email Verification
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-xl text-center">
          {status === "loading" && (
            <div className="py-6 flex flex-col items-center">
              <Loader2 size={40} className="text-cyan-500 animate-spin mb-4" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">Verifying your email address...</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                Thank you for verifying your email address. Your account is now fully active.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition font-medium w-full text-center"
              >
                Sign In
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="py-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                The verification token is invalid, expired, or has already been used. Please try requesting a new link.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
