import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OnboardingWizard from "./OnboardingWizard";
import { Loader2 } from "lucide-react";

export const OnboardingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: configStatus, isLoading, error } = useQuery({
    queryKey: ['/api/onboarding/configured'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Checking your setup...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error checking configuration</p>
          <p className="text-sm text-gray-600">Please refresh the page</p>
        </div>
      </div>
    );
  }

  // If setup is not complete, show onboarding wizard
  if (!configStatus?.configured || !configStatus?.setupComplete) {
    return <OnboardingWizard />;
  }

  // Setup is complete, show the main application
  return <>{children}</>;
};

export default OnboardingGate;