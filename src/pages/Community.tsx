import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { apiService } from '@/services/api';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { safeFormatDate } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Community = () => {
  const { isAuthenticated } = useAuth();
  // Fetch community data
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
  });

  const { data: eventsResponse } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiService.getEvents(),
  });

  const events = eventsResponse?.data || [];

  return (
    <PublicLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Our Community</h1>
          <p className="text-muted-foreground">
            Welcome to the Assalatur Rahman Islamic Association community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Us */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src="/src/assets/mosque-logo.png" alt="Assalatur Rahman Logo" className="h-5 w-5 object-contain" />
                  About Our Association
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  The Assalatur Rahman Islamic Association is a vibrant community dedicated to fostering 
                  Islamic values, education, and community service in London. We provide a welcoming 
                  environment for Muslims and non-Muslims alike to learn, grow, and connect.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our mission is to serve as a center for spiritual growth, community engagement, and 
                  cultural exchange. We organize regular events, educational programs, and community 
                  initiatives to strengthen bonds within our community and promote understanding.
                </p>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Community Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {dashboardStats?.data?.totalUsers || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Community Members</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {dashboardStats?.data?.totalEvents || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Events Organized</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {dashboardStats?.data?.totalAttendance || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Attendance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {safeFormatDate(event.startDate, 'MMM dd, yyyy')} • {event.location}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {event.category.toLowerCase()}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/events">View All Events</a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming events at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      123 Islamic Center Way<br />
                      London, UK SW1A 1AA
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+44 20 7123 4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">info@assalaturrahman.org</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-sm text-muted-foreground">www.assalaturrahman.org</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prayer Times */}
            <Card>
              <CardHeader>
                <CardTitle>Prayer Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fajr</span>
                  <span className="text-sm font-medium">5:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dhuhr</span>
                  <span className="text-sm font-medium">1:15 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Asr</span>
                  <span className="text-sm font-medium">4:45 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maghrib</span>
                  <span className="text-sm font-medium">8:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Isha</span>
                  <span className="text-sm font-medium">10:00 PM</span>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Daily Prayers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Islamic Education</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Community Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Youth Programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Charity & Outreach</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Interfaith Dialogue</span>
                </div>
              </CardContent>
            </Card>

            {/* Join Community */}
            <Card className="bg-gradient-to-br from-primary/5 to-gold/5 border-primary/20">
              <CardHeader>
                <CardTitle>Join Our Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Become a part of our growing community and stay connected with fellow members.
                </p>
                <Button className="w-full" asChild>
                  <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                    <Users className="h-4 w-4 mr-2" />
                    {isAuthenticated ? "Go to Dashboard" : "Become a Member"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
          </PublicLayout>
    );
  };

export default Community;
