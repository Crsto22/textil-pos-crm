export interface CrmSession {
  email: string;
  name: string;
  createdAt: string;
}

export const CRM_SESSION_KEY = "textil-crm.session.v1";

const formatNameFromEmail = (email: string) => {
  const rawName = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();

  if (!rawName) {
    return "Usuario CRM";
  }

  return rawName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export function getStoredSession(): CrmSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(CRM_SESSION_KEY);
    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession) as Partial<CrmSession>;
    if (!parsedSession.email || !parsedSession.name || !parsedSession.createdAt) {
      return null;
    }

    return {
      email: parsedSession.email,
      name: parsedSession.name,
      createdAt: parsedSession.createdAt,
    };
  } catch {
    return null;
  }
}

export function saveSession(email: string): CrmSession {
  const session: CrmSession = {
    email,
    name: formatNameFromEmail(email),
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(CRM_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CRM_SESSION_KEY);
  }
}
