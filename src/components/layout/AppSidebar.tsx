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
  hoo: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Approvals", url: "/approvals", icon: FileCheck },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
    { title: "Debit Cards", url: "/cards", icon: CreditCard },
    { title: "Travel Management", url: "/travel", icon: Plane },
    { title: "Fleet Management", url: "/fleet", icon: Car },
    { title: "Checklists", url: "/checklists", icon: CheckSquare },
    { title: "Budgets", url: "/budgets", icon: PieChart },
    { title: "Staff Management", url: "/staff", icon: Users },
    { title: "House Management", url: "/houses", icon: Home },
    { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  ],
  ea: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Staff Management", url: "/staff", icon: Users },
    { title: "Travel Management", url: "/travel", icon: Plane },
    { title: "Checklists", url: "/checklists", icon: CheckSquare },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
  ],
  fa: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Approvals", url: "/approvals", icon: FileCheck },
    { title: "Budgets", url: "/budgets", icon: PieChart },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
    { title: "Staff Management", url: "/staff", icon: Users },
  ],
  accountant: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
    { title: "Approvals", url: "/approvals", icon: FileCheck },
    { title: "Debit Cards", url: "/cards", icon: CreditCard },
  ],
  "muscat-house": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "House Management", url: "/houses", icon: Home },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
    { title: "Staff Management", url: "/staff", icon: Users },
  ],
  fleet: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Fleet Management", url: "/fleet", icon: Car },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
  ],
  "abroad-house": [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "House Management", url: "/houses", icon: Home },
    { title: "Staff Management", url: "/staff", icon: Users },
    { title: "Expenses", url: "/expenses", icon: DollarSign },
  ],
};

const ROLE_LABELS = {
  hoo: "Head of Operations",
  ea: "Executive Assistant",
  fa: "Financial Adviser",
  accountant: "Sr. Accountant",
  "muscat-house": "Muscat House Manager",
  fleet: "Fleet Manager",
  "abroad-house": "Abroad House Manager",
};

export function AppSidebar({ userRole, userEmail, onLogout }: AppSidebarProps) {
  const sidebar = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigation = ROLE_NAVIGATION[userRole as keyof typeof ROLE_NAVIGATION] || ROLE_NAVIGATION.hoo;
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