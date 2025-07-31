import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PlanInfo } from '@/types/database';
import { toast } from 'sonner';

interface UseUserPlanReturn {
  planInfo: PlanInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  upgradePlan: (planType: 'pro' | 'usage', usageCredits?: number) => Promise<boolean>;
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlanInfo(null);
        return;
      }

      const response = await fetch('/api/plan/current');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch plan');
      }

      setPlanInfo(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch plan';
      setError(errorMessage);
      console.error('Error fetching plan:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const upgradePlan = useCallback(async (
    planType: 'pro' | 'usage', 
    usageCredits?: number
  ): Promise<boolean> => {
    try {
      setUpgrading(true);
      setError(null);

      // For development, we fake the MetaMask payment
      const FAKE_METAMASK = true;
      
      let transactionHash = null;
      let paymentAmount = 0;

      if (FAKE_METAMASK) {
        // Simulate MetaMask payment
        transactionHash = 'FAKE_DEV_TX_' + Date.now();
        paymentAmount = planType === 'pro' ? 100 : (usageCredits || 100) * 0.1;
        
        toast.success(`Fake MetaMask payment successful! Plan: ${planType}`);
      } else {
        // Real MetaMask integration would go here
        // This is where you'd integrate with the MetaMask payment flow
        toast.error('Real MetaMask integration not implemented yet');
        return false;
      }

      // Call upgrade API
      const response = await fetch('/api/plan/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: planType,
          usage_credits: usageCredits,
          transaction_hash: transactionHash,
          payment_amount: paymentAmount
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upgrade plan');
      }

      toast.success(result.message || 'Plan upgraded successfully!');
      
      // Refresh plan info
      await fetchPlanInfo();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade plan';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error upgrading plan:', err);
      return false;
    } finally {
      setUpgrading(false);
    }
  }, [fetchPlanInfo]);

  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          fetchPlanInfo();
        } else if (event === 'SIGNED_OUT') {
          setPlanInfo(null);
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchPlanInfo]);

  return {
    planInfo,
    loading,
    error,
    refetch: fetchPlanInfo,
    upgradePlan,
    upgrading
  };
}