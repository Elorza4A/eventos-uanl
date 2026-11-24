import TabsUsuarios from '../TabsUsuarios';

export default function OrganizadoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <TabsUsuarios activo="organizador" />
      {children}
    </div>
  );
}
