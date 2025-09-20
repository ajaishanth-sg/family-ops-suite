import { Navigate } from "react-router-dom";

const Index = () => {
  // Always redirect to dashboard since we have a proper ERP system
  return <Navigate to="/dashboard" replace />;
};

export default Index;