/**
 * ============================================================
 * Layout Component - Layout Principal
 * ============================================================
 */

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ProtectedRoute from './ProtectedRoute';

export default function Layout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-admin-black">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="lg:ml-64">
          {/* Topbar */}
          <Topbar />

          {/* Page Content */}
          <main className="pt-24 px-4 lg:px-6 pb-6">
            <div className="mt-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

