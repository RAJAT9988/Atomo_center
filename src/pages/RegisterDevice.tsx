import RegistrationScreen from "@/components/onboarding/RegistrationScreen";
import { useNavigate } from "react-router-dom";

const RegisterDevice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-atomic opacity-[0.03] blur-[120px] pointer-events-none" />
      <RegistrationScreen onSuccess={() => navigate("/dashboard")} />
    </div>
  );
};

export default RegisterDevice;

