-- ============================================
-- PHASE 4: ADVANCED SENTIMENT ANALYTICS
-- Teacher View - Intervention & Alert Tracking
-- Created: 2025-11-07
-- ============================================

-- ============================================
-- Table 1: intervention_logs
-- Tracks teacher interventions for at-risk students
-- ============================================

CREATE TABLE IF NOT EXISTS public.intervention_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- student
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN (
    'Hapi Moment',
    '1-on-1 Meeting',
    'Grade Adjustment',
    'Deadline Extension',
    'Counselor Referral',
    'Email Outreach',
    'Phone Call',
    'Other'
  )),
  intervention_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  outcome TEXT CHECK (outcome IN ('improved', 'unchanged', 'declined', 'pending')),
  outcome_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_intervention_logs_teacher_id ON public.intervention_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_intervention_logs_user_id ON public.intervention_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_intervention_logs_class_id ON public.intervention_logs(class_id);
CREATE INDEX IF NOT EXISTS idx_intervention_logs_intervention_date ON public.intervention_logs(intervention_date DESC);
CREATE INDEX IF NOT EXISTS idx_intervention_logs_outcome ON public.intervention_logs(outcome);
CREATE INDEX IF NOT EXISTS idx_intervention_logs_type ON public.intervention_logs(intervention_type);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_intervention_logs_teacher_date
  ON public.intervention_logs(teacher_id, intervention_date DESC);

-- Enable RLS
ALTER TABLE public.intervention_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intervention_logs
-- Teachers can view/manage interventions for their own classes
CREATE POLICY "Teachers can view their own interventions"
  ON public.intervention_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = intervention_logs.class_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create interventions for their students"
  ON public.intervention_logs
  FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = intervention_logs.class_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their own interventions"
  ON public.intervention_logs
  FOR UPDATE
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Students can view interventions related to them (optional privacy)
CREATE POLICY "Students can view interventions about themselves"
  ON public.intervention_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- Table 2: mood_alert_logs
-- Automated alerts for students with concerning mood patterns
-- ============================================

CREATE TABLE IF NOT EXISTS public.mood_alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- student
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'persistent_low',      -- Tier 1 for 3+ consecutive days
    'sudden_drop',         -- Tier 5-6 to 1-2 in <3 days
    'high_volatility',     -- SD > 1.5
    'prolonged_negative'   -- Tier 1-2 for >5 out of 7 days
  )),
  alert_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sentiment_value DECIMAL(3, 2) NOT NULL, -- Current sentiment at time of alert
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('medium', 'high', 'critical')),
  is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  notes TEXT, -- Teacher notes on acknowledgment
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_mood_alert_logs_user_id ON public.mood_alert_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_alert_logs_class_id ON public.mood_alert_logs(class_id);
CREATE INDEX IF NOT EXISTS idx_mood_alert_logs_alert_date ON public.mood_alert_logs(alert_date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_alert_logs_alert_type ON public.mood_alert_logs(alert_type);
CREATE INDEX IF NOT EXISTS idx_mood_alert_logs_severity ON public.mood_alert_logs(severity);
CREATE INDEX IF NOT EXISTS idx_mood_alert_logs_acknowledged ON public.mood_alert_logs(is_acknowledged);

-- Composite index for finding unacknowledged alerts by teacher's classes
CREATE INDEX IF NOT EXISTS idx_mood_alert_logs_class_unack
  ON public.mood_alert_logs(class_id, is_acknowledged, alert_date DESC);

-- Enable RLS
ALTER TABLE public.mood_alert_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mood_alert_logs
-- Teachers can view alerts for students in their classes
CREATE POLICY "Teachers can view alerts for their class students"
  ON public.mood_alert_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = mood_alert_logs.class_id
      AND c.teacher_id = auth.uid()
    )
  );

-- System can insert alerts (via Edge Function with service role key)
-- Teachers can also manually create alerts if needed
CREATE POLICY "Teachers can create alerts for their students"
  ON public.mood_alert_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = mood_alert_logs.class_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can update (acknowledge) alerts for their students
CREATE POLICY "Teachers can acknowledge alerts for their students"
  ON public.mood_alert_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = mood_alert_logs.class_id
      AND c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = mood_alert_logs.class_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Students should NOT see mood alerts (privacy)
-- Only teachers have access

-- ============================================
-- Function: Auto-update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION public.update_intervention_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_mood_alert_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_intervention_logs_updated_at ON public.intervention_logs;
CREATE TRIGGER trigger_intervention_logs_updated_at
  BEFORE UPDATE ON public.intervention_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_intervention_logs_updated_at();

DROP TRIGGER IF EXISTS trigger_mood_alert_logs_updated_at ON public.mood_alert_logs;
CREATE TRIGGER trigger_mood_alert_logs_updated_at
  BEFORE UPDATE ON public.mood_alert_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mood_alert_logs_updated_at();

-- ============================================
-- Helper Function: Get Unacknowledged Alerts for Teacher
-- ============================================

CREATE OR REPLACE FUNCTION public.get_teacher_unacknowledged_alerts(teacher_uid UUID)
RETURNS TABLE (
  alert_id UUID,
  student_id UUID,
  student_name TEXT,
  class_id UUID,
  class_name TEXT,
  alert_type TEXT,
  alert_date TIMESTAMPTZ,
  sentiment_value DECIMAL,
  severity TEXT,
  days_since_alert INTEGER
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mal.id AS alert_id,
    mal.user_id AS student_id,
    COALESCE(p.display_name, p.full_name, 'Unknown Student') AS student_name,
    mal.class_id,
    c.name AS class_name,
    mal.alert_type,
    mal.alert_date,
    mal.sentiment_value,
    mal.severity,
    EXTRACT(DAY FROM (NOW() - mal.alert_date))::INTEGER AS days_since_alert
  FROM public.mood_alert_logs mal
  JOIN public.classes c ON c.id = mal.class_id
  JOIN public.profiles p ON p.id = mal.user_id
  WHERE mal.is_acknowledged = FALSE
    AND c.teacher_id = teacher_uid
  ORDER BY mal.severity DESC, mal.alert_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Helper Function: Acknowledge Alert
-- ============================================

CREATE OR REPLACE FUNCTION public.acknowledge_alert(
  alert_id_param UUID,
  teacher_id_param UUID,
  notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.mood_alert_logs mal
  SET
    is_acknowledged = TRUE,
    acknowledged_by = teacher_id_param,
    acknowledged_at = NOW(),
    notes = notes_param
  FROM public.classes c
  WHERE mal.id = alert_id_param
    AND mal.class_id = c.id
    AND c.teacher_id = teacher_id_param;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE public.intervention_logs IS 'Tracks teacher interventions for at-risk students';
COMMENT ON TABLE public.mood_alert_logs IS 'Automated alerts for students with concerning mood patterns';

COMMENT ON COLUMN public.intervention_logs.intervention_type IS 'Type of intervention: Hapi Moment, Meeting, Grade Adjustment, etc.';
COMMENT ON COLUMN public.intervention_logs.outcome IS 'Outcome of intervention: improved, unchanged, declined, pending';
COMMENT ON COLUMN public.mood_alert_logs.alert_type IS 'Type of alert: persistent_low, sudden_drop, high_volatility, prolonged_negative';
COMMENT ON COLUMN public.mood_alert_logs.severity IS 'Alert severity: medium, high, critical';

-- ============================================
-- Grant permissions
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.intervention_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.mood_alert_logs TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_teacher_unacknowledged_alerts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.acknowledge_alert(UUID, UUID, TEXT) TO authenticated;
