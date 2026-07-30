/**
 * Parse application permissions/roles definition from API or DB.
 * Handles JSON strings and legacy { roles: [] } format.
 */
export function parsePermissionsDefinition(data) {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return { permissions: [], categories: [] };
    }
  }

  const categories = Array.isArray(data?.categories) ? data.categories : [];

  if (Array.isArray(data?.permissions)) {
    return { permissions: data.permissions, categories };
  }
  if (Array.isArray(data?.roles)) {
    return { permissions: data.roles, categories };
  }
  return { permissions: [], categories: [] };
}
