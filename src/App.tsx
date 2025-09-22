import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const defaultUserRole = "chairman"; // Default role for demo purposes
  const defaultEmail = "admin@familyoffice.com";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout userRole={defaultUserRole} userEmail={defaultEmail} onLogout={() => {}}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard userRole={defaultUserRole} />} />
              <Route path="/approvals" element={<Approvals userRole={defaultUserRole} />} />
              <Route path="/expenses" element={<Expenses userRole={defaultUserRole} />} />
              <Route path="/cards" element={<DebitCards userRole={defaultUserRole} />} />
              <Route path="/travel" element={<Travel userRole={defaultUserRole} />} />
              <Route path="/fleet" element={<Fleet userRole={defaultUserRole} />} />
              <Route path="/checklists" element={<Operations userRole={defaultUserRole} />} />
              <Route path="/budgets" element={<Budgets userRole={defaultUserRole} />} />
              <Route path="/staff" element={<Staff userRole={defaultUserRole} />} />
              <Route path="/houses" element={<Houses userRole={defaultUserRole} />} />
              <Route path="/alerts" element={<Alerts userRole={defaultUserRole} />} />
              <Route path="/settings" element={<Settings userRole={defaultUserRole} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;