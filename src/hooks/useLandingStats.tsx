import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LandingStats {
  researchers: number;
  publications: number;
  projects: number;
  researchLines: number;
}

export function useLandingStats() {
  return useQuery({
    queryKey: ["landing-stats"],
    queryFn: async (): Promise<LandingStats> => {
      // Fetch all stats in parallel
      const [
        { count: researchersCount },
        { count: publicationsCount },
        { count: projectsCount },
        { data: settingsData }
      ] = await Promise.all([
        // Count approved researchers
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_approved", true),
        
        // Count publications (evaluation items with publication-related categories)
        supabase
          .from("evaluation_items")
          .select("*", { count: "exact", head: true })
          .in("category", ["publicaciones", "publicacion"]),
        
        // Count finished projects
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("status", "Finished"),
        
        // Get research lines from app_settings
        supabase
          .from("app_settings")
          .select("research_lines")
          .single()
      ]);

      // Parse research lines count
      let researchLinesCount = 17; // Default fallback
      if (settingsData?.research_lines) {
        const lines = settingsData.research_lines as string[];
        if (Array.isArray(lines)) {
          researchLinesCount = lines.length;
        }
      }

      return {
        researchers: researchersCount || 0,
        publications: publicationsCount || 0,
        projects: projectsCount || 0,
        researchLines: researchLinesCount
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
