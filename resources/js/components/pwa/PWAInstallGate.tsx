import * as React from "react";
import { usePWAInstallPrompt } from "@/hooks/usePWAInstallPrompt";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";

export default function PWAInstallGate() {
  const { open, installNow, remindLater, neverShowAgain } = usePWAInstallPrompt();
  return (
    <PWAInstallPrompt
      open={open}
      onInstall={installNow}
      onRemindLater={remindLater}
      onNever={neverShowAgain}
    />
  );
}
