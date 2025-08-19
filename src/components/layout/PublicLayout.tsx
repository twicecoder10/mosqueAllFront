import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-islamic rounded-lg group-hover:animate-islamic-glow transition-all">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">Assalatur Rahman</h1>
                <p className="text-xs text-muted-foreground">Islamic Association</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/events" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <span>Events</span>
              </Link>
              <Link to="/community" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <span>Community</span>
              </Link>
              {isAuthenticated && (
                <>
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link to="/dashboard" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                    <span>Dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.firstName}
                  </span>
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
