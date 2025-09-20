import { StatsCard } from "./StatsCard";
import { ApprovalChart } from "./ApprovalChart";
import { RecentActivity } from "./RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Car, Home } from "lucide-react";

export function ChairmanDashboard() {
  const executiveStats = [
    {
      title: "Total Assets",
      value: "$2.4M",
      change: { value: 12.5, isPositive: true },
      icon: DollarSign,
    },
    {
      title: "Active Employees", 
      value: "24",
      change: { value: 2, isPositive: true },
      icon: Users,
    },
    {
      title: "Fleet Vehicles",
      value: "8", 
      change: { value: 0, isPositive: true },
      icon: Car,
    },
    {
      title: "Properties",
      value: "3",
      change: { value: 1, isPositive: true },
      icon: Home,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Executive Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, Chairman. Here's your family office overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {executiveStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ApprovalChart />
        <Card>
          <CardHeader>
            <CardTitle>Departmental Overview</CardTitle>
            <CardDescription>Current status across all departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-900">Financial Operations</p>
                <p className="text-sm text-green-700">All systems operational</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">House Operations</p>
                <p className="text-sm text-blue-700">2 maintenance tasks pending</p>
              </div>
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <p className="font-medium text-purple-900">Fleet Management</p>
                <p className="text-sm text-purple-700">Service due for 2 vehicles</p>
              </div>
              <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentActivity />
    </div>
  );
}