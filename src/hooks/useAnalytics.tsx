import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Generate a simple session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Prevent duplicate tracking of same path
    if (lastTrackedPath.current === location.pathname) {
      return;
    }
    
    lastTrackedPath.current = location.pathname;

    const trackPageView = async () => {
      try {
        await supabase.from("site_analytics").insert({
          page_path: location.pathname,
          page_title: document.title,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: getSessionId(),
        });
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug("Analytics tracking failed:", error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};

export default useAnalytics;
