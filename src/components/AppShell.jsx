/**
 * App shell — fixed NavBar on top, full-height content below.
 * onOpenProfile passed down so NavBar can trigger profile panel (W5).
 */
export default function AppShell({ children, onOpenProfile }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0FFFE]">
      {/* NavBar imported by App.jsx via prop — keeps shell decoupled */}
      {onOpenProfile !== undefined && (
        <div id="navbar-slot" />
      )}
      <main className="flex-1 pt-14">
        {children}
      </main>
    </div>
  );
}
