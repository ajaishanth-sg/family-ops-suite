import { ReactNode } from "react";
import { hasPermission, canAccessModule, canSeeRole } from "@/lib/rolePermissions";

interface PermissionGuardProps {
  children: ReactNode;
  userRole: string;
  permission?: string;
  module?: string;
  role?: string;
  fallback?: ReactNode;
}

export function PermissionGuard({ 
  children, 
  userRole, 
  permission, 
  module, 
  role, 
  fallback = null 
}: PermissionGuardProps) {
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  } else if (module) {
    hasAccess = canAccessModule(userRole, module);
  } else if (role) {
    hasAccess = canSeeRole(userRole, role);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook for checking permissions in components
export const usePermissions = (userRole: string) => {
  return {
    hasPermission: (permission: string) => hasPermission(userRole, permission),
    canAccess: (module: string) => canAccessModule(userRole, module),
    canSee: (role: string) => canSeeRole(userRole, role),
  };
};