import { useState } from "react";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import LoginScreen from "@/components/onboarding/LoginScreen";
import RegistrationScreen from "@/components/onboarding/RegistrationScreen";
import SuccessScreen from "@/components/onboarding/SuccessScreen";

const Onboarding = () => {
  const [step, setStep] = useState<"welcome" | "login" | "register" | "success">("welcome");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-atomic opacity-[0.03] blur-[120px] pointer-events-none" />

      {step === "welcome" && <WelcomeScreen onGetStarted={() => setStep("login")} />}
      {step === "login" && <LoginScreen onSuccess={() => setStep("register")} />}
      {step === "register" && <RegistrationScreen onSuccess={() => setStep("success")} />}
      {step === "success" && <SuccessScreen />}
    </div>
  );
};

export default Onboarding;
