-- Create admin audit logs table
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_action CHECK (action IN (
    'view_application',
    'view_sensitive_data',
    'approve_application',
    'deny_application',
    'update_application_notes'
  ))
);

-- Create index for faster queries
CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_target_id ON admin_audit_logs(target_id);
CREATE INDEX idx_admin_audit_logs_timestamp ON admin_audit_logs(timestamp);

-- Add RLS policies
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only the system can insert logs
CREATE POLICY "System can insert audit logs"
  ON admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- No one can update or delete logs
CREATE POLICY "No updates to audit logs"
  ON admin_audit_logs
  FOR ALL
  USING (false)
  WITH CHECK (false); 