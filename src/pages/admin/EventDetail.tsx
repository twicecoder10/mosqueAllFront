import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CalendarDays, Clock, MapPin, Users, ArrowLeft, Calendar, User, CheckCircle, 
  Edit, Trash2, Eye, BarChart3, Download, Settings, Copy, ExternalLink 
} from 'lucide-react';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QRCodeManager from '@/components/QRCodeManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'react-hot-toast';
import { safeFormatDate } from '@/utils/dateUtils';
import { exportToPDF, exportToExcel } from '@/utils/export';

const AdminEventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch event details
  const { data: eventResponse, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['admin-event', id],
    queryFn: () => apiService.getEvent(id!),
    enabled: !!id,
  });

  // Fetch event attendance
  const { data: attendanceResponse, isLoading: attendanceLoading } = useQuery({
    queryKey: ['event-attendance', id],
    queryFn: () => apiService.getAttendance({ eventId: id }),
    enabled: !!id,
  });

  const event = eventResponse?.data;
  const attendanceList = attendanceResponse?.data || [];

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: () => apiService.deleteEvent(id!),
    onSuccess: () => {
      toast.success('Event deleted successfully');
      navigate('/admin/events');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete event');
      setIsDeleting(false);
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

  const getRegistrationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteEvent = () => {
    setIsDeleting(true);
    deleteEventMutation.mutate();
  };

  const handleCopyEventLink = () => {
    const eventUrl = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(eventUrl);
    toast.success('Event link copied to clipboard!');
  };

  const handleExportAttendance = (format: 'pdf' | 'excel') => {
    if (!event || !attendanceList.length) {
      toast.error('No attendance data to export');
      return;
    }

    const data = attendanceList.map((registration: any) => ({
      'Full Name': `${registration.user.firstName} ${registration.user.lastName}`,
      'Email': registration.user.email,
      'Phone': registration.user.phone || 'N/A',
      'Registration Date': safeFormatDate(registration.registrationDate, 'MMM dd, yyyy'),
      'Status': registration.status,
      'Attendance Marked': registration.attendanceDate ? 
        safeFormatDate(registration.attendanceDate, 'MMM dd, yyyy h:mm a') : 'Not marked',
    }));

    if (format === 'pdf') {
      exportToPDF(data, `${event.title} - Attendance`, 'attendance');
    } else {
      exportToExcel(data, `${event.title} - Attendance`);
    }
  };

  if (eventError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => navigate('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 text-warning mx-auto mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Event Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/admin/events')}>
                Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (eventLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => navigate('/admin/events')}>
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
      </DashboardLayout>
    );
  }

  if (!event) return null;

  const eventStatus = getEventStatus();
  const registrationStats = {
    total: attendanceList.length,
    confirmed: attendanceList.filter((reg: any) => reg.status === 'CONFIRMED').length,
    pending: attendanceList.filter((reg: any) => reg.status === 'PENDING').length,
    cancelled: attendanceList.filter((reg: any) => reg.status === 'CANCELLED').length,
    attended: attendanceList.filter((reg: any) => reg.attendanceDate).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyEventLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/events/${id}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/events/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{event.title}"? This action cannot be undone and will remove all associated registrations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Event
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Event Header */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(eventStatus)}>
                {eventStatus}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {event.category.toLowerCase()}
              </Badge>
              {event.isActive ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{event.title}</h1>
            <p className="text-lg text-muted-foreground max-w-4xl">
              {event.description}
            </p>
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

            {/* Registration Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Registration Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{registrationStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{registrationStats.confirmed}</div>
                    <div className="text-sm text-muted-foreground">Confirmed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{registrationStats.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{registrationStats.cancelled}</div>
                    <div className="text-sm text-muted-foreground">Cancelled</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{registrationStats.attended}</div>
                    <div className="text-sm text-muted-foreground">Attended</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registrations List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Event Registrations ({attendanceList.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportAttendance('pdf')}
                      disabled={!attendanceList.length}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportAttendance('excel')}
                      disabled={!attendanceList.length}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-muted h-10 w-10"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : attendanceList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Participant</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceList.map((registration: any) => (
                          <TableRow key={registration.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={registration.user.profileImage} />
                                  <AvatarFallback>
                                    {registration.user.firstName[0]}{registration.user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {registration.user.firstName} {registration.user.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {registration.user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{registration.user.email}</div>
                                {registration.user.phone && (
                                  <div className="text-muted-foreground">{registration.user.phone}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {safeFormatDate(registration.registrationDate, 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <Badge className={getRegistrationStatusColor(registration.status)}>
                                {registration.status.toLowerCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {registration.attendanceDate ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-600">
                                    {safeFormatDate(registration.attendanceDate, 'MMM dd, h:mm a')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not marked</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Registrations Yet</h3>
                    <p className="text-muted-foreground">
                      No one has registered for this event yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      {event.currentAttendees} / {event.maxAttendees || "N/A"} attendees
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)}%` }}
                      />
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

            {/* Event Creator */}
            <Card>
              <CardHeader>
                <CardTitle>Event Creator</CardTitle>
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

            {/* QR Code Management */}
            <QRCodeManager 
              eventId={id!} 
              eventTitle={event.title} 
              isAdmin={true} 
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/events">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    All Events
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/attendance">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Attendance
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/events/create">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Event Metadata */}
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
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{safeFormatDate(event.updatedAt, 'MMM dd, yyyy')}</span>
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
    </DashboardLayout>
  );
};

export default AdminEventDetail;
