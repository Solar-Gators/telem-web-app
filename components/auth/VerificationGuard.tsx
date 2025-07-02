"use client"
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface VerificationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function VerificationGuard({ children, fallback }: VerificationGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access telemetry data.</p>
          <Button variant="secondary" size="lg" onClick={() => signIn("google")}>
            <FaGoogle className="mr-2" />
            Sign In with Google
          </Button>
        </div>
      </div>
    );
  }

  if (!session.user.is_verified) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold">Verification Required</h2>
          <p className="text-gray-600">
            Your account needs to be verified to access telemetry data.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to verify your account.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
