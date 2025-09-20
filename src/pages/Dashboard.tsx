import { ChairmanDashboard } from "@/components/dashboard/ChairmanDashboard";
import { FinancialAdvisorDashboard } from "@/components/dashboard/FinancialAdvisorDashboard";
import { HeadOfOperationsDashboard } from "@/components/dashboard/HeadOfOperationsDashboard";
import { ExecutiveAssistantDashboard } from "@/components/dashboard/ExecutiveAssistantDashboard";
import { SeniorAccountantDashboard } from "@/components/dashboard/SeniorAccountantDashboard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ApprovalChart } from "@/components/dashboard/ApprovalChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DollarSign, Users, Car, Home } from "lucide-react";

interface DashboardProps {
  userRole: string;
}

export function Dashboard({ userRole }: DashboardProps) {
  // Role-specific dashboards
  switch (userRole) {
    case "chairman":
      return <ChairmanDashboard />;
    case "financial-advisor":
      return <FinancialAdvisorDashboard />;
    case "head-of-operations":
      return <HeadOfOperationsDashboard />;
    case "executive-assistant":
      return <ExecutiveAssistantDashboard />;
    case "senior-accountant":
      return <SeniorAccountantDashboard />;
    default:
      // Generic dashboard for other roles
      const genericStats = [
        { title: "Active Tasks", value: "12", change: { value: 3, isPositive: true }, icon: Users },
        { title: "Pending Items", value: "8", change: { value: 2, isPositive: false }, icon: DollarSign },
        { title: "Completed", value: "45", change: { value: 12, isPositive: true }, icon: Car },
        { title: "Total Projects", value: "6", change: { value: 1, isPositive: true }, icon: Home },
      ];

      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Here's your overview.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {genericStats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ApprovalChart />
            <RecentActivity />
          </div>
        </div>
      );
  }
}