import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

export default function Layout({ children, titulo }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">{titulo}</h2>
          <NotificationBell />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
