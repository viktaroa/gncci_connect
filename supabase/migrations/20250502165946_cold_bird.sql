/*
  # Add metrics tracking tables and functions

  1. New Tables
    - `metric_snapshots` - Daily snapshots of key metrics
    - `event_attendance` - Track event attendance
    - `revenue_records` - Track revenue from memberships and other sources

  2. Functions
    - `calculate_growth_rate` - Calculate growth rate between two periods
    - `update_daily_metrics` - Create daily snapshots of key metrics
*/

-- Create metric_snapshots table
CREATE TABLE metric_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL,
  total_members integer NOT NULL,
  active_members integer NOT NULL,
  pending_applications integer NOT NULL,
  total_revenue numeric(10,2) NOT NULL DEFAULT 0,
  event_registrations integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create event_attendance table
CREATE TABLE event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  total_registered integer NOT NULL DEFAULT 0,
  total_attended integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create revenue_records table
CREATE TABLE revenue_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date date NOT NULL,
  revenue_type text NOT NULL CHECK (revenue_type IN ('membership', 'event', 'other')),
  amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage metric_snapshots"
  ON metric_snapshots
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage event_attendance"
  ON event_attendance
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage revenue_records"
  ON revenue_records
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create function to calculate growth rate
CREATE OR REPLACE FUNCTION calculate_growth_rate(
  current_value numeric,
  previous_value numeric
)
RETURNS numeric AS $$
BEGIN
  IF previous_value = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND(((current_value - previous_value) / previous_value * 100)::numeric, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update daily metrics
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS void AS $$
DECLARE
  total_members_count integer;
  active_members_count integer;
  pending_applications_count integer;
  daily_revenue numeric;
  event_registrations_count integer;
BEGIN
  -- Get current counts
  SELECT COUNT(*) INTO total_members_count FROM companies;
  SELECT COUNT(*) INTO active_members_count FROM memberships WHERE status = 'active';
  SELECT COUNT(*) INTO pending_applications_count FROM membership_applications WHERE status = 'pending';
  SELECT COALESCE(SUM(amount), 0) INTO daily_revenue FROM payment_records WHERE DATE(payment_date) = CURRENT_DATE;
  SELECT COUNT(*) INTO event_registrations_count FROM event_registrations WHERE DATE(created_at) = CURRENT_DATE;

  -- Insert new snapshot
  INSERT INTO metric_snapshots (
    snapshot_date,
    total_members,
    active_members,
    pending_applications,
    total_revenue,
    event_registrations
  ) VALUES (
    CURRENT_DATE,
    total_members_count,
    active_members_count,
    pending_applications_count,
    daily_revenue,
    event_registrations_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update event attendance
CREATE OR REPLACE FUNCTION update_event_attendance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO event_attendance (
    event_id,
    total_registered,
    total_attended
  )
  SELECT
    NEW.event_id,
    COUNT(*) FILTER (WHERE status = 'registered'),
    COUNT(*) FILTER (WHERE status = 'attended')
  FROM event_registrations
  WHERE event_id = NEW.event_id
  ON CONFLICT (event_id) DO UPDATE
  SET
    total_registered = EXCLUDED.total_registered,
    total_attended = EXCLUDED.total_attended,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_event_registration_change
  AFTER INSERT OR UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendance();

-- Create trigger to update revenue records
CREATE OR REPLACE FUNCTION update_revenue_records()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' THEN
    INSERT INTO revenue_records (
      record_date,
      revenue_type,
      amount
    ) VALUES (
      DATE(NEW.payment_date),
      'membership',
      NEW.amount
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_success
  AFTER INSERT OR UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION update_revenue_records();