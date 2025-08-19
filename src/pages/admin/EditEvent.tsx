import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, Users, Upload, X, ArrowLeft } from 'lucide-react';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { UpdateEventData } from '@/types';

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Helper function to safely format dates for datetime-local input
  const formatDateTimeLocal = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  // Fetch event data
  const { data: eventResponse, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => apiService.getEvent(id!),
    enabled: !!id,
  });

  const event = eventResponse?.data;

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: (data: UpdateEventData) => apiService.updateEvent(id!, data),
    onSuccess: () => {
      toast.success('Event updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      navigate('/admin/events');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update event');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const startDateStr = formData.get('startDate') as string;
      const endDateStr = formData.get('endDate') as string;
      const registrationDeadlineStr = formData.get('registrationDeadline') as string;
      const maxAttendeesStr = formData.get('maxAttendees') as string;
      
      const eventData: UpdateEventData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        startDate: startDateStr ? new Date(startDateStr) : undefined,
        endDate: endDateStr ? new Date(endDateStr) : undefined,
        location: formData.get('location') as string,
        maxAttendees: maxAttendeesStr ? parseInt(maxAttendeesStr) : undefined,
        category: (formData.get('category') as string)?.toUpperCase(),
        registrationRequired: formData.get('registrationRequired') === 'on',
        registrationDeadline: registrationDeadlineStr 
          ? new Date(registrationDeadlineStr)
          : undefined,
      };

      // Remove undefined values
      Object.keys(eventData).forEach(key => {
        if (eventData[key as keyof UpdateEventData] === undefined) {
          delete eventData[key as keyof UpdateEventData];
        }
      });

      updateEventMutation.mutate(eventData);
    } catch (error) {
      toast.error('Please check your input values and try again');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (error) {
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
                The event you're trying to edit doesn't exist or has been removed.
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
            <p className="text-muted-foreground">
              Update event details and settings.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>

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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter event title"
                        defaultValue={event.title}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the event..."
                        rows={4}
                        defaultValue={event.description}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select name="category" defaultValue={event.category?.toLowerCase()}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prayer">Prayer</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="charity">Charity</SelectItem>
                            <SelectItem value="youth">Youth</SelectItem>
                            <SelectItem value="women">Women</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="Event location"
                          defaultValue={event.location}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Date and Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Date and Time</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date & Time *</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="datetime-local"
                          defaultValue={formatDateTimeLocal(event.startDate)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date & Time *</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="datetime-local"
                          defaultValue={formatDateTimeLocal(event.endDate)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Registration Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="registrationRequired" 
                        name="registrationRequired"
                        defaultChecked={event.registrationRequired}
                      />
                      <Label htmlFor="registrationRequired">Registration Required</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                        <Input
                          id="maxAttendees"
                          name="maxAttendees"
                          type="number"
                          min="1"
                          placeholder="100"
                          defaultValue={event.maxAttendees}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                        <Input
                          id="registrationDeadline"
                          name="registrationDeadline"
                          type="datetime-local"
                          defaultValue={formatDateTimeLocal(event.registrationDeadline)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {imagePreview || event.imageUrl ? (
                      <div className="relative">
                        <img
                          src={imagePreview || event.imageUrl}
                          alt="Event preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload event image
                        </p>
                        <Button type="button" variant="outline" size="sm" asChild>
                          <Label htmlFor="image" className="cursor-pointer">
                            Choose File
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </Label>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={updateEventMutation.isPending}
                    >
                      {updateEventMutation.isPending ? 'Updating...' : 'Update Event'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/admin/events')}
                    >
                      Cancel
                    </Button>
                  </CardContent>
                </Card>

                {/* Event Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Attendees</span>
                      <span className="text-sm font-medium">{event.currentAttendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Max Capacity</span>
                      <span className="text-sm font-medium">{event.maxAttendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Registration Required</span>
                      <span className="text-sm font-medium">{event.registrationRequired ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="text-sm font-medium">{event.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default EditEvent;
