import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: inscripciones, error } = await supabase
    .from('inscripciones')
    .select('*')
    .limit(10)

  return (
    <main>
      <h1>Prueba de conexión con Supabase</h1>

      {error ? (
        <p role="alert">
          No fue posible consultar las inscripciones: {error.message} ({error.code})
        </p>
      ) : inscripciones?.length ? (
        <ul>
          {inscripciones.map((inscripcion, index) => (
            <li key={index}>
              <pre>{JSON.stringify(inscripcion, null, 2)}</pre>
            </li>
          ))}
        </ul>
      ) : (
        <p>La conexión funciona; la tabla «inscripciones» no tiene registros.</p>
      )}
    </main>
  )
}