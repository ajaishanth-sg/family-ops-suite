import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Approvals } from "@/pages/Approvals";
import { Expenses } from "@/pages/Expenses";
import { DebitCards } from "@/pages/DebitCards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface User {
  role: string;
  email: string;
  isAuthenticated: boolean;
}

// Placeholder pages for other routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">
        This feature is under development and will be available soon.
      </p>
    </div>
    <div className="dashboard-card p-12 text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
      <p className="text-muted-foreground">
        We're working hard to bring you this feature. Check back soon!
      </p>
    </div>
  </div>
);

const App = () => {
  const [user, setUser] = useState<User>({
    role: "",
    email: "",
    isAuthenticated: false,
  });

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("family-office-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (role: string, email: string) => {
    const userData = {
      role,
      email,
      isAuthenticated: true,
    };
    setUser(userData);
    localStorage.setItem("family-office-user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser({
      role: "",
      email: "",
      isAuthenticated: false,
    });
    localStorage.removeItem("family-office-user");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!user.isAuthenticated ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <AppLayout userRole={user.role} userEmail={user.email} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard userRole={user.role} />} />
                <Route path="/approvals" element={<Approvals userRole={user.role} />} />
                <Route path="/expenses" element={<Expenses userRole={user.role} />} />
                <Route path="/cards" element={<DebitCards userRole={user.role} />} />
                
                {/* Placeholder routes for other features */}
                <Route path="/travel" element={<PlaceholderPage title="Travel Management" />} />
                <Route path="/fleet" element={<PlaceholderPage title="Fleet Management" />} />
                <Route path="/checklists" element={<PlaceholderPage title="Operational Checklists" />} />
                <Route path="/budgets" element={<PlaceholderPage title="Budget Management" />} />
                <Route path="/staff" element={<PlaceholderPage title="Staff Management" />} />
                <Route path="/houses" element={<PlaceholderPage title="House Management" />} />
                <Route path="/alerts" element={<PlaceholderPage title="Alert System" />} />
                <Route path="/settings" element={<PlaceholderPage title="System Settings" />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;