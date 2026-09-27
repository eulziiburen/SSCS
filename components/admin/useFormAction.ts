"use client";

import { useActionState } from "react";

type State = { error: string; values: Record<string, string> } | null;

/**
 * useActionState for admin forms that echo submitted values back on a validation error.
 * React's post-action form reset restores <select>s to the options selected at first render,
 * so the returned `key` changes on every failed attempt: put it on the <form> to remount it
 * with the echoed values as fresh defaults.
 */
export function useFormAction(action: (prev: State, fd: FormData) => Promise<State>) {
  const [state, run] = useActionState(async (prev: (State & { n: number }) | null, fd: FormData) => {
    const next = await action(prev, fd);
    return next && { ...next, n: (prev?.n ?? 0) + 1 };
  }, null);
  return { state, action: run, key: state?.n ?? 0 };
}
