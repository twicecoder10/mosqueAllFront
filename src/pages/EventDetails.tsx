import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, Users, ArrowLeft, Calendar, User, CheckCircle, XCircle, LogIn } from 'lucide-react';
import { apiService } from '@/services/api';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { safeFormatDate } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch event details
  const { data: eventResponse, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => apiService.getEvent(eventId!),
    enabled: !!eventId,
  });

  const event = eventResponse?.data;

  // Check if user is already registered
  const { data: registrationsResponse } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => apiService.getMyRegistrations(),
  });

  const userRegistration = registrationsResponse?.data?.find(
    (reg: any) => reg.eventId === eventId
  );

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: () => apiService.registerForEvent(eventId!),
    onSuccess: () => {
      toast.success('Successfully registered for event!');
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      setIsRegistering(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register for event');
      setIsRegistering(false);
    },
  });

  // Cancel registration mutation
  const cancelMutation = useMutation({
    mutationFn: () => apiService.cancelRegistration(eventId!),
    onSuccess: () => {
      toast.success('Registration cancelled successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel registration');
    },
  });

  const handleRegister = () => {
    setIsRegistering(true);
    registerMutation.mutate();
  };

  const handleCancelRegistration = () => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      cancelMutation.mutate();
    }
  };

  const getEventStatus = () => {
    if (!event) return 'loading';
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'past';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'past': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canRegister = () => {
    if (!event || !user) return false;
    
    // If event doesn't require registration, don't show registration button
    if (!event.registrationRequired) {
      return false;
    }
    
    const status = getEventStatus();
    return status === 'upcoming' && !userRegistration;
  };

  const canCancel = () => {
    if (!event || !userRegistration) return false;
    const status = getEventStatus();
    return status === 'upcoming' && userRegistration.status === 'confirmed';
  };

  if (error) {
    return (
      <PublicLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Event Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/events')}>
                Browse Events
              </Button>
            </CardContent>
          </Card>
        </div>
              </PublicLayout>
      );
    }

  return (
    <PublicLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ) : event ? (
          <>
            {/* Event Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(getEventStatus())}>
                      {getEventStatus()}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {event.category.toLowerCase()}
                    </Badge>
                    {userRegistration && (
                      <Badge variant="secondary">
                        {userRegistration.status.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isAuthenticated ? (
                    <Button asChild>
                      <Link to="/login">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login to Register
                      </Link>
                    </Button>
                  ) : (
                    <>
                      {canRegister() && (
                        <Button onClick={handleRegister} disabled={isRegistering}>
                          {isRegistering ? 'Registering...' : 'Register for Event'}
                        </Button>
                      )}
                      {canCancel() && (
                        <Button variant="destructive" onClick={handleCancelRegistration}>
                          Cancel Registration
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Event Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">
                            {safeFormatDate(event.startDate, 'EEEE, MMMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Time</p>
                          <p className="text-sm text-muted-foreground">
                            {safeFormatDate(event.startDate, 'h:mm a')} - {safeFormatDate(event.endDate, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Capacity</p>
                          <p className="text-sm text-muted-foreground">
                            {event.currentAttendees} / {event.maxAttendees || "N/A"} attendees
                          </p>
                        </div>
                      </div>
                    </div>

                    {event.registrationRequired && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Registration Deadline</p>
                            <p className="text-sm text-muted-foreground">
                              {event.registrationDeadline 
                                ? safeFormatDate(event.registrationDeadline, 'MMM dd, yyyy h:mm a')
                                : 'No deadline set'
                              }
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/events">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Browse All Events
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/my-registrations">
                        <User className="h-4 w-4 mr-2" />
                        My Registrations
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Event Organizer */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Organizer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {event.createdBy?.firstName} {event.createdBy?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.createdBy?.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Registration Status */}
                {userRegistration && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Registration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Registered</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Registration date: {safeFormatDate(userRegistration.registrationDate, 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {userRegistration.status.toLowerCase()}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </PublicLayout>
  );
};

export default EventDetails;
