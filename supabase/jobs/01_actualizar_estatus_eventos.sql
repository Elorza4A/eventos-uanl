-- Job horario: mantiene actualizado el estatus base de los eventos.
-- La vista `eventos_publicos` calcula el estatus en pantalla, pero esta columna
-- se sincroniza para que reportes y consultas directas vean el estado real.
--
-- Ejecutar en Supabase > SQL Editor después de 01-04.
-- Requiere la extensión pg_cron (disponible en Supabase).

CREATE OR REPLACE FUNCTION public.actualizar_estatus_eventos_uanl()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_activo bigint;
  v_en_curso bigint;
  v_finalizado bigint;
BEGIN
  SELECT id_estatus_evento INTO STRICT v_activo
  FROM public.estatus_eventos WHERE nombre_estatus = 'Activo';

  SELECT id_estatus_evento INTO STRICT v_en_curso
  FROM public.estatus_eventos WHERE nombre_estatus = 'En curso';

  SELECT id_estatus_evento INTO STRICT v_finalizado
  FROM public.estatus_eventos WHERE nombre_estatus = 'Finalizado';

  UPDATE public.eventos e
     SET id_estatus_evento = CASE
           WHEN now() < e.fecha_inicio THEN v_activo
           WHEN now() BETWEEN e.fecha_inicio AND e.fecha_fin THEN v_en_curso
           ELSE v_finalizado
         END
    FROM public.estatus_eventos se
   WHERE e.id_estatus_evento = se.id_estatus_evento
     AND se.nombre_estatus <> 'Cancelado'
     AND e.id_estatus_evento <> (
       CASE
         WHEN now() < e.fecha_inicio THEN v_activo
         WHEN now() BETWEEN e.fecha_inicio AND e.fecha_fin THEN v_en_curso
         ELSE v_finalizado
       END
     );
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

GRANT EXECUTE ON FUNCTION public.actualizar_estatus_eventos_uanl() TO postgres;

-- Se reprograma en cada ejecución para no duplicar el job.
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('actualizar-estatus-eventos-uanl');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  PERFORM cron.schedule(
    'actualizar-estatus-eventos-uanl',
    '0 * * * *',
    'SELECT public.actualizar_estatus_eventos_uanl();'
  );
END $$;
