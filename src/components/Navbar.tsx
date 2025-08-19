import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Menu, 
  X, 
  CalendarDays, 
  Users, 
  Settings, 
  LogOut,
  User,
  Shield,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  return (
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
            {isAuthenticated ? (
              <>
                <Link to="/events" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                  <CalendarDays className="h-4 w-4" />
                  <span>Events</span>
                </Link>
                <Link to="/community" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Community</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                    <BarChart3 className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}

              </>
            ) : (
              <>
                <Link to="/events" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                  <CalendarDays className="h-4 w-4" />
                  <span>Events</span>
                </Link>
                <Link to="/community" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Community</span>
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{user?.firstName}</span>
                      <Badge variant={isAdmin ? 'default' : 'secondary'} className="flex items-center space-x-1">
                        {isAdmin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        <span className="capitalize">{user?.role}</span>
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/register">Join Us</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-4 pb-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/events" 
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Events</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <div className="pt-3 space-y-2">
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/events" 
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Events</span>
                </Link>
                <Link 
                  to="/community" 
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users className="h-4 w-4" />
                  <span>Community</span>
                </Link>
                <div className="pt-3 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="hero" className="w-full" asChild>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>Join Us</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;