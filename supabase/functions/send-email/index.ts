import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

interface EmailRequest {
  type: 
    | "activity_assigned" 
    | "activity_deadline_warning" 
    | "activity_correction" 
    | "admin_alert"
    | "evaluation_submitted" 
    | "evaluation_correction" 
    | "evaluation_approved"
    | "user_approved"
    | "check_deadlines";
  to?: string;
  userName?: string;
  data?: {
    activityName?: string;
    planName?: string;
    deadline?: string;
    observations?: string;
    evaluationYear?: number;
    correctionDeadline?: string;
    daysRemaining?: number;
    score?: number;
  };
}

const APP_URL = "https://gisicf.lovable.app";
const FROM_EMAIL = "GISICF <sistema@gisicf.com>";

function getEmailContent(type: string, userName: string, data: EmailRequest["data"]): { subject: string; html: string } {
  const styles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
      .footer { background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
      .button { display: inline-block; background: #3b82f6; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
      .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
      .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
      .info-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 15px 0; }
      h1 { margin: 0; font-size: 24px; }
      .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    </style>
  `;

  switch (type) {
    case "activity_assigned":
      return {
        subject: `Nueva actividad asignada: ${data?.activityName || "Sin nombre"}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${styles}</head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">GISICF</div>
                <h1>📋 Nueva Actividad Asignada</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${userName}</strong>,</p>
                <p>Se te ha asignado una nueva actividad en el sistema de planificación:</p>
                <div class="info-box">
                  <p><strong>📌 Actividad:</strong> ${data?.activityName}</p>
                  <p><strong>📁 Plan:</strong> ${data?.planName || "No especificado"}</p>
                  <p><strong>📅 Fecha límite:</strong> ${data?.deadline || "No especificada"}</p>
                </div>
                <p>Por favor, ingresa al sistema para ver los detalles y completar la actividad antes de la fecha límite.</p>
                <center>
                  <a href="${APP_URL}/my-tasks" class="button">Ver Mis Tareas</a>
                </center>
              </div>
              <div class="footer">
                <p>Sistema de Gestión de Investigación Científica</p>
                <p>Universidad Estatal del Sur de Manabí</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "activity_deadline_warning":
      const urgencyColor = (data?.daysRemaining || 7) <= 1 ? "#ef4444" : (data?.daysRemaining || 7) <= 3 ? "#f59e0b" : "#3b82f6";
      return {
        subject: `⚠️ Recordatorio: Tu actividad vence en ${data?.daysRemaining} día(s)`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${styles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}cc 100%);">
                <div class="logo">GISICF</div>
                <h1>⏰ Recordatorio de Vencimiento</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${userName}</strong>,</p>
                <div class="alert">
                  <strong>¡Atención!</strong> Tu actividad vence en <strong>${data?.daysRemaining} día(s)</strong>.
                </div>
                <div class="info-box">
                  <p><strong>📌 Actividad:</strong> ${data?.activityName}</p>
                  <p><strong>📅 Fecha límite:</strong> ${data?.deadline}</p>
                </div>
                <p>Te recomendamos completar esta actividad lo antes posible para evitar retrasos.</p>
                <center>
                  <a href="${APP_URL}/my-tasks" class="button">Completar Ahora</a>
                </center>
              </div>
              <div class="footer">
                <p>Sistema de Gestión de Investigación Científica</p>
                <p>Universidad Estatal del Sur de Manabí</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "activity_correction":
      return {
        subject: `🔄 Corrección requerida en tu actividad`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${styles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);">
                <div class="logo">GISICF</div>
                <h1>🔄 Corrección Requerida</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${userName}</strong>,</p>
                <p>El administrador ha revisado tu actividad y requiere algunas correcciones:</p>
                <div class="alert">
                  <strong>Observaciones:</strong><br>
                  ${data?.observations || "Sin observaciones específicas"}
                </div>
                ${data?.correctionDeadline ? `<p><strong>📅 Fecha límite para corrección:</strong> ${data.correctionDeadline}</p>` : ""}
                <p>Por favor, realiza las correcciones necesarias lo antes posible.</p>
                <center>
                  <a href="${APP_URL}/my-tasks" class="button">Ver Actividad</a>
                </center>
              </div>
              <div class="footer">
                <p>Sistema de Gestión de Investigación Científica</p>
                <p>Universidad Estatal del Sur de Manabí</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "admin_alert":
      return {
        subject: `🔔 Alerta del Administrador: Actividad pendiente`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${styles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);">
                <div class="logo">GISICF</div>
                <h1>🔔 Alerta Administrativa</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${userName}</strong>,</p>
                <p>El administrador te ha enviado una alerta importante sobre tu actividad pendiente:</p>
                <div class="alert" style="background: #fee2e2; border-left-color: #dc2626;">
                  <strong>📢 Mensaje del Administrador:</strong><br>
                  ${data?.observations || "Sin mensaje específico"}
                </div>
                <div class="info-box">
                  <p><strong>📌 Actividad:</strong> ${data?.activityName || "Actividad asignada"}</p>
                  ${data?.deadline ? `<p><strong>📅 Fecha límite:</strong> ${data.deadline}</p>` : ""}
                </div>
                <p style="color: #dc2626; font-weight: 600;">Por favor, atiende esta actividad lo antes posible.</p>
                <center>
                  <a href="${APP_URL}/my-tasks" class="button" style="background: #dc2626;">Ir a Mis Tareas</a>
                </center>
              </div>
              <div class="footer">
                <p>Sistema de Gestión de Investigación Científica</p>
                <p>Universidad Estatal del Sur de Manabí</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "evaluation_submitted":
      return {
        subject: `📊 Nueva evaluación enviada para revisión`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${styles}</head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">GISICF</div>
                <h1>📊 Nueva Evaluación Recibida</h1>
              </div>
              <div class="content">
                <p>Hola <strong>Administrador</strong>,</p>
                <p>El investigador <strong>${userName}</strong> ha enviado su evaluación anual para revisión:</p>
                <div class="info-box">
                  <p><strong>📅 Año de evaluación:</strong> ${data?.evaluationYear}</p>
                  <p><strong>📈 Puntuación:</strong> ${data?.score} puntos</p>
                </div>
                <center>
                  <a href="${APP_URL}/admin/evaluaciones" class="button">Revisar Evaluación</a>
                </center>
              </div>
              <div class="footer">
                <p>Sistema de Gestión de Investigación Científica</p>
                <p>Universidad Estatal del Sur de Manabí</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "evaluation_correction":
      return {
        subject: `🔄 Correcciones solicitadas en tu evaluación ${data?.evaluationYear}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${styles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);">
                <div class="logo">GISICF</div>
                <h1>🔄 Correcciones en Evaluación</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${userName}</strong>,</p>
                <p>El administrador ha revisado tu evaluación del año <strong>${data?.evaluationYear}</strong> y ha solicitado algunas correcciones:</p>
                <div class="alert">
                  <strong>Observaciones:</strong><br>
                  ${data?.observations || "Sin observaciones específicas"}
                </div>
                ${data?.correctionDeadline ? `<p><strong>📅 Fecha límite para corrección:</strong> ${data.correctionDeadline}</p>` : ""}
                <p>Por favor, ingresa al sistema para realizar las correcciones necesarias.</p>
                <center>
                  <a href="${APP_URL}/evaluation" class="button">Ver Evaluación</a>
                </center>
              </div>
              <div class="footer">
                <p>Sistema de Gestión de Investigación Científica</p>
                <p>Universidad Estatal del Sur de Manabí</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "evaluation_approved":
      return {
        subject: `✅ Tu evaluación ${data?.evaluationYear} ha sido aprobada`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${styles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%);">
                <div class="logo">GISICF</div>
                <h1>✅ Evaluación Aprobada</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${userName}</strong>,</p>
                <div class="success">
                  <strong>¡Felicitaciones!</strong> Tu evaluación anual ha sido aprobada exitosamente.
                </div>
                <div class="info-box">
                  <p><strong>📅 Año de evaluación:</strong> ${data?.evaluationYear}</p>
                  <p><strong>📈 Puntuación final:</strong> ${data?.score} puntos</p>
                </div>
                <p>Gracias por tu dedicación y contribución a la investigación científica.</p>
                <center>
                  <a href="${APP_URL}/evaluation" class="button">Ver Detalles</a>
                </center>
              </div>
              <div class="footer">
                <p>Sistema de Gestión de Investigación Científica</p>
                <p>Universidad Estatal del Sur de Manabí</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "user_approved":
      return {
        subject: `🎉 ¡Bienvenido a GISICF! Tu cuenta ha sido aprobada`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${styles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #007A33 0%, #00A94F 100%);">
                <div class="logo">GISICF</div>
                <h1>🎉 ¡Cuenta Aprobada!</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${userName}</strong>,</p>
                <div class="success">
                  <strong>¡Felicitaciones!</strong> Tu solicitud de registro ha sido aprobada. Ya puedes acceder al Sistema de Gestión de Investigación Científica.
                </div>
                <div class="alert" style="background: #e0f2fe; border-left-color: #0284c7;">
                  <strong>📝 Importante:</strong> Te invitamos a completar tu perfil, incluyendo tu nombre completo, para una mejor experiencia en el sistema.
                </div>
                <div class="info-box">
                  <p><strong>🔑 Próximos pasos:</strong></p>
                  <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Inicia sesión con tu cuenta</li>
                    <li>Accede a tu <strong>Perfil</strong> y actualiza tu nombre</li>
                    <li>Completa tu información ORCID y país</li>
                    <li>¡Explora las funcionalidades del sistema!</li>
                  </ol>
                </div>
                <center>
                  <a href="https://gisicf.com/profile" class="button" style="background: #007A33;">Completar Mi Perfil</a>
                </center>
                <p style="margin-top: 20px; color: #666; font-size: 14px;">
                  Si tienes alguna duda o necesitas ayuda, no dudes en contactar al administrador del sistema.
                </p>
              </div>
              <div class="footer">
                <p>Sistema de Gestión de Investigación Científica</p>
                <p>Universidad Estatal del Sur de Manabí</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: "Notificación GISICF",
        html: `<p>Tienes una nueva notificación del sistema GISICF.</p>`,
      };
  }
}

async function checkDeadlines() {
  console.log("Checking deadlines for activities...");
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today = new Date();
  const reminderDays = [7, 3, 1];
  
  const results: { sent: number; errors: string[] } = { sent: 0, errors: [] };

  for (const days of reminderDays) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    const targetDateStr = targetDate.toISOString().split("T")[0];

    console.log(`Checking for activities ending on ${targetDateStr} (${days} days reminder)`);

    // Get assigned tasks for activities ending on target date with user info
    const { data: tasks, error: tasksError } = await supabase
      .from("assigned_tasks")
      .select(`
        id,
        user_id,
        status,
        activity_id,
        planning_activities!inner(
          activity,
          end_date,
          plan_id,
          planning_sheets(period_name)
        )
      `)
      .eq("status", "pending")
      .eq("planning_activities.end_date", targetDateStr);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      results.errors.push(`Error fetching tasks: ${tasksError.message}`);
      continue;
    }

    if (!tasks || tasks.length === 0) {
      console.log(`No pending tasks found for ${days} days reminder`);
      continue;
    }

    console.log(`Found ${tasks.length} pending tasks for ${days} days reminder`);

    // Get unique user IDs
    const userIds = [...new Set(tasks.map(t => t.user_id))];

    // Get user profiles and emails
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const { data: contacts } = await supabase
      .from("profile_contacts")
      .select("user_id, email")
      .in("user_id", userIds);

    for (const task of tasks) {
      const profile = profiles?.find(p => p.id === task.user_id);
      const contact = contacts?.find(c => c.user_id === task.user_id);

      const email = contact?.email;
      const userName = profile?.full_name || "Investigador";
      const activity = (task as any).planning_activities;
      const planName = activity?.planning_sheets?.period_name || "Plan de trabajo";

      if (!email) {
        console.log(`No email found for user ${task.user_id}`);
        continue;
      }

      const { subject, html } = getEmailContent("activity_deadline_warning", userName, {
        activityName: activity?.activity,
        planName,
        deadline: activity?.end_date,
        daysRemaining: days,
      });

      try {
        const emailResponse = await resend.emails.send({
          from: FROM_EMAIL,
          to: [email],
          subject,
          html,
        });

        console.log(`Reminder email sent to ${email} for ${days} days warning:`, emailResponse);
        results.sent++;
      } catch (error: any) {
        console.error(`Error sending email to ${email}:`, error);
        results.errors.push(`Failed to send to ${email}: ${error.message}`);
      }
    }
  }

  console.log(`Deadline check complete. Sent: ${results.sent}, Errors: ${results.errors.length}`);
  return results;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    console.log("Received email request:", body);

    // Handle deadline check (cron job)
    // Cron jobs use service role internally, no user auth needed
    if (body.type === "check_deadlines") {
      // Verify this is an internal call (from cron or admin)
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) {
          console.error("Unauthorized cron request attempt");
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        // Verify user is admin for manual deadline checks
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const { data: roles } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin");
        
        if (!roles || roles.length === 0) {
          console.error("Non-admin user attempted to trigger deadline check");
          return new Response(
            JSON.stringify({ error: "Forbidden: Admin access required" }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
      // If no auth header, this could be an internal service call - proceed
      const results = await checkDeadlines();
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // For regular email sending, require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the user is authenticated
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Email request from authenticated user: ${user.id}`);

    // Validate required fields for direct email sending
    if (!body.to || !body.userName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, userName" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, html } = getEmailContent(body.type, body.userName, body.data);

    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [body.to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
