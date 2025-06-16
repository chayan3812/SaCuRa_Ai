import React from "react";
import { useQuery } from "@tanstack/react-query";
import { OnboardingWizard } from "./OnboardingWizard";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const OnboardingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: configStatus, isLoading: configLoading, error } = useQuery({
    queryKey: ['/api/onboarding/configured'],
    retry: false,
    enabled: isAuthenticated, // Only run when user is authenticated
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show onboarding
  if (!isAuthenticated) {
    return <OnboardingWizard />;
  }

  // Show loading while checking configuration
  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Checking your setup...</p>
        </div>
      </div>
    );
  }

  // Handle configuration errors for authenticated users
  if (error) {
    console.warn("Configuration check error:", error);
    // If there's an error, assume setup is not complete and show onboarding
    return <OnboardingWizard />;
  }

  // If setup is not complete, show onboarding wizard
  if (!configStatus?.configured || !configStatus?.setupComplete) {
    return <OnboardingWizard />;
  }

  // Setup is complete, show the main application
  return <>{children}</>;
};

export default OnboardingGate;