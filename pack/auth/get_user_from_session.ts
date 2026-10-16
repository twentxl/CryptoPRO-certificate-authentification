import type { Certificate, User } from "../shared/types/models";
import { parseDnToUser } from "../shared/lib/parseDn";

const API_URL = "http://192.168.76.96:5024"; // сменить после релиза

export type SessionData = {
  user: User;
  isValid: boolean;
  validToDate?: string;
};

export async function getUserFromSession(): Promise<SessionData | null> {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  const r = await fetch(`${API_URL}/Auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (r.status === 401) {
    localStorage.removeItem("accessToken");
    return null;
  }

  if (!r.ok) return null;

  const cert = (await r.json()) as Certificate;
  const parsed = parseDnToUser(cert.subjectName);

  return {
    user: {
      ...(parsed ?? {}),
      serialNumber: cert.serialNumber,
      validFrom: cert.validFromDate,
      validTo: cert.validToDate,
    },
    isValid: !!cert.isValid,
    validToDate: cert.validToDate,
  };
}