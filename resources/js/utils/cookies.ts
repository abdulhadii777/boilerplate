export type CookieOptions = {
    days?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "Lax" | "Strict" | "None";
  };
  
  export function setCookie(name: string, value: string, opts: CookieOptions = {}) {
    const {
      days,
      path = "/",
      domain,
      secure = location.protocol === "https:",
      sameSite = "Lax",
    } = opts;
  
    const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    if (days !== undefined) {
      const d = new Date();
      d.setTime(d.getTime() + days * 864e5);
      parts.push(`Expires=${d.toUTCString()}`);
    }
    if (path) parts.push(`Path=${path}`);
    if (domain) parts.push(`Domain=${domain}`);
    if (secure) parts.push("Secure");
    parts.push(`SameSite=${sameSite}`);
    document.cookie = parts.join("; ");
  }
  
  export function getCookie(name: string): string | null {
    const n = `${encodeURIComponent(name)}=`;
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(n))
      ?.slice(n.length) ?? null;
  }
  