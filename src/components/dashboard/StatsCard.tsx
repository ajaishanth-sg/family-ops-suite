import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({ title, value, change, icon: Icon, iconColor = "text-primary" }: StatsCardProps) {
  return (
    <Card className="dashboard-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="stat-label">{title}</p>
            <p className="stat-value">{value}</p>
            {change && (
              <div className={`stat-change ${change.isPositive ? 'stat-positive' : 'stat-negative'}`}>
                <span>{change.isPositive ? '+' : ''}{change.value}%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-muted ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}