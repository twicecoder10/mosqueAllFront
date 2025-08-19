import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CalendarDays, Users, Download, Eye, Filter, Search, ExternalLink, 
  CheckCircle, XCircle, Clock, MapPin, User, Phone, Mail, Calendar,
  BarChart3, TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { exportToPDF, exportToExcel } from '@/utils/export';
import { safeFormatDate } from '@/utils/dateUtils';
import { AttendanceFilters } from '@/types';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Attendance = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AttendanceFilters>({});
  const [displayMode, setDisplayMode] = useState<'table' | 'display'>('table');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch events for filter dropdown
  const { data: eventsResponse } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiService.getEvents(),
  });

  const events = eventsResponse?.data || [];

  // Fetch attendance data
  const { data: attendanceResponse, isLoading, error } = useQuery({
    queryKey: ['attendance', selectedEvent, filters, searchTerm],
    queryFn: () => apiService.getAttendance({
      eventId: selectedEvent !== 'all' ? selectedEvent : undefined,
      ...filters,
      search: searchTerm || undefined,
    }),
    enabled: !!selectedEvent,
  });

  const attendance = attendanceResponse?.data || [];

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) => 
      apiService.checkIn(eventId, userId),
    onSuccess: () => {
      toast.success('Attendance marked successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark attendance');
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) => 
      apiService.checkOut(eventId, userId),
    onSuccess: () => {
      toast.success('Check-out recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record check-out');
    },
  });

  const handleCheckIn = (eventId: string, userId: string) => {
    checkInMutation.mutate({ eventId, userId });
  };

  const handleCheckOut = (eventId: string, userId: string) => {
    checkOutMutation.mutate({ eventId, userId });
  };

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsDetailDialogOpen(true);
  };

  const handleExportPDF = () => {
    const data = attendance.map((record: any) => ({
      'Event': record.event?.title || 'N/A',
      'Event Date': record.event?.startDate ? safeFormatDate(record.event.startDate, 'MMM dd, yyyy') : 'N/A',
      'Attendee': `${record.user?.firstName} ${record.user?.lastName}`,
      'Email': record.user?.email || 'N/A',
      'Phone': record.user?.phone || 'N/A',
      'Status': record.status?.replace('_', ' ').toLowerCase() || 'N/A',
      'Notes': record.notes || 'N/A',
      'Check-in Time': record.checkInTime ? safeFormatDate(record.checkInTime, 'MMM dd, yyyy HH:mm') : 'N/A',
      'Check-out Time': record.checkOutTime ? safeFormatDate(record.checkOutTime, 'MMM dd, yyyy HH:mm') : 'N/A',
      'Duration': record.checkInTime && record.checkOutTime ? 
        `${Math.round((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60))} minutes` : 'N/A',
    }));

    exportToPDF(data, 'Event Attendance Report', 'attendance-report');
  };

  const handleExportExcel = () => {
    const data = attendance.map((record: any) => ({
      'Event': record.event?.title || 'N/A',
      'Event Date': record.event?.startDate ? safeFormatDate(record.event.startDate, 'MMM dd, yyyy') : 'N/A',
      'Attendee': `${record.user?.firstName} ${record.user?.lastName}`,
      'Email': record.user?.email || 'N/A',
      'Phone': record.user?.phone || 'N/A',
      'Status': record.status?.replace('_', ' ').toLowerCase() || 'N/A',
      'Notes': record.notes || 'N/A',
      'Check-in Time': record.checkInTime ? safeFormatDate(record.checkInTime, 'MMM dd, yyyy HH:mm') : 'N/A',
      'Check-out Time': record.checkOutTime ? safeFormatDate(record.checkOutTime, 'MMM dd, yyyy HH:mm') : 'N/A',
      'Duration': record.checkInTime && record.checkOutTime ? 
        `${Math.round((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60))} minutes` : 'N/A',
    }));

    exportToExcel(data, 'attendance-report');
  };

  const getStatusColor = (status: string) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'REGISTERED': return 'bg-yellow-100 text-yellow-800';
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800';
      case 'CHECKED_OUT': return 'bg-purple-100 text-purple-800';
      case 'NO_SHOW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCheckIn = (record: any) => {
    return record.status === 'REGISTERED' && !record.checkInTime;
  };

  const canCheckOut = (record: any) => {
    return record.status === 'CHECKED_IN' && record.checkInTime && !record.checkOutTime;
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
              <p className="text-muted-foreground">
                View and manage event attendance.
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 text-warning mx-auto mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
              <p className="text-muted-foreground mb-4">
                Unable to load attendance data. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
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
            <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
            <p className="text-muted-foreground">
              View and manage event attendance.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={displayMode === 'display' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDisplayMode('display')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Display Mode
            </Button>
            <Button
              variant={displayMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDisplayMode('table')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Table Mode
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map((event: any) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={filters.status || 'all'} 
                  onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="REGISTERED">Registered</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                    <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search attendees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                  <p className="text-2xl font-bold">{attendance.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered</p>
                  <p className="text-2xl font-bold">
                    {attendance.filter((r: any) => r.status === 'REGISTERED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Checked In</p>
                  <p className="text-2xl font-bold">
                    {attendance.filter((r: any) => r.checkInTime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Checked Out</p>
                  <p className="text-2xl font-bold">
                    {attendance.filter((r: any) => r.checkOutTime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold">
                    {attendance.length > 0 
                      ? `${Math.round((attendance.filter((r: any) => r.checkInTime).length / attendance.length) * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : attendance.length > 0 ? (
          displayMode === 'table' ? (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Check-out Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <Link 
                            to={`/admin/events/${record.event?.id}`}
                            className="text-primary hover:underline"
                          >
                            {record.event?.title || 'N/A'}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={record.user?.profileImage} />
                              <AvatarFallback>
                                {record.user?.firstName?.[0]}{record.user?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{record.user?.firstName} {record.user?.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{record.user?.email || 'N/A'}</TableCell>
                        <TableCell>
                          {safeFormatDate(record.registrationDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {(record.status || '').replace('_', ' ').toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.checkInTime 
                            ? safeFormatDate(record.checkInTime, 'MMM dd, yyyy HH:mm')
                            : 'Not checked in'
                          }
                        </TableCell>
                        <TableCell>
                          {record.checkOutTime 
                            ? safeFormatDate(record.checkOutTime, 'MMM dd, yyyy HH:mm')
                            : 'Not checked out'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canCheckIn(record) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckIn(record.event.id, record.user.id)}
                                disabled={checkInMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {canCheckOut(record) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckOut(record.event.id, record.user.id)}
                                disabled={checkOutMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendance.map((record: any) => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{record.event?.title || 'N/A'}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {record.user?.firstName} {record.user?.lastName}
                        </p>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {(record.status || '').toLowerCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{record.user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Registered:</span>
                        <span>{safeFormatDate(record.registrationDate, 'MMM dd, yyyy')}</span>
                      </div>
                      {record.checkInTime && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Checked in:</span>
                          <span>{safeFormatDate(record.checkInTime, 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Attendance Records</h3>
              <p className="text-muted-foreground">
                No attendance records found for the selected criteria.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Attendance Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Attendance Details</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6">
                {/* Event Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Event Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Event:</span>
                        <span>{selectedRecord.event?.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{selectedRecord.event?.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Date:</span>
                        <span>{safeFormatDate(selectedRecord.event?.startDate, 'MMM dd, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendee Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attendee Information</h3>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedRecord.user?.profileImage} />
                      <AvatarFallback className="text-lg">
                        {selectedRecord.user?.firstName?.[0]}{selectedRecord.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Name:</span>
                        <span>{selectedRecord.user?.firstName} {selectedRecord.user?.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{selectedRecord.user?.email}</span>
                      </div>
                      {selectedRecord.user?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Phone:</span>
                          <span>{selectedRecord.user?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registration Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Registration Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Registration Date:</span>
                        <span>{safeFormatDate(selectedRecord.registrationDate, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedRecord.status)}>
                          {(selectedRecord.status || '').toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attendance Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Check-in Time:</span>
                        <span>
                          {selectedRecord.checkInTime 
                            ? safeFormatDate(selectedRecord.checkInTime, 'MMM dd, yyyy h:mm a')
                            : 'Not checked in'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Check-out Time:</span>
                        <span>
                          {selectedRecord.checkOutTime 
                            ? safeFormatDate(selectedRecord.checkOutTime, 'MMM dd, yyyy h:mm a')
                            : 'Not checked out'
                          }
                        </span>
                      </div>
                      {selectedRecord.checkInTime && selectedRecord.checkOutTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Duration:</span>
                          <span>
                            {Math.round((new Date(selectedRecord.checkOutTime).getTime() - new Date(selectedRecord.checkInTime).getTime()) / (1000 * 60))} minutes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    Close
                  </Button>
                  {canCheckIn(selectedRecord) && (
                    <Button
                      onClick={() => {
                        handleCheckIn(selectedRecord.event.id, selectedRecord.user.id);
                        setIsDetailDialogOpen(false);
                      }}
                      disabled={checkInMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  )}
                  {canCheckOut(selectedRecord) && (
                    <Button
                      onClick={() => {
                        handleCheckOut(selectedRecord.event.id, selectedRecord.user.id);
                        setIsDetailDialogOpen(false);
                      }}
                      disabled={checkOutMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Check Out
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
