import { useQuery } from "@tanstack/react-query";

interface DashboardMetrics {
  activeProjects: number;
  articlesIndexed: number;
  totalBeneficiaries: number;
  pendingApprovals: number;
  productionOverTime: Array<{
    month: string;
    articles: number;
    books: number;
    conferences: number;
  }>;
  projectsByType: Array<{
    type: string;
    count: number;
  }>;
  totalImpactScore: number;
  impactTrend: number;
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      // Placeholder for future Supabase integration
      // This will be replaced with actual database queries
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      return {
        activeProjects: 0,
        articlesIndexed: 0,
        totalBeneficiaries: 0,
        pendingApprovals: 0,
        productionOverTime: [],
        projectsByType: [],
        totalImpactScore: 0,
        impactTrend: 0,
      };
    },
    enabled: false, // Keep disabled for now to show loading state
  });
}
