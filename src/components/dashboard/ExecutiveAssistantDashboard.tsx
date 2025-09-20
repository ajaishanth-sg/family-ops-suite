import { StatsCard } from "./StatsCard";
import { ApprovalChart } from "./ApprovalChart";
import { RecentActivity } from "./RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plane, Users, CheckSquare } from "lucide-react";

export function ExecutiveAssistantDashboard() {
  const assistantStats = [
    {
      title: "Calendar Events",
      value: "8",
      change: { value: 2, isPositive: true },
      icon: Calendar,
    },
    {
      title: "Travel Bookings", 
      value: "3",
      change: { value: 1, isPositive: true },
      icon: Plane,
    },
    {
      title: "Staff Managed",
      value: "12", 
      change: { value: 0, isPositive: true },
      icon: Users,
    },
    {
      title: "Tasks Completed",
      value: "25",
      change: { value: 7, isPositive: true },
      icon: CheckSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Assistant Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage HR, travel, and chairman's schedule.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {assistantStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Chairman's upcoming appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">Board Meeting</p>
                <p className="text-sm text-blue-700">Tomorrow, 10:00 AM - Main Office</p>
              </div>
              <div className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">Meeting</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <p className="font-medium text-purple-900">Racing Event - Monaco</p>
                <p className="text-sm text-purple-700">Next Week - Monaco</p>
              </div>
              <div className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded">Travel</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-900">Property Inspection</p>
                <p className="text-sm text-green-700">Friday, 2:00 PM - Muscat House</p>
              </div>
              <div className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded">Inspection</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Staff Updates</CardTitle>
            <CardDescription>HR and staffing activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-900">Leave Requests</p>
                <p className="text-sm text-yellow-700">3 pending approvals</p>
              </div>
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-900">Driver Schedule</p>
                <p className="text-sm text-green-700">All shifts covered</p>
              </div>
              <div className="text-sm text-green-600 font-medium">Complete</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">Housekeeping</p>
                <p className="text-sm text-blue-700">Weekly report submitted</p>
              </div>
              <div className="text-sm text-blue-600 font-medium">Updated</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentActivity />
    </div>
  );
}