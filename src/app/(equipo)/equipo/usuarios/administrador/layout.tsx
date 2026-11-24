import TabsUsuarios from '../TabsUsuarios';

export default function AdministradoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <TabsUsuarios activo="administrador" />
      {children}
    </div>
  );
}
