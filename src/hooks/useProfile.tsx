import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  researcher_code: string | null;
  orcid: string | null;
  country_code: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, researcher_code, orcid, country_code')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    loadProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { profile, loading };
}
