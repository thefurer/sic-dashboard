import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the caller has admin privileges
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("Reject-user: No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !callerUser) {
      console.log("Reject-user: Invalid token or user not found", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("Reject-user: Checking admin role for user", callerUser.id);

    // Check if the caller is an admin using the user_roles table
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (rolesError) {
      console.log("Reject-user: Error checking roles", rolesError.message);
      return new Response(JSON.stringify({ error: "Error checking permissions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!roles) {
      console.log("Reject-user: User is not an admin", callerUser.id);
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    console.log("Reject-user: Admin verified, proceeding with deletion");

    const { userId } = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    // Prevent admins from deleting themselves
    if (userId === callerUser.id) {
      console.log("Reject-user: Admin attempted to delete themselves");
      return new Response(JSON.stringify({ error: "Cannot delete your own account" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Reject-user: Deleting user", userId);

    // Delete the user from auth.users (this will cascade to profiles)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    console.log("Reject-user: User deleted successfully", userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Reject-user error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
