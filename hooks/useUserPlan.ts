import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlanInfo } from "@/types/database";
import { toast } from "sonner";

interface UseUserPlanReturn {
  planInfo: PlanInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  upgrading: boolean;
}

export function useUserPlan(): UseUserPlanReturn {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPlanInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPlanInfo(null);
        return;
      }

      const response = await fetch("/api/plan/current");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch plan");
      }

      setPlanInfo(result.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch plan";
      setError(errorMessage);
      console.error("Error fetching plan:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  // Subscribe to auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        fetchPlanInfo();
      } else if (event === "SIGNED_OUT") {
        setPlanInfo(null);
        setError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchPlanInfo]);

  // Listen for plan updates from other components
  useEffect(() => {
    const handlePlanUpdate = () => {
      console.log("🔄 Plan updated, refreshing data...");
      fetchPlanInfo();
    };

    window.addEventListener("planUpdated", handlePlanUpdate);

    return () => {
      window.removeEventListener("planUpdated", handlePlanUpdate);
    };
  }, [fetchPlanInfo]);

  return {
    planInfo,
    loading,
    error,
    refetch: fetchPlanInfo,
    upgrading,
  };
}
