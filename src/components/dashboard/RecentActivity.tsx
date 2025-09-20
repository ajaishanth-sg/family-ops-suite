import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, FileCheck, CreditCard } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "expense",
    title: "Office supplies expense",
    amount: "OMR 125.50",
    status: "pending",
    time: "2 minutes ago",
    icon: DollarSign,
  },
  {
    id: 2,
    type: "approval",
    title: "Travel request approved",
    amount: "OMR 2,500.00",
    status: "approved",
    time: "15 minutes ago",
    icon: FileCheck,
  },
  {
    id: 3,
    type: "card",
    title: "Debit card low balance alert",
    amount: "OMR 45.00 remaining",
    status: "urgent",
    time: "1 hour ago",
    icon: CreditCard,
  },
  {
    id: 4,
    type: "expense",
    title: "Fuel expense - Fleet vehicle",
    amount: "OMR 85.75",
    status: "approved",
    time: "3 hours ago",
    icon: DollarSign,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="status-approved">Approved</Badge>;
    case "pending":
      return <Badge className="status-pending">Pending</Badge>;
    case "urgent":
      return <Badge className="status-rejected">Urgent</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function RecentActivity() {
  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-full bg-muted">
                <activity.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-primary">{activity.amount}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              </div>
              <div>
                {getStatusBadge(activity.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}