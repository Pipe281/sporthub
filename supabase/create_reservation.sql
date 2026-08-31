CREATE OR REPLACE FUNCTION public.create_reservation(p_facility_id uuid, p_start_at timestamp with time zone, p_end_at timestamp with time zone)
 RETURNS reservations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$

DECLARE

  v_reservation public.reservations;

BEGIN

  -- ----------------------------------------------------------
  -- Validar usuario autenticado
  -- ----------------------------------------------------------

  IF AUTH.UID() IS NULL THEN

    RAISE EXCEPTION
      'AUTHENTICATION_REQUIRED';

  END IF;


  -- ----------------------------------------------------------
  -- Validar cliente activo
  -- ----------------------------------------------------------

  IF NOT public.is_active_customer() THEN

    RAISE EXCEPTION
      'USER_IS_NOT_AN_ACTIVE_CUSTOMER';

  END IF;


  -- ----------------------------------------------------------
  -- Validar solicitud
  -- ----------------------------------------------------------

  PERFORM public.validate_reservation_request(

    p_facility_id,

    p_start_at,

    p_end_at

  );


  -- ----------------------------------------------------------
  -- Crear reserva
  -- ----------------------------------------------------------

  INSERT INTO public.reservations (

    customer_id,

    facility_id,

    start_at,

    end_at,

    status

  )

  VALUES (

    AUTH.UID(),

    p_facility_id,

    p_start_at,

    p_end_at,

    'CONFIRMED'

  )

  RETURNING *

  INTO v_reservation;


  -- ----------------------------------------------------------
  -- Registrar historial
  -- ----------------------------------------------------------

  INSERT INTO public.reservation_status_history (

    reservation_id,

    previous_status,

    new_status,

    changed_by

  )

  VALUES (

    v_reservation.id,

    NULL,

    'CONFIRMED',

    AUTH.UID()

  );


  RETURN v_reservation;


EXCEPTION

  WHEN exclusion_violation THEN

    RAISE EXCEPTION
      'RESERVATION_TIME_IS_NO_LONGER_AVAILABLE';

END;

$function$
