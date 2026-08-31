-- Prevent active reservations from overlapping on the same facility.
-- '[)' keeps adjacent reservations valid (for example, 10:00-11:00 and
-- 11:00-12:00) while rejecting any actual time intersection.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_no_active_time_overlap
  EXCLUDE USING gist (
    facility_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));
