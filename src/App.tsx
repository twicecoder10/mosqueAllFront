import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster as HotToaster } from "react-hot-toast";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import Events from "./pages/Events";
import MyRegistrations from "./pages/MyRegistrations";

import Settings from "./pages/Settings";
import Community from "./pages/Community";
import EventDetails from "./pages/EventDetails";
import EventDetail from "./pages/EventDetail";
import EventCheckin from "./pages/EventCheckin";
import AdminEvents from "./pages/admin/Events";
import AdminEventDetail from "./pages/admin/EventDetail";
import CreateEvent from "./pages/admin/CreateEvent";
import EditEvent from "./pages/admin/EditEvent";
import Attendance from "./pages/admin/Attendance";
import Users from "./pages/admin/Users";
import Invitations from "./pages/admin/Invitations";
import Reports from "./pages/admin/Reports";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import VerificationRequired from "./pages/auth/VerificationRequired";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: { 
  children: React.ReactNode; 
  requireAdmin?: boolean;
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin' && user?.role !== 'subadmin') {
    return <Navigate to="/events?filter=ongoing" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/events?filter=ongoing" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
      <Route path="/register" element={<AcceptInvitation />} />
      <Route path="/verification-required" element={<VerificationRequired />} />
      <Route path="/verify-email" element={<VerificationRequired />} />

      {/* Protected User Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/events" element={<Events />} />
      <Route path="/my-registrations" element={
        <ProtectedRoute>
          <MyRegistrations />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/community" element={<Community />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/events/:eventId/checkin" element={<EventCheckin />} />
      <Route path="/event/:id" element={<EventDetails />} />

      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute requireAdmin>
          <AdminEvents />
        </ProtectedRoute>
      } />
      <Route path="/admin/events/create" element={
        <ProtectedRoute requireAdmin>
          <CreateEvent />
        </ProtectedRoute>
      } />
      <Route path="/admin/events/:id" element={
        <ProtectedRoute requireAdmin>
          <AdminEventDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/events/:id/edit" element={
        <ProtectedRoute requireAdmin>
          <EditEvent />
        </ProtectedRoute>
      } />
      <Route path="/admin/attendance" element={
        <ProtectedRoute requireAdmin>
          <Attendance />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requireAdmin>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/admin/invitations" element={
        <ProtectedRoute requireAdmin>
          <Invitations />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute requireAdmin>
          <Reports />
        </ProtectedRoute>
      } />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <HotToaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
