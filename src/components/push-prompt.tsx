"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { savePushSubscription } from "@/actions/push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushPrompt() {
  const [show, setShow] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Check if push is supported
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    // Check if we already asked
    const hasPrompted = localStorage.getItem("push_prompted");
    if (hasPrompted === "true") return;

    // Check if already subscribed or denied
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return;
    }

    // Show after a short delay
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // Convert to standard JSON object to pass to server action
        const subJson = JSON.parse(JSON.stringify(subscription));

        const res = await savePushSubscription(subJson);
        
        if (res.success) {
          toast.success("Successfully enabled push notifications!");
          setShow(false);
          localStorage.setItem("push_prompted", "true");
        } else {
          toast.error("Failed to save subscription.");
        }
      } else {
        setShow(false);
        localStorage.setItem("push_prompted", "true");
        toast.info("Notification permissions were denied.");
      }
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast.error("An error occurred while enabling notifications.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("push_prompted", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed top-20 left-4 right-4 md:right-auto md:left-6 md:w-96 bg-white rounded-2xl shadow-xl border border-charcoal/10 p-4 z-50 animate-in slide-in-from-top-5">
      {/* Arrow pointing up */}
      <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-t border-l border-charcoal/10 rotate-45" />
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-charcoal">Get Order Updates</h3>
          <p className="text-sm text-slate mt-1">Enable notifications to get instant updates on your order status and exclusive offers.</p>
          <div className="flex items-center gap-3 mt-4">
            <button 
              onClick={handleSubscribe} 
              disabled={isSubscribing}
              className="px-4 py-2 bg-charcoal hover:bg-charcoal-light text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-70"
            >
              {isSubscribing ? "Enabling..." : "Enable"}
            </button>
            <button 
              onClick={handleDismiss} 
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-charcoal text-sm font-semibold rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-slate hover:text-charcoal shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
