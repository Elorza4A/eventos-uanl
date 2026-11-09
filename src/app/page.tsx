export default function HomePage() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido a la Plataforma</h1>
      <p className="text-gray-600 leading-relaxed mb-6">
        Esta es la vista principal montada dinámicamente dentro de la sección principal.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-blue-50/50">
          <h2 className="font-semibold text-blue-900 mb-1">Módulo Rápido A</h2>
          <p className="text-sm text-blue-700">Contenido o tarjetas de presentación.</p>
        </div>
        <div className="p-4 border rounded-lg bg-emerald-50/50">
          <h2 className="font-semibold text-emerald-900 mb-1">Módulo Rápido B</h2>
          <p className="text-sm text-emerald-700">Estadísticas o accesos directos.</p>
        </div>
      </div>
    </div>
  );
}