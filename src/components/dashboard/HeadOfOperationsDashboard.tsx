import { StatsCard } from "./StatsCard";
import { ApprovalChart } from "./ApprovalChart";
import { RecentActivity } from "./RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function HeadOfOperationsDashboard() {
  const operationsStats = [
    {
      title: "Team Members",
      value: "18",
      change: { value: 1, isPositive: true },
      icon: Users,
    },
    {
      title: "Pending Approvals", 
      value: "12",
      change: { value: 3, isPositive: false },
      icon: AlertTriangle,
    },
    {
      title: "Completed Tasks",
      value: "45", 
      change: { value: 8, isPositive: true },
      icon: CheckCircle,
    },
    {
      title: "Response Time",
      value: "2.4h",
      change: { value: 0.3, isPositive: false },
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage operations teams and approve requests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {operationsStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ApprovalChart />
        <Card>
          <CardHeader>
            <CardTitle>Team Status</CardTitle>
            <CardDescription>Current status of your teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-900">Executive Assistant</p>
                <p className="text-sm text-green-700">All tasks on schedule</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">House Manager (Muscat)</p>
                <p className="text-sm text-blue-700">2 maintenance requests</p>
              </div>
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <p className="font-medium text-purple-900">Fleet Manager</p>
                <p className="text-sm text-purple-700">Service scheduled</p>
              </div>
              <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <p className="font-medium text-orange-900">SPV Company</p>
                <p className="text-sm text-orange-700">Monthly report due</p>
              </div>
              <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentActivity />
    </div>
  );
}