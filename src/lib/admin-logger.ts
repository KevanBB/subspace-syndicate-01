import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export type AdminAction = 
  | 'view_application'
  | 'view_sensitive_data'
  | 'approve_application'
  | 'deny_application'
  | 'update_application_notes';

interface AdminLogEntry {
  admin_id: string;
  action: AdminAction;
  target_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export async function logAdminAction(entry: AdminLogEntry) {
  const supabase = createClientComponentClient();
  
  try {
    const { error } = await supabase
      .from('admin_audit_logs')
      .insert({
        ...entry,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to log admin action:', error);
    }
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
} 