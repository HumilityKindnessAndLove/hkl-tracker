export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-4">
      <div className="mx-auto max-w-4xl">{children}</div>
    </main>
  );
}
