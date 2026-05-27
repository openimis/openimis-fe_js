import { hasRight } from "@openimis/fe-core";

export function canAccessRoute(path, modulesManager, rights) {
  const perm = modulesManager.getRoutePermission(path);
  if (!perm) return false;
  if (Array.isArray(perm.rights)) {
    return perm.rights.some(right => hasRight(right, rights));
  }
  if (perm.right) {
    return hasRight(perm.right, rights);
  }
  return false;
}

export function getRouteIcon(path, modulesManager) {
  const perm = modulesManager.getRoutePermission(path);
  return perm?.icon || null;
}
