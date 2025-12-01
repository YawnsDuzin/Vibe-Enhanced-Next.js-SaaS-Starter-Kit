import { Role, TeamRole } from '@prisma/client';

// Define permissions for each action
export const permissions = {
  // User management
  'users:read': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'users:create': ['ADMIN', 'SUPER_ADMIN'],
  'users:update': ['ADMIN', 'SUPER_ADMIN'],
  'users:delete': ['SUPER_ADMIN'],

  // Team management
  'teams:read': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'teams:create': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'teams:update': ['ADMIN', 'SUPER_ADMIN'],
  'teams:delete': ['SUPER_ADMIN'],

  // Billing
  'billing:read': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'billing:manage': ['ADMIN', 'SUPER_ADMIN'],

  // Prompts
  'prompts:read': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'prompts:create': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'prompts:update': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'prompts:delete': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'prompts:publish': ['ADMIN', 'SUPER_ADMIN'],

  // System prompts
  'system-prompts:create': ['SUPER_ADMIN'],
  'system-prompts:update': ['SUPER_ADMIN'],
  'system-prompts:delete': ['SUPER_ADMIN'],

  // Admin
  'admin:access': ['ADMIN', 'SUPER_ADMIN'],
  'admin:manage-users': ['SUPER_ADMIN'],
  'admin:manage-settings': ['SUPER_ADMIN'],

  // API Keys
  'api-keys:read': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'api-keys:create': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'api-keys:delete': ['USER', 'ADMIN', 'SUPER_ADMIN'],

  // Analytics
  'analytics:read': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'analytics:export': ['ADMIN', 'SUPER_ADMIN'],
} as const;

export type Permission = keyof typeof permissions;

// Team role permissions
export const teamPermissions = {
  'team:read': ['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'],
  'team:invite': ['ADMIN', 'OWNER'],
  'team:remove-member': ['ADMIN', 'OWNER'],
  'team:update': ['ADMIN', 'OWNER'],
  'team:delete': ['OWNER'],
  'team:manage-billing': ['OWNER'],
  'team:prompts:create': ['MEMBER', 'ADMIN', 'OWNER'],
  'team:prompts:update': ['MEMBER', 'ADMIN', 'OWNER'],
  'team:prompts:delete': ['ADMIN', 'OWNER'],
} as const;

export type TeamPermission = keyof typeof teamPermissions;

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = permissions[permission];
  return allowedRoles?.includes(role) ?? false;
}

/**
 * Check if a team role has a specific team permission
 */
export function hasTeamPermission(
  teamRole: TeamRole,
  permission: TeamPermission
): boolean {
  const allowedRoles = teamPermissions[permission];
  return allowedRoles?.includes(teamRole) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return Object.entries(permissions)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission as Permission);
}

/**
 * Get all team permissions for a team role
 */
export function getTeamRolePermissions(teamRole: TeamRole): TeamPermission[] {
  return Object.entries(teamPermissions)
    .filter(([_, roles]) => roles.includes(teamRole))
    .map(([permission]) => permission as TeamPermission);
}

/**
 * Higher-order function to check permission in API routes
 */
export function requirePermission(permission: Permission) {
  return function (role: Role): boolean {
    return hasPermission(role, permission);
  };
}

/**
 * Check multiple permissions (AND logic)
 */
export function hasAllPermissions(role: Role, perms: Permission[]): boolean {
  return perms.every((permission) => hasPermission(role, permission));
}

/**
 * Check multiple permissions (OR logic)
 */
export function hasAnyPermission(role: Role, perms: Permission[]): boolean {
  return perms.some((permission) => hasPermission(role, permission));
}

/**
 * Role hierarchy for comparison
 */
const roleHierarchy: Record<Role, number> = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

const teamRoleHierarchy: Record<TeamRole, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

/**
 * Check if role1 is higher than or equal to role2
 */
export function isRoleAtLeast(role1: Role, role2: Role): boolean {
  return roleHierarchy[role1] >= roleHierarchy[role2];
}

/**
 * Check if teamRole1 is higher than or equal to teamRole2
 */
export function isTeamRoleAtLeast(
  teamRole1: TeamRole,
  teamRole2: TeamRole
): boolean {
  return teamRoleHierarchy[teamRole1] >= teamRoleHierarchy[teamRole2];
}
