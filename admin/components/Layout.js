import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
