import { StatsCard } from "./StatsCard";
import { ApprovalChart } from "./ApprovalChart";
import { RecentActivity } from "./RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, AlertTriangle } from "lucide-react";

export function FinancialAdvisorDashboard() {
  const financialStats = [
    {
      title: "Total Portfolio",
      value: "$2.4M",
      change: { value: 8.3, isPositive: true },
      icon: DollarSign,
    },
    {
      title: "Monthly Revenue", 
      value: "$156K",
      change: { value: 12.1, isPositive: true },
      icon: TrendingUp,
    },
    {
      title: "Pending Approvals",
      value: "7", 
      change: { value: 2, isPositive: false },
      icon: AlertTriangle,
    },
    {
      title: "Active Accounts",
      value: "12",
      change: { value: 0, isPositive: true },
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Financial Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Financial oversight and senior accountant management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ApprovalChart />
        <Card>
          <CardHeader>
            <CardTitle>Senior Accountant Activity</CardTitle>
            <CardDescription>Recent actions by accounting team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-900">Payment Processing</p>
                <p className="text-sm text-green-700">5 payments processed today</p>
              </div>
              <div className="text-sm text-green-600 font-medium">$45,000</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">Treasury Management</p>
                <p className="text-sm text-blue-700">Cash flow optimized</p>
              </div>
              <div className="text-sm text-blue-600 font-medium">Updated</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-900">Bank Reconciliation</p>
                <p className="text-sm text-yellow-700">3 accounts pending review</p>
              </div>
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentActivity />
    </div>
  );
}