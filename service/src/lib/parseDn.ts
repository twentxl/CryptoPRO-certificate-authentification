import type { User } from "../types/models";

export function parseDnToUser(dn?: string): User | undefined {
  if (!dn) return undefined;

  const map: Record<string, string> = {};

  dn.split(",")
    .map(x => x.trim())
    .filter(Boolean)
    .forEach(part => {
      const eq = part.indexOf("=");
      if (eq === -1) return;
      const key = part.slice(0, eq).trim().toUpperCase();
      const value = part.slice(eq + 1).trim();
      map[key] = value;
    });

  return {
    country: map["C"],
    region: map["L"],
    org: map["O"],
    userName: map["CN"],
    userEmail: map["E"] ?? map["EMAILADDRESS"],
  };
}