import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, Users, ArrowLeft, Calendar, User, CheckCircle, XCircle, LogIn, Share2, Heart } from 'lucide-react';
import { apiService } from '@/services/api';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { safeFormatDate } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch event details
  const { data: eventResponse, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => apiService.getEvent(id!),
    enabled: !!id,
  });

  const event = eventResponse?.data;

  // Check if user is already registered (only for authenticated users)
  const { data: registrationsResponse } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => apiService.getMyRegistrations(),
    enabled: isAuthenticated,
  });

  const userRegistration = registrationsResponse?.data?.find(
    (reg: any) => reg.eventId === id
  );

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: () => apiService.registerForEvent(id!),
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
    mutationFn: () => apiService.cancelRegistration(id!),
    onSuccess: () => {
      toast.success('Registration cancelled successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel registration');
    },
  });

  // Mark attendance mutation using the new endpoint
  const attendanceMutation = useMutation({
    mutationFn: () => apiService.markAttendance(id!),
    onSuccess: () => {
      toast.success('Attendance marked successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark attendance');
    },
  });

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

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsRegistering(true);
    registerMutation.mutate();
  };

  const handleCancelRegistration = () => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      cancelMutation.mutate();
    }
  };

  const handleMarkAttendance = () => {
    attendanceMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const canRegister = () => {
    if (!event || !isAuthenticated) return false;
    const status = getEventStatus();
    
    // For events that don't require registration, can register when ongoing
    if (!event.registrationRequired) {
      return status === 'ongoing' && !userRegistration;
    }
    
    // For events that require registration
    if (event.registrationRequired) {
      // Can register if upcoming and not already registered
      if (status === 'upcoming' && !userRegistration) return true;
      
      // Can register if ongoing and registration deadline hasn't passed
      if (status === 'ongoing' && !userRegistration) {
        if (!event.registrationDeadline) return true;
        const now = new Date();
        const deadline = new Date(event.registrationDeadline);
        return now <= deadline;
      }
    }
    
    return false;
  };

  const canCancel = () => {
    if (!event || !userRegistration) return false;
    const status = getEventStatus();
    return status === 'upcoming' && userRegistration.status === 'confirmed';
  };

  const canMarkAttendance = () => {
    if (!event || !isAuthenticated) return false;
    const status = getEventStatus();
    
    // Can mark attendance if event is ongoing
    if (status === 'ongoing') {
      // If registration is required, must be registered and not already marked attendance
      if (event.registrationRequired) {
        return userRegistration && 
               userRegistration.status === 'confirmed' && 
               !userRegistration.attendanceDate;
      }
      // If no registration required, anyone can mark attendance (but only once)
      return !userRegistration || !userRegistration.attendanceDate;
    }
    
    return false;
  };

  const isEventFull = () => {
    return event && event.currentAttendees >= event.maxAttendees;
  };

  if (error) {
    return (
      <PublicLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
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

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
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
        </div>
      </PublicLayout>
    );
  }

  if (!event) return null;

  const eventStatus = getEventStatus();

  return (
    <PublicLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        {/* Event Header */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getStatusColor(eventStatus)}>
                  {eventStatus}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {event.category.toLowerCase()}
                </Badge>
                {userRegistration && (
                  <Badge variant="secondary">
                    Registered ({userRegistration.status.toLowerCase()})
                  </Badge>
                )}
                {isEventFull() && (
                  <Badge variant="destructive">
                    Full
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{event.title}</h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                {event.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              {!isAuthenticated ? (
                <Button asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login to Register
                  </Link>
                </Button>
              ) : (
                <>
                  {canRegister() && !isEventFull() && (
                    <Button onClick={handleRegister} disabled={isRegistering}>
                      {isRegistering ? 'Registering...' : 'Register for Event'}
                    </Button>
                  )}
                  {canRegister() && isEventFull() && (
                    <Button disabled>
                      Event Full
                    </Button>
                  )}
                  {canCancel() && (
                    <Button variant="destructive" onClick={handleCancelRegistration}>
                      Cancel Registration
                    </Button>
                  )}
                  {canMarkAttendance() && (
                    <Button 
                      onClick={handleMarkAttendance} 
                      disabled={attendanceMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {attendanceMutation.isPending ? 'Marking Attendance...' : 'Mark Attendance'}
                    </Button>
                  )}
                  {eventStatus === 'ongoing' && userRegistration && userRegistration.attendanceDate && (
                    <Button disabled className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Attendance Marked
                    </Button>
                  )}
                  {!canRegister() && !canCancel() && !canMarkAttendance() && eventStatus === 'upcoming' && event.registrationRequired && (
                    <Button disabled>
                      Registration Required
                    </Button>
                  )}
                  {!canRegister() && !canCancel() && !canMarkAttendance() && eventStatus === 'past' && (
                    <Button disabled>
                      Event Ended
                    </Button>
                  )}
                  {!canRegister() && !canCancel() && !canMarkAttendance() && eventStatus === 'ongoing' && (
                    <Button disabled>
                      Event in Progress
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
            {/* Event Image */}
            {event.imageUrl && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-64 lg:h-80 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {safeFormatDate(event.startDate, 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {safeFormatDate(event.startDate, 'h:mm a')} - {safeFormatDate(event.endDate, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-muted-foreground">
                        {event.currentAttendees} / {event.maxAttendees} attendees
                      </p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {event.registrationRequired && event.registrationDeadline && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Registration Deadline</p>
                        <p className="text-sm text-muted-foreground">
                          {safeFormatDate(event.registrationDeadline, 'MMMM dd, yyyy h:mm a')}
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
            {/* Event Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Event Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={event.createdBy?.profileImage} />
                    <AvatarFallback>
                      {event.createdBy?.firstName?.[0]}{event.createdBy?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
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
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Registered</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Registration date: {safeFormatDate(userRegistration.registrationDate, 'MMM dd, yyyy')}</p>
                      <p>Status: <span className="capitalize">{userRegistration.status.toLowerCase()}</span></p>
                      {userRegistration.attendanceDate && (
                        <p>Attendance marked: {safeFormatDate(userRegistration.attendanceDate, 'MMM dd, yyyy h:mm a')}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attendance Status for Non-Registration Events */}
            {!userRegistration && eventStatus === 'ongoing' && !event.registrationRequired && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Event in Progress</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>You can mark your attendance for this event.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attendance Marked for Non-Registration Events */}
            {!userRegistration && eventStatus === 'ongoing' && !event.registrationRequired && userRegistration?.attendanceDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Attendance Marked</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Attendance marked on: {safeFormatDate(userRegistration.attendanceDate, 'MMM dd, yyyy h:mm a')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                {isAuthenticated && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/my-registrations">
                      <User className="h-4 w-4 mr-2" />
                      My Registrations
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/community">
                    <Users className="h-4 w-4 mr-2" />
                    Community
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{safeFormatDate(event.createdAt, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="capitalize">{event.category.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Registration</span>
                  <span>{event.registrationRequired ? 'Required' : 'Open'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize">{eventStatus}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default EventDetail;
