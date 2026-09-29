"use client";

import { createContext, useContext, type ReactNode } from "react";

// What the booking forms need to prefill for a signed-in traveler; nothing secret crosses to the browser
export type SessionUser = { firstName: string; lastName: string; email: string; phone: string; phoneIso: string };

const UserContext = createContext<SessionUser | null>(null);

export function UserProvider({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
