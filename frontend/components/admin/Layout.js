/**
 * ============================================================
 * Layout Component - Layout Principal
 * ============================================================
 */

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ProtectedRoute from './ProtectedRoute';
import MobileNav from './MobileNav';

export default function Layout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-admin-black pb-16 lg:pb-0">
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
        
        {/* Mobile Nav */}
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}

