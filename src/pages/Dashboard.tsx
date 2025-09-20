import { StatsCard } from "@/components/dashboard/StatsCard";
import { ApprovalChart } from "@/components/dashboard/ApprovalChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { 
  DollarSign, 
  FileCheck, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  Car,
  Home
} from "lucide-react";

interface DashboardProps {
  userRole: string;
}

const ROLE_STATS = {
  hoo: [
    { title: "Pending Approvals", value: "24", change: { value: -8, isPositive: false }, icon: FileCheck },
    { title: "Monthly Expenses", value: "OMR 45,230", change: { value: 12, isPositive: true }, icon: DollarSign },
    { title: "Debit Card Alerts", value: "3", change: { value: 0, isPositive: true }, icon: AlertTriangle },
    { title: "Response Rate", value: "94%", change: { value: 3, isPositive: true }, icon: TrendingUp },
  ],
  ea: [
    { title: "Active Staff", value: "32", change: { value: 2, isPositive: true }, icon: Users },
    { title: "Pending Tasks", value: "8", change: { value: -12, isPositive: false }, icon: FileCheck },
    { title: "Travel Bookings", value: "15", change: { value: 25, isPositive: true }, icon: TrendingUp },
    { title: "This Month Expenses", value: "OMR 12,450", change: { value: 8, isPositive: true }, icon: DollarSign },
  ],
  fa: [
    { title: "Pending Approvals", value: "12", change: { value: -15, isPositive: false }, icon: FileCheck },
    { title: "Budget Utilization", value: "78%", change: { value: 5, isPositive: true }, icon: TrendingUp },
    { title: "Investment Value", value: "OMR 2.4M", change: { value: 12, isPositive: true }, icon: DollarSign },
    { title: "Monthly ROI", value: "8.2%", change: { value: 1.5, isPositive: true }, icon: TrendingUp },
  ],
  accountant: [
    { title: "Payables", value: "OMR 34,560", change: { value: -8, isPositive: false }, icon: DollarSign },
    { title: "Receivables", value: "OMR 18,900", change: { value: 15, isPositive: true }, icon: DollarSign },
    { title: "Pending Payments", value: "18", change: { value: -22, isPositive: false }, icon: FileCheck },
    { title: "Card Balances", value: "OMR 8,450", change: { value: -12, isPositive: false }, icon: CreditCard },
  ],
  "muscat-house": [
    { title: "House Staff", value: "8", change: { value: 0, isPositive: true }, icon: Users },
    { title: "Monthly Expenses", value: "OMR 6,780", change: { value: 12, isPositive: true }, icon: DollarSign },
    { title: "Maintenance Tasks", value: "5", change: { value: -28, isPositive: false }, icon: Home },
    { title: "Grocery Budget", value: "OMR 1,200", change: { value: -5, isPositive: false }, icon: DollarSign },
  ],
  fleet: [
    { title: "Active Vehicles", value: "12", change: { value: 0, isPositive: true }, icon: Car },
    { title: "Maintenance Due", value: "3", change: { value: -25, isPositive: false }, icon: AlertTriangle },
    { title: "Fuel Expenses", value: "OMR 4,560", change: { value: 18, isPositive: true }, icon: DollarSign },
    { title: "Driver Availability", value: "85%", change: { value: 8, isPositive: true }, icon: Users },
  ],
  "abroad-house": [
    { title: "House Staff", value: "12", change: { value: 8, isPositive: true }, icon: Users },
    { title: "Monthly Expenses", value: "USD 8,940", change: { value: 5, isPositive: true }, icon: DollarSign },
    { title: "SPV Transfers", value: "USD 15,000", change: { value: 0, isPositive: true }, icon: TrendingUp },
    { title: "Pending Approvals", value: "6", change: { value: -33, isPositive: false }, icon: FileCheck },
  ],
};

export function Dashboard({ userRole }: DashboardProps) {
  const stats = ROLE_STATS[userRole as keyof typeof ROLE_STATS] || ROLE_STATS.hoo;

  const getRoleTitle = (role: string) => {
    const titles = {
      hoo: "Head of Operations Dashboard",
      ea: "Executive Assistant Dashboard", 
      fa: "Financial Adviser Dashboard",
      accountant: "Sr. Accountant Dashboard",
      "muscat-house": "Muscat House Manager Dashboard",
      fleet: "Fleet Manager Dashboard",
      "abroad-house": "Abroad House Manager Dashboard",
    };
    return titles[role as keyof typeof titles] || "Dashboard";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{getRoleTitle(userRole)}</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening in your domain.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApprovalChart />
        <RecentActivity />
      </div>

      {/* Additional role-specific content */}
      {userRole === "hoo" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dashboard-card">
            <h3 className="font-semibold mb-4">Critical Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-danger/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <div>
                  <p className="text-sm font-medium">Debit Card Low Balance</p>
                  <p className="text-xs text-muted-foreground">Card ending in 4532</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                <FileCheck className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium">Approval Overdue</p>
                  <p className="text-xs text-muted-foreground">Travel request - 2 days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full p-3 text-left rounded-lg hover:bg-muted transition-colors">
                <p className="text-sm font-medium">Review Pending Approvals</p>
                <p className="text-xs text-muted-foreground">24 items waiting</p>
              </button>
              <button className="w-full p-3 text-left rounded-lg hover:bg-muted transition-colors">
                <p className="text-sm font-medium">Check Budget Status</p>  
                <p className="text-xs text-muted-foreground">Monthly review</p>
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Email Parsing</span>
                <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto-Approvals</span>
                <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">Running</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Alert System</span>
                <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">Online</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}