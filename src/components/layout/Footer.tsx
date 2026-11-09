export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} EventosUANL Web. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}