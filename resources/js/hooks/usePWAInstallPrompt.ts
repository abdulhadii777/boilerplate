import { useCallback, useEffect, useRef, useState } from "react";
import { getCookie, setCookie } from "@/utils/cookies";
import { usePage } from "@inertiajs/react";

type InstallState = "idle" | "eligible" | "prompting" | "installed" | "blocked";

const CK_NEVER = "pwa.install.never";   // "1" => never show again (long-lived)
const CK_SNOOZE = "pwa.install.snooze"; // presence => snoozed for this session

function isStandalone(): boolean {
  // @ts-ignore (iOS Safari)
  const navStandalone = window.navigator.standalone === true;
  const mqStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  return navStandalone || mqStandalone;
}

export function usePWAInstallPrompt() {
  const { props } = usePage();
  const pwaProps = (props as any).pwa || { blocked: false, snoozed: false };
  
  const deferredPromptRef = useRef<any | null>(null);
  const [state, setState] = useState<InstallState>("idle");
  const [open, setOpen] = useState(false);

  const recompute = useCallback(() => {
    if (isStandalone()) {
      setState("installed");
      setOpen(false);
      return;
    }
    
    // Check server-side props first
    if (pwaProps.blocked) {
      setState("blocked");
      setOpen(false);
      return;
    }
    
    if (pwaProps.snoozed) {
      setOpen(false); // session-snoozed
      return;
    }
    
    // Fallback to client-side cookies
    if (getCookie(CK_NEVER) === "1") {
      setState("blocked");
      setOpen(false);
      return;
    }
    if (getCookie(CK_SNOOZE) === "1") {
      setOpen(false); // session-snoozed
      return;
    }
    
    setOpen(!!deferredPromptRef.current);
  }, [pwaProps.blocked, pwaProps.snoozed]);

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as any; // BeforeInstallPromptEvent
      setState("eligible");
      setOpen(true);
    };
    const onInstalled = () => {
      setState("installed");
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBIP as any);
    window.addEventListener("appinstalled", onInstalled);
    
    // Initial recompute
    recompute();
    
    // Check for PWA eligibility after a short delay
    const timer = setTimeout(() => {
      if (!isStandalone() && !pwaProps.blocked && !pwaProps.snoozed && !deferredPromptRef.current) {
        // If no beforeinstallprompt event fired, we can still show a custom prompt
        // This helps with cases where the browser doesn't automatically trigger the event
        setState("eligible");
        setOpen(true);
      }
    }, 2000); // 2 second delay

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP as any);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(timer);
    };
  }, [recompute, pwaProps.blocked, pwaProps.snoozed]);

  const installNow = useCallback(async () => {
    if (deferredPromptRef.current) {
      // Use native browser prompt
      setState("prompting");
      const dp = deferredPromptRef.current;
      deferredPromptRef.current = null;

      const { outcome } = await dp.prompt(); // "accepted" | "dismissed"
      if (outcome === "accepted") {
        setOpen(false);
      } else {
        setCookie(CK_SNOOZE, "1"); // session cookie
        setOpen(false);
      }
    } else {
      // Fallback: Show instructions for manual installation
      // This handles cases where the browser doesn't support beforeinstallprompt
      setOpen(false);
      // You could show a modal with installation instructions here
      console.log("Manual installation required - show instructions");
    }
  }, []);

  const remindLater = useCallback(() => {
    setCookie(CK_SNOOZE, "1"); // session cookie
    setOpen(false);
  }, []);

  const neverShowAgain = useCallback(() => {
    setCookie(CK_NEVER, "1", { days: 730 }); // ~2 years
    setOpen(false);
    setState("blocked");
  }, []);

  return { open, installNow, remindLater, neverShowAgain };
}
