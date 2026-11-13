"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

function subscribeToHashChange(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHash() {
  return window.location.hash;
}

export default function AuthInviteHandler() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const hash = useSyncExternalStore(subscribeToHashChange, getHash, () => "");
  const params = new URLSearchParams(hash.slice(1));
  const errorCode = params.get("error_code");
  const errorDescription = params.get("error_description");
  const inviteType = params.get("type") === "invite";
  const hashErrorMessage = errorCode
    ? errorCode === "otp_expired"
      ? "This invitation link has expired or was already used. Ask the project admin to send a new invitation, then open the newest email link."
      : errorDescription || "This sign-in link could not be verified. Request a new invitation."
    : "";
  const configMessage = inviteType && !("auth" in supabase)
    ? "The website is not connected to this Supabase project yet. Configure its public project URL and publishable key first."
    : "";

  useEffect(() => {
    if (errorCode || !inviteType || !("auth" in supabase)) return;

    let redirected = false;
    const openPasswordSetup = (hasSession: boolean) => {
      if (hasSession && !redirected) {
        redirected = true;
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        router.replace("/auth/update-password");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      openPasswordSetup(Boolean(session));
    });

    void supabase.auth.getSession().then((result: { data: { session: Session | null }; error: unknown | null }) => {
      const { data, error } = result;
      if (error) setMessage("Could not verify the invitation. Ask the project admin to send a new one.");
      else if (data.session) openPasswordSetup(true);
      else setMessage("Checking invitation link…");
    });

    return () => subscription.unsubscribe();
  }, [errorCode, inviteType, router]);

  const visibleMessage = hashErrorMessage || configMessage || message;
  if (!visibleMessage) return null;

  return (
    <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-2xl rounded-xl border border-amber-300/30 bg-zinc-900 px-5 py-4 text-sm text-zinc-100 shadow-2xl" role="status">
      <p>{visibleMessage}</p>
      <a className="mt-2 inline-block font-semibold text-amber-300 underline underline-offset-4" href="/auth/update-password">
        Continue to password setup
      </a>
    </div>
  );
}
