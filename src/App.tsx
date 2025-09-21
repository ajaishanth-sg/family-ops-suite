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
import { Travel } from "@/pages/Travel";
import { Fleet } from "@/pages/Fleet";
import { Houses } from "@/pages/Houses";
import { Operations } from "@/pages/Operations";
import { Budgets } from "@/pages/Budgets";
import { Staff } from "@/pages/Staff";
import { Alerts } from "@/pages/Alerts";
import { Settings } from "@/pages/Settings";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, profile, loading, signOut, isAuthenticated } = useAuth();
  const [appUser, setAppUser] = useState<User>({
    role: "",
    email: "",
    isAuthenticated: false,
  });

  useEffect(() => {
    if (isAuthenticated && profile) {
      setAppUser({
        role: profile.role,
        email: profile.email,
        isAuthenticated: true,
      });
    } else {
      setAppUser({
        role: "",
        email: "",
        isAuthenticated: false,
      });
    }
  }, [isAuthenticated, profile]);

  const handleLogin = (role: string, email: string) => {
    // The useAuth hook handles the actual authentication
    // This is just for compatibility with existing code
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!appUser.isAuthenticated ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <AppLayout userRole={appUser.role} userEmail={appUser.email} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard userRole={appUser.role} />} />
                <Route path="/approvals" element={<Approvals userRole={appUser.role} />} />
                <Route path="/expenses" element={<Expenses userRole={appUser.role} />} />
                <Route path="/cards" element={<DebitCards userRole={appUser.role} />} />
                <Route path="/travel" element={<Travel userRole={appUser.role} />} />
                <Route path="/fleet" element={<Fleet userRole={appUser.role} />} />
                <Route path="/checklists" element={<Operations userRole={appUser.role} />} />
                <Route path="/budgets" element={<Budgets userRole={appUser.role} />} />
                <Route path="/staff" element={<Staff userRole={appUser.role} />} />
                <Route path="/houses" element={<Houses userRole={appUser.role} />} />
                <Route path="/alerts" element={<Alerts userRole={appUser.role} />} />
                <Route path="/settings" element={<Settings userRole={appUser.role} />} />
                
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