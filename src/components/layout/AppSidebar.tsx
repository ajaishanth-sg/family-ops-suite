import { 
  LayoutDashboard, 
  FileCheck, 
  CreditCard, 
  Car, 
  Plane, 
  CheckSquare, 
  PieChart, 
  Users, 
  Home,
  DollarSign,
  AlertTriangle,
  Settings,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppSidebarProps {
  userRole: string;
  userEmail: string;
  onLogout: () => void;
}

const ROLE_NAVIGATION = {
  chairman: [
    { title: "Executive Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Financial Overview", url: "/financial", icon: DollarSign },
    { title: "Operations", url: "/operations", icon: Users },
    { title: "Approvals", url: "/approvals", icon: FileCheck },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
    { title: "Debit Cards", url: "/cards", icon: CreditCard },
    { title: "Travel Management", url: "/travel", icon: Plane },
    { title: "Fleet Management", url: "/fleet", icon: Car },
    { title: "House Management", url: "/houses", icon: Home },
    { title: "Staff Management", url: "/staff", icon: Users },
    { title: "Racing Team", url: "/racing", icon: CheckSquare },
    { title: "Budgets", url: "/budgets", icon: PieChart },
    { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  ],
  "financial-advisor": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Senior Accountant", url: "/accountant-oversight", icon: Users },
    { title: "Financial Reports", url: "/financial", icon: DollarSign },
    { title: "Budgets", url: "/budgets", icon: PieChart },
    { title: "Treasury", url: "/treasury", icon: DollarSign },
    { title: "Banks", url: "/banks", icon: CreditCard },
  ],
  "senior-accountant": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Payments", url: "/payments", icon: DollarSign },
    { title: "Financial", url: "/financial", icon: DollarSign },
    { title: "Treasury", url: "/treasury", icon: DollarSign },
    { title: "Banks", url: "/banks", icon: CreditCard },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
  ],
  "head-of-operations": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Executive Assistant", url: "/ea-oversight", icon: Users },
    { title: "House Manager (Muscat)", url: "/muscat-house", icon: Home },
    { title: "Fleet Manager", url: "/fleet", icon: Car },
    { title: "SPV Company", url: "/spv-company", icon: Home },
    { title: "Approvals", url: "/approvals", icon: FileCheck },
    { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  ],
  "executive-assistant": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "HR Management", url: "/hr", icon: Users },
    { title: "Office Support", url: "/office-support", icon: Users },
    { title: "Drivers", url: "/drivers", icon: Car },
    { title: "House Keeping", url: "/housekeeping", icon: Home },
    { title: "Travel Management", url: "/travel", icon: Plane },
    { title: "Chairman's Calendar", url: "/calendar", icon: CheckSquare },
    { title: "Leave Management", url: "/leave", icon: CheckSquare },
  ],
  "house-manager-muscat": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Maintenance", url: "/maintenance", icon: Settings },
    { title: "Purchase", url: "/purchase", icon: DollarSign },
    { title: "House Management", url: "/houses", icon: Home },
    { title: "House Keeping", url: "/housekeeping", icon: Home },
    { title: "Drivers", url: "/drivers", icon: Car },
    { title: "Chef", url: "/chef", icon: Users },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
  ],
  "fleet-manager": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Cars", url: "/cars", icon: Car },
    { title: "Maintenance", url: "/maintenance", icon: Settings },
    { title: "Drivers", url: "/drivers", icon: Car },
    { title: "Fleet Management", url: "/fleet", icon: Car },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
  ],
  "spv-company": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "HR Management", url: "/hr", icon: Users },
    { title: "House Keeping", url: "/housekeeping", icon: Home },
    { title: "Chef", url: "/chef", icon: Users },
    { title: "Purchase", url: "/purchase", icon: DollarSign },
    { title: "Maintenance", url: "/maintenance", icon: Settings },
    { title: "Drivers", url: "/drivers", icon: Car },
    { title: "House Management", url: "/houses", icon: Home },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
  ],
  "racing-team": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Consultant", url: "/consultant", icon: Users },
    { title: "Service Provider", url: "/service-provider", icon: Users },
    { title: "Travel Desk", url: "/travel", icon: Plane },
    { title: "Payment", url: "/payments", icon: DollarSign },
    { title: "Racing Events", url: "/racing", icon: CheckSquare },
  ],
};

const ROLE_LABELS = {
  chairman: "Chairman",
  "financial-advisor": "Financial Advisor", 
  "senior-accountant": "Senior Accountant",
  "head-of-operations": "Head of Operations",
  "executive-assistant": "Executive Assistant",
  "house-manager-muscat": "House Manager (Muscat)",
  "fleet-manager": "Fleet Manager",
  "spv-company": "SPV Company Manager",
  "racing-team": "Racing Team Manager",
};

export function AppSidebar({ userRole, userEmail, onLogout }: AppSidebarProps) {
  const sidebar = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigation = ROLE_NAVIGATION[userRole as keyof typeof ROLE_NAVIGATION] || ROLE_NAVIGATION.chairman;
  const roleLabel = ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] || "User";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-item nav-item-active" : "nav-item nav-item-inactive";

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const isCollapsed = sidebar.state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-accent/20 p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="bg-primary-light rounded-lg p-2">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Family Office</h2>
              <p className="text-xs text-sidebar-foreground/70">ERP System</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50 mb-2">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50 mb-2">
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink to="/settings" className={getNavCls}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-accent/20 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-light text-primary-foreground text-xs">
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {roleLabel}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {userEmail}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="mt-2 w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}