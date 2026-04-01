-- RPC: get_consultas_stats
-- Retorna conteo de consultas agrupado por estado
-- Ejecuta el COUNT en el servidor PostgreSQL (no trae filas al cliente)

CREATE OR REPLACE FUNCTION get_consultas_stats()
RETURNS json
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'total',       COUNT(*),
    'leidos',      COUNT(*) FILTER (WHERE leido = true),
    'noLeidos',    COUNT(*) FILTER (WHERE leido = false),
    'respondidas', COUNT(*) FILTER (WHERE respondida = true),
    'pendientes',  COUNT(*) FILTER (WHERE respondida = false)
  )
  FROM consultas;
$$;
