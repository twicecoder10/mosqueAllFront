import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CalendarDays, 
  TrendingUp, 
  FileText, 
  Plus, 
  Download,
  Eye,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { DashboardStats, ApiResponse } from '@/types';
import { safeFormatDate } from '@/utils/dateUtils';

const AdminDashboard = () => {
  const { data: adminDashboardResponse, isLoading, error } = useQuery<ApiResponse<any>>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiService.getAdminDashboard(),
    retry: 1,
    retryDelay: 1000,
  });

  const dashboardData = adminDashboardResponse?.data;
  const stats = dashboardData?.stats;
  const recentActivity = dashboardData?.recentActivity;

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    trend?: { value: number; isPositive: boolean };
    color?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? 'text-success' : 'text-destructive'}`} />
            <span className={`text-xs ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    href, 
    variant = 'default' 
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    variant?: 'default' | 'secondary';
  }) => (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg bg-${variant === 'default' ? 'primary' : 'secondary'}/10`}>
            <Icon className={`h-6 w-6 text-${variant === 'default' ? 'primary' : 'secondary'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button asChild variant="ghost" size="icon">
            <Link to={href}>
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const RecentActivityCard = () => {
    const recentRegistrations = recentActivity?.recentRegistrations || [];
    const recentUsers = recentActivity?.recentUsers || [];
    
    // Combine and sort activities by date
    const allActivities = [
      ...recentRegistrations.map((reg: any) => ({
        type: 'registration',
        title: `Registration for ${reg.event?.title || 'Event'}`,
        time: reg.registrationDate,
        status: (reg.status || '').toLowerCase(),
        data: reg
      })),
      ...recentUsers.map((user: any) => ({
        type: 'user',
        title: `New member: ${user.firstName} ${user.lastName}`,
        time: user.createdAt,
        status: 'joined',
        data: user
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest registrations and new members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allActivities.length > 0 ? (
              allActivities.slice(0, 6).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-muted">
                    {activity.type === 'registration' && <CalendarDays className="h-4 w-4" />}
                    {activity.type === 'user' && <UserPlus className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {safeFormatDate(activity.time, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant={activity.status === 'confirmed' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your mosque community.
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Backend Connection Issue</h3>
              <p className="text-muted-foreground mb-4">
                Unable to connect to the server.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your mosque community.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/admin/reports">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/events/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Members"
            value={stats?.totalUsers || 0}
            description="Registered community members"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Events"
            value={stats?.totalEvents || 0}
            description="Events created this year"
            icon={CalendarDays}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Upcoming Events"
            value={stats?.upcomingEvents || 0}
            description="Events in the next 30 days"
            icon={Clock}
            color="warning"
          />
          <StatCard
            title="Monthly Attendance"
            value={stats?.thisMonthAttendance || 0}
            description="Attendance this month"
            icon={TrendingUp}
            trend={{ value: 15, isPositive: true }}
            color="success"
          />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickActionCard
                title="Create New Event"
                description="Schedule a new community event"
                icon={CalendarDays}
                href="/admin/events/create"
              />
              <QuickActionCard
                title="Invite New Member"
                description="Send invitation to join the community"
                icon={UserPlus}
                href="/admin/invitations"
              />
              <QuickActionCard
                title="View Attendance"
                description="Check current event attendance"
                icon={Eye}
                href="/admin/attendance"
                variant="secondary"
              />
              <QuickActionCard
                title="Generate Reports"
                description="Export data and analytics"
                icon={FileText}
                href="/admin/reports"
                variant="secondary"
              />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivityCard />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Active Registrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {stats?.activeRegistrations || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Members registered for upcoming events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span>Past Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {stats?.pastEvents || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Events completed this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-info" />
                <span>Total Attendance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info">
                {stats?.totalAttendance || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total event attendance this year
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
