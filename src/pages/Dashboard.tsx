import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  BookOpen,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Event, EventRegistration, PaginatedResponse, ApiResponse, DashboardStats } from '@/types';
import { safeFormatDate } from '@/utils/dateUtils';

const Dashboard = () => {
  // Fetch user dashboard data
  const { data: userDashboardResponse, error: dashboardError } = useQuery<ApiResponse<any>>({
    queryKey: ['user-dashboard'],
    queryFn: () => apiService.getUserDashboard(),
    retry: 1,
    retryDelay: 1000,
  });

  const dashboardData = userDashboardResponse?.data;
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const myRegistrations = dashboardData?.myRegistrations || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const totalUsers = dashboardData?.communityMembers || 0;

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'past';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'secondary';
      case 'ongoing': return 'default';
      case 'past': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return Clock;
      case 'ongoing': return CheckCircle;
      case 'past': return AlertCircle;
      default: return Clock;
    }
  };

  const EventCard = ({ event }: { event: Event }) => {
    const status = getEventStatus(event);
    const StatusIcon = getStatusIcon(status);
    const isRegistered = myRegistrations?.some(reg => reg.eventId === event.id);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className="h-4 w-4 text-muted-foreground" />
              <Badge variant={getStatusColor(status) as any}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            {isRegistered && (
              <Badge variant="default" className="bg-success text-success-foreground">
                Registered
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{new Date(event.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(event.startDate).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - {new Date(event.endDate).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event.currentAttendees}
                {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button asChild variant="outline" className="flex-1">
              <Link to={`/events/${event.id}`}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            {status === 'upcoming' && !isRegistered && event.registrationRequired && (
              <Button asChild className="flex-1">
                <Link to={`/events/${event.id}/register`}>
                  Register
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const QuickStatsCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
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
      </CardContent>
    </Card>
  );

  const CommunityCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Community Highlights</CardTitle>
        <CardDescription>Stay connected with your community</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
          <div className="p-2 rounded-full bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Weekly Quran Study</h4>
            <p className="text-sm text-muted-foreground">Every Sunday at 2 PM</p>
          </div>
          <Badge variant="secondary">Free</Badge>
        </div>
        
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
          <div className="p-2 rounded-full bg-success/10">
            <Heart className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Community Service</h4>
            <p className="text-sm text-muted-foreground">Monthly charity drive</p>
          </div>
          <Badge variant="outline">Volunteer</Badge>
        </div>
        
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
          <div className="p-2 rounded-full bg-warning/10">
            <Users className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Youth Group</h4>
            <p className="text-sm text-muted-foreground">Activities for young Muslims</p>
          </div>
          <Badge variant="secondary">Ages 13-25</Badge>
        </div>
      </CardContent>
    </Card>
  );

  // Show error message if backend is not available
  if (dashboardError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
              <p className="text-muted-foreground">
                Stay connected with your Islamic community and upcoming events.
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
            <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
            <p className="text-muted-foreground">
              Stay connected with your Islamic community and upcoming events.
            </p>
          </div>
          <Button asChild>
            <Link to="/events">
              <CalendarDays className="h-4 w-4 mr-2" />
              View All Events
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickStatsCard
            title="Upcoming Events"
            value={upcomingEvents?.filter(e => getEventStatus(e) === 'upcoming').length || 0}
            description="Events in the next 30 days"
            icon={CalendarDays}
            color="primary"
          />
          <QuickStatsCard
            title="My Registrations"
            value={myRegistrations?.length || 0}
            description="Events you're registered for"
            icon={User}
            color="success"
          />
          <QuickStatsCard
            title="Community Members"
            value={totalUsers.toString()}
            description="Active community members"
            icon={Users}
            color="info"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <Button variant="outline" asChild>
                <Link to="/events">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents?.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            
            {(!upcomingEvents || upcomingEvents.length === 0) && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
                  <p className="text-muted-foreground mb-4">
                    Check back later for new community events and activities.
                  </p>
                  <Button asChild>
                    <Link to="/events">Browse All Events</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Highlights */}
            <CommunityCard />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">

                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/my-registrations">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    My Registrations
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/events">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Events
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent registrations and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.event?.title || 'Event Registration'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {safeFormatDate(activity.registrationDate, 'MMM dd, yyyy')} • {(activity.status || '').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                )}
                {recentActivity.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/my-registrations">
                      View All Activity
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Prayer Times */}
            <Card>
              <CardHeader>
                <CardTitle>Prayer Times</CardTitle>
                <CardDescription>Today's prayer schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Fajr', time: '5:30 AM' },
                  { name: 'Dhuhr', time: '1:15 PM' },
                  { name: 'Asr', time: '4:45 PM' },
                  { name: 'Maghrib', time: '8:20 PM' },
                  { name: 'Isha', time: '9:45 PM' },
                ].map((prayer) => (
                  <div key={prayer.name} className="flex justify-between items-center">
                    <span className="font-medium">{prayer.name}</span>
                    <span className="text-muted-foreground">{prayer.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
