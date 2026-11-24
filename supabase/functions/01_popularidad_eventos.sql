-- Popularidad y disponibilidad de los eventos sin exponer la tabla inscripciones.
-- La función corre como SECURITY DEFINER (dueño postgres), por lo que puede
-- contar inscripciones, pero solo devuelve totales agregados por evento.
-- Se ejecuta en Supabase > SQL Editor / psql y se reutiliza desde la app.
--
-- Se cuentan las inscripciones 'Activa' y 'Asistió', igual que la RPC
-- inscribir_evento_uanl, para que el cupo mostrado coincida con la validación
-- del servidor al inscribirse o cancelar.

CREATE OR REPLACE FUNCTION public.popularidad_eventos_uanl()
RETURNS TABLE (id_evento bigint, inscritos bigint, cupo_disponible bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT e.id_evento,
         count(i.id_inscripcion)
           FILTER (WHERE s.nombre_estatus IN ('Activa', 'Asistió'))::bigint AS inscritos,
         GREATEST(
           e.cupo_maximo - count(i.id_inscripcion)
             FILTER (WHERE s.nombre_estatus IN ('Activa', 'Asistió')),
           0
         )::bigint AS cupo_disponible
    FROM public.eventos e
    LEFT JOIN public.inscripciones i ON i.id_evento = e.id_evento
    LEFT JOIN public.estatus_inscripcion s ON s.id_estatus_ins = i.id_estatus_ins
   GROUP BY e.id_evento, e.cupo_maximo;
$$;

-- Solo lectura agregada para visitantes y asistentes; sin acceso a la tabla base.
REVOKE ALL ON FUNCTION public.popularidad_eventos_uanl() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.popularidad_eventos_uanl() TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
