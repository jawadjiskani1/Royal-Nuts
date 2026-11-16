/** Turns an authentication error into a message a customer can act on. */
export function friendlyAuthError(e: unknown): string {
  const code = typeof e === "object" && e !== null && "code" in e && typeof e.code === "string" ? e.code : "";
  const message = e instanceof Error ? e.message.toLowerCase() : "";
  switch (code || message) {
    case "email_address_invalid":
    case "invalid email":
      return "That email address doesn't look right.";
    case "invalid_credentials":
    case "invalid login credentials":
      return "Incorrect email or password.";
    case "email_not_confirmed":
      return "Confirm your email using the link we sent you before signing in.";
    case "otp_expired":
    case "flow_state_not_found":
    case "flow_state_expired":
      return "This link has expired. Request a new email and open it in the same browser.";
    case "signup_disabled":
      return "New accounts are temporarily unavailable. Please contact the store.";
    case "user_already_exists":
      return "An account with this email already exists. Sign in instead.";
    case "weak_password":
      return "Choose a stronger password with at least 8 characters.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Wait a few minutes, then try again.";
    case "fetch failed":
      return "Network problem. Check your connection and try again.";
    case "provider_disabled":
      return "Google sign-in is currently unavailable. Please sign in with your email.";
    case "app/not-configured":
      return "Accounts are temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(next: string | undefined | null, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || /[\\\u0000-\u0020]/.test(next)) return fallback;
  try {
    const base = new URL("https://royal-nuts.invalid");
    const target = new URL(next, base);
    return target.origin === base.origin ? target.pathname + target.search + target.hash : fallback;
  } catch { return fallback; }
}
