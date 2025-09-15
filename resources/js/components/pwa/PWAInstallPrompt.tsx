import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onInstall: () => void;
  onRemindLater: () => void;
  onNever: () => void;
};

export default function PWAInstallPrompt({ open, onInstall, onRemindLater, onNever }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install this app</DialogTitle>
          <DialogDescription>
            Add to your home screen for fast access and a native-like experience.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-2 sm:flex sm:justify-end">
          <Button variant="secondary" onClick={onRemindLater}>Remind me later</Button>
          <Button variant="destructive" onClick={onNever}>Don’t show again</Button>
          <Button onClick={onInstall}>Install</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
