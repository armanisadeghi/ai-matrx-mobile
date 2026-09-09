/**
 * AI Matrx Mobile - Identity
 *
 * A SYNCHRONOUS read of "who is signed in". `@ai-matrx/agents/catalog` needs
 * `identity.requireUserId()` to answer without awaiting (it is called during
 * render), while Supabase's own session read is async — so the current user id
 * is mirrored here from the ONE `onAuthStateChange` subscription the app
 * already runs, and read back synchronously.
 *
 * `requireUserId()` THROWS when nobody is signed in. That is deliberate and it
 * is what the package expects: a signed-out visitor is a real state the
 * catalog handles (it lands on the public catalogue), never a silent anonymous
 * read pretending to be someone.
 */

import { supabase } from './supabase';

let currentUserId: string | null = null;

/** Start mirroring the session. Idempotent; call once at app start. */
let started = false;
export function startIdentityMirror(): void {
  if (started) return;
  started = true;
  void supabase.auth.getSession().then(({ data: { session } }) => {
    currentUserId = session?.user?.id ?? null;
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUserId = session?.user?.id ?? null;
  });
}

/** The signed-in user id, or `null`. */
export function getUserIdOrNull(): string | null {
  return currentUserId;
}

/** The signed-in user id. Throws when there is no session. */
export function requireUserId(): string {
  if (!currentUserId) {
    throw new Error('No signed-in user: sign in before reading agent data.');
  }
  return currentUserId;
}
