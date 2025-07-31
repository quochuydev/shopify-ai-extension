export interface UserPlan {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro' | 'usage';
  usage_credits: number | null;
  created_at: string;
  updated_at: string;
}

export interface AIRequest {
  id: string;
  user_id: string;
  endpoint: string;
  generated_content: any; // JSON content
  created_at: string;
}

export interface PlanInfo {
  plan_type: 'free' | 'pro' | 'usage';
  usage_credits: number | null;
  total_requests: number;
  requests_this_month: number;
  plan_status: 'active' | 'expired' | 'trial';
  recent_requests: AIRequest[];
}