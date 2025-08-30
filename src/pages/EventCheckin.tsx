import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, CheckCircle, AlertCircle, Clock, MapPin, Users, Calendar, LogIn } from 'lucide-react';
import { apiService } from '@/services/api';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { safeFormatDate } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';

const EventCheckin = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  
  const token = searchParams.get('token');

  // Validate check-in token
  const { data: validationResponse, isLoading: validationLoading, error: validationError } = useQuery({
    queryKey: ['validate-checkin-token', eventId, token],
    queryFn: () => apiService.validateCheckinToken(eventId!, token!),
    enabled: !!eventId && !!token,
    retry: false,
  });

  const eventData = validationResponse?.data;

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: () => apiService.checkinWithToken(eventId!, token!),
    onSuccess: (data) => {
      toast.success('Check-in successful! Welcome to the event.');
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      
      // Redirect to event details after successful check-in
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to check in');
    },
  });

  const handleCheckin = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    checkinMutation.mutate();
  };

  const getEventStatus = () => {
    if (!eventData) return 'loading';
    const now = new Date();
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);

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

  // Handle loading state
  if (validationLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <QrCode className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-lg font-medium">Validating QR Code...</p>
                  <p className="text-muted-foreground">Please wait while we verify your check-in token.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Handle validation error
  if (validationError || !eventData) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Invalid or Expired QR Code</p>
                      <p className="text-sm">
                        The QR code you scanned is either invalid, expired, or the event has ended. 
                        Please contact the event organizer for assistance.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
                <div className="mt-6 text-center">
                  <Button onClick={() => navigate('/events')} variant="outline">
                    Browse Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const eventStatus = getEventStatus();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <QrCode className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Event Check-in</h1>
            <p className="text-muted-foreground">
              Welcome! Please confirm your attendance for this event.
            </p>
          </div>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(eventStatus)}>
                    {eventStatus}
                  </Badge>
                  {eventData.registrationRequired && (
                    <Badge variant="outline">Registration Required</Badge>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold">{eventData.eventTitle}</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {safeFormatDate(eventData.startDate, 'MMM dd, yyyy h:mm a')} - {safeFormatDate(eventData.endDate, 'h:mm a')}
                    </span>
                  </div>
                  
                  {eventData.maxAttendees && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {eventData.currentAttendees} / {eventData.maxAttendees} attendees
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check-in Status */}
          <Card>
            <CardHeader>
              <CardTitle>Check-in Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated ? (
                <Alert>
                  <LogIn className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Authentication Required</p>
                      <p className="text-sm">
                        You need to be logged in to check in for this event. 
                        Please sign in to continue.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : eventStatus === 'past' ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Event Has Ended</p>
                      <p className="text-sm">
                        This event has already ended. Check-in is no longer available.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : eventStatus === 'upcoming' ? (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Event Not Started</p>
                      <p className="text-sm">
                        This event hasn't started yet. Check-in will be available once the event begins.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-green-800">Ready to Check In</p>
                      <p className="text-sm text-green-700">
                        The event is currently ongoing. You can check in now.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isAuthenticated && eventStatus === 'ongoing' ? (
                  <Button
                    onClick={handleCheckin}
                    disabled={checkinMutation.isPending}
                    className="flex-1"
                  >
                    {checkinMutation.isPending ? (
                      <>
                        <QrCode className="h-4 w-4 mr-2 animate-spin" />
                        Checking In...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check In Now
                      </>
                    )}
                  </Button>
                ) : !isAuthenticated ? (
                  <Button
                    onClick={handleCheckin}
                    className="flex-1"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Check In
                  </Button>
                ) : null}
                
                <Button
                  variant="outline"
                  onClick={() => navigate(`/events/${eventId}`)}
                >
                  View Event Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Token Info */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Expires:</strong> {safeFormatDate(eventData.expiresAt, 'MMM dd, yyyy h:mm a')}</p>
              <p><strong>Valid:</strong> {eventData.isValid ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default EventCheckin;
