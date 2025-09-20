// Role-based access control system based on organizational chart

export interface UserRole {
  id: string;
  name: string;
  level: number; // Hierarchy level (0 = Chairman, higher = lower level)
  permissions: string[];
  canAccess: string[]; // Which modules/pages they can access
  canSee: string[]; // Which other roles they can see/manage
}

export const ROLES: Record<string, UserRole> = {
  chairman: {
    id: "chairman",
    name: "Chairman",
    level: 0,
    permissions: ["*"], // Full access to everything
    canAccess: ["*"],
    canSee: ["*"], // Can see all roles
  },
  "financial-advisor": {
    id: "financial-advisor", 
    name: "Financial Advisor",
    level: 1,
    permissions: ["financial.view", "financial.manage", "accountant.oversee"],
    canAccess: [
      "/dashboard",
      "/accountant-oversight", 
      "/financial",
      "/budgets",
      "/treasury",
      "/banks"
    ],
    canSee: ["senior-accountant"],
  },
  "senior-accountant": {
    id: "senior-accountant",
    name: "Senior Accountant", 
    level: 2,
    permissions: ["payments.manage", "financial.view", "treasury.manage", "banks.manage"],
    canAccess: [
      "/dashboard",
      "/payments",
      "/financial", 
      "/treasury",
      "/banks",
      "/expenses"
    ],
    canSee: [],
  },
  "head-of-operations": {
    id: "head-of-operations",
    name: "Head of Operations",
    level: 1,
    permissions: ["operations.manage", "approvals.manage", "staff.oversee"],
    canAccess: [
      "/dashboard",
      "/ea-oversight",
      "/muscat-house",
      "/fleet", 
      "/spv-company",
      "/approvals",
      "/alerts"
    ],
    canSee: [
      "executive-assistant",
      "house-manager-muscat", 
      "fleet-manager",
      "spv-company"
    ],
  },
  "executive-assistant": {
    id: "executive-assistant",
    name: "Executive Assistant",
    level: 2,
    permissions: ["hr.manage", "travel.manage", "calendar.manage"],
    canAccess: [
      "/dashboard",
      "/hr",
      "/office-support",
      "/drivers",
      "/housekeeping", 
      "/travel",
      "/calendar",
      "/leave"
    ],
    canSee: [],
  },
  "house-manager-muscat": {
    id: "house-manager-muscat",
    name: "House Manager (Muscat)",
    level: 2,
    permissions: ["house.manage", "maintenance.manage", "staff.manage"],
    canAccess: [
      "/dashboard",
      "/maintenance",
      "/purchase",
      "/houses",
      "/housekeeping",
      "/drivers",
      "/chef",
      "/expenses"
    ],
    canSee: [],
  },
  "fleet-manager": {
    id: "fleet-manager", 
    name: "Fleet Manager",
    level: 2,
    permissions: ["fleet.manage", "vehicles.manage", "drivers.manage"],
    canAccess: [
      "/dashboard",
      "/cars", 
      "/maintenance",
      "/drivers",
      "/fleet",
      "/expenses"
    ],
    canSee: [],
  },
  "spv-company": {
    id: "spv-company",
    name: "SPV Company Manager",
    level: 2,
    permissions: ["house.manage", "hr.manage", "international.manage"],
    canAccess: [
      "/dashboard",
      "/hr",
      "/housekeeping",
      "/chef",
      "/purchase", 
      "/maintenance",
      "/drivers",
      "/houses",
      "/expenses"
    ],
    canSee: [],
  },
  "racing-team": {
    id: "racing-team",
    name: "Racing Team Manager", 
    level: 2,
    permissions: ["racing.manage", "travel.manage", "payments.racing"],
    canAccess: [
      "/dashboard",
      "/consultant",
      "/service-provider",
      "/travel",
      "/payments",
      "/racing"
    ],
    canSee: [],
  },
};

// Permission checking utilities
export const hasPermission = (userRole: string, permission: string): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;
  
  // Chairman has all permissions
  if (role.permissions.includes("*")) return true;
  
  return role.permissions.includes(permission);
};

export const canAccessModule = (userRole: string, modulePath: string): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;
  
  // Chairman can access everything
  if (role.canAccess.includes("*")) return true;
  
  return role.canAccess.includes(modulePath);
};

export const canSeeRole = (userRole: string, targetRole: string): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;
  
  // Chairman can see everyone
  if (role.canSee.includes("*")) return true;
  
  // Users can always see themselves
  if (userRole === targetRole) return true;
  
  return role.canSee.includes(targetRole);
};

export const getRoleHierarchy = (userRole: string): UserRole[] => {
  const role = ROLES[userRole];
  if (!role) return [];
  
  // Chairman sees everyone
  if (role.id === "chairman") {
    return Object.values(ROLES);
  }
  
  // Others see only roles they can manage + themselves
  const visibleRoles = [role]; // Include self
  role.canSee.forEach(roleId => {
    if (ROLES[roleId]) {
      visibleRoles.push(ROLES[roleId]);
    }
  });
  
  return visibleRoles.sort((a, b) => a.level - b.level);
};

// Get user's accessible navigation items based on role
export const getAccessibleNavigation = (userRole: string, allNavigation: any[]) => {
  return allNavigation.filter(item => canAccessModule(userRole, item.url));
};
