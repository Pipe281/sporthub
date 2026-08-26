-- Persist completed status after a reservation's end time.
-- The scheduled job runs independently of whether a user has the app open.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.complete_expired_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reservation_record RECORD;
  completed_count integer := 0;
BEGIN
  FOR reservation_record IN
    SELECT id, status
    FROM public.reservations
    WHERE status IN ('PENDING', 'CONFIRMED')
      AND end_at <= now()
    FOR UPDATE
  LOOP
    UPDATE public.reservations
    SET status = 'COMPLETED',
        updated_at = now()
    WHERE id = reservation_record.id;

    INSERT INTO public.reservation_status_history (
      reservation_id,
      previous_status,
      new_status,
      changed_by
    )
    VALUES (
      reservation_record.id,
      reservation_record.status,
      'COMPLETED',
      NULL
    );

    completed_count := completed_count + 1;
  END LOOP;

  RETURN completed_count;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_expired_reservations() FROM PUBLIC;

DO $$
DECLARE
  existing_job_id bigint;
BEGIN
  SELECT jobid
  INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'complete-expired-reservations';

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'complete-expired-reservations',
    '* * * * *',
    'SELECT public.complete_expired_reservations();'
  );
END;
$$;
