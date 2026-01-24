import { supabase } from "@/integrations/supabase/client";

export interface EmailData {
  activityName?: string;
  planName?: string;
  deadline?: string;
  observations?: string;
  evaluationYear?: number;
  correctionDeadline?: string;
  daysRemaining?: number;
  score?: number;
}

export type EmailType = 
  | "activity_assigned" 
  | "activity_deadline_warning" 
  | "activity_correction" 
  | "evaluation_submitted" 
  | "evaluation_correction" 
  | "evaluation_approved"
  | "user_approved";

interface SendEmailParams {
  type: EmailType;
  to: string;
  userName: string;
  data?: EmailData;
}

export async function sendNotificationEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: params,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully:", data);
    return { success: true };
  } catch (error: any) {
    console.error("Error invoking send-email function:", error);
    return { success: false, error: error.message };
  }
}

// Helper to get user email from profile_contacts
export async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profile_contacts")
    .select("email")
    .eq("user_id", userId)
    .single();

  if (error || !data?.email) {
    console.warn(`No email found for user ${userId}`);
    return null;
  }

  return data.email;
}

// Helper to get user name from profiles
export async function getUserName(userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  return data?.full_name || "Usuario";
}
