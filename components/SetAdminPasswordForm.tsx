"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export default function SetAdminPasswordForm() {
  const authClientAvailable = "auth" in supabase;
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(authClientAvailable);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(authClientAvailable ? "" : "The website is not connected to Supabase. Add the project URL and publishable key to the website environment, then restart it.");
  const [complete, setComplete] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authClientAvailable) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });

    void supabase.auth.getSession().then((result: { data: { session: Session | null }; error: unknown | null }) => {
      const { data, error } = result;
      if (error) setMessage(error instanceof Error ? error.message : "Could not check the invitation session.");
      setUser(data.session?.user ?? null);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [authClientAvailable]);

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!("auth" in supabase)) return;
    setMessage("");

    if (password.length < 8) {
      setMessage("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const updatedUser = data.user ?? user;
    setUser(updatedUser);
    setIsAdmin(updatedUser?.app_metadata?.role === "admin");
    setComplete(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-5 py-10">
      <section className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">RUWAN STICKER · OWNER ACCESS</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Set your password</h1>

        {checking ? <p className="mt-4 text-sm text-zinc-300">Checking your invitation…</p> : null}

        {!checking && !user ? (
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
            <p>{message || "This invitation link is missing, expired, or already used."}</p>
            {!message ? <p>Ask the project admin to send a new invitation, then open the newest email link.</p> : null}
          </div>
        ) : null}

        {!checking && user && complete ? (
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
            <p className="font-semibold text-emerald-300">Password set for {user.email}.</p>
            {isAdmin ? (
              <p>You can now sign in to the Ruwan Sticker Admin app using this email and password.</p>
            ) : (
              <p>Password is ready, but this account still needs the admin role before the owner app will allow access.</p>
            )}
          </div>
        ) : null}

        {!checking && user && !complete ? (
          <form className="mt-5 space-y-4" onSubmit={savePassword}>
            <p className="text-sm text-zinc-300">Account: <span className="font-medium text-white">{user.email}</span></p>
            <label className="block text-sm text-zinc-300">
              New password
              <input autoComplete="new-password" minLength={8} required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-amber-300" />
            </label>
            <label className="block text-sm text-zinc-300">
              Confirm password
              <input autoComplete="new-password" minLength={8} required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-amber-300" />
            </label>
            {message ? <p className="text-sm text-red-300" role="alert">{message}</p> : null}
            <button disabled={busy} type="submit" className="w-full rounded-xl bg-amber-300 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-200 disabled:opacity-60">
              {busy ? "Saving…" : "Set password"}
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
