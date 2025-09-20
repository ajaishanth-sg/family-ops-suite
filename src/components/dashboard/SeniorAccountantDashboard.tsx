import { StatsCard } from "./StatsCard";
import { ApprovalChart } from "./ApprovalChart";
import { RecentActivity } from "./RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from "lucide-react";

export function SeniorAccountantDashboard() {
  const accountingStats = [
    {
      title: "Monthly Payments",
      value: "$342K",
      change: { value: 15.2, isPositive: true },
      icon: DollarSign,
    },
    {
      title: "Pending Invoices", 
      value: "23",
      change: { value: 5, isPositive: false },
      icon: AlertCircle,
    },
    {
      title: "Bank Accounts",
      value: "12", 
      change: { value: 0, isPositive: true },
      icon: CreditCard,
    },
    {
      title: "Treasury Balance",
      value: "$156K",
      change: { value: 8.7, isPositive: true },
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Accounting Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Payment processing, treasury, and bank management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {accountingStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ApprovalChart />
        <Card>
          <CardHeader>
            <CardTitle>Payment Queue</CardTitle>
            <CardDescription>Payments awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-900">Racing Team Expenses</p>
                <p className="text-sm text-yellow-700">Awaiting FA + HOO approval</p>
              </div>
              <div className="text-sm text-yellow-600 font-medium">$45,000</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-900">House Maintenance</p>
                <p className="text-sm text-green-700">Approved - Ready to process</p>
              </div>
              <div className="text-sm text-green-600 font-medium">$12,500</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">Fleet Insurance</p>
                <p className="text-sm text-blue-700">Monthly recurring payment</p>
              </div>
              <div className="text-sm text-blue-600 font-medium">$8,200</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentActivity />
    </div>
  );
}