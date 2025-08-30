import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, Users, Upload, X } from 'lucide-react';
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
import { CreateEventData } from '@/types';

const CreateEvent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventData) => apiService.createEvent(data),
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      navigate('/admin/events');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create event');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const maxAttendeesValue = formData.get('maxAttendees') as string;
    const registrationDeadlineValue = formData.get('registrationDeadline') as string;
    
    const eventData: CreateEventData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      startDate: new Date(formData.get('startDate') as string).toISOString(),
      endDate: new Date(formData.get('endDate') as string).toISOString(),
      location: formData.get('location') as string,
      maxAttendees: registrationRequired && maxAttendeesValue ? parseInt(maxAttendeesValue) : undefined,
      category: (formData.get('category') as string).toUpperCase(),
      registrationRequired: registrationRequired,
      registrationDeadline: registrationRequired && registrationDeadlineValue 
        ? new Date(registrationDeadlineValue).toISOString()
        : undefined,
    };

    createEventMutation.mutate(eventData);
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

  // Date validation helpers
  const getMinStartDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinEndDate = () => {
    if (!startDate) return getMinStartDate();
    return startDate;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // If end date is before new start date, clear it
    if (endDate && newStartDate && endDate < newStartDate) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
            <p className="text-muted-foreground">
              Create a new event for the community.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/events')}>
            Back to Events
          </Button>
        </div>

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
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prayer">Prayer</SelectItem>
                          <SelectItem value="lecture">Lecture</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="charity">Charity</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Event location"
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
                        min={getMinStartDate()}
                        value={startDate}
                        onChange={handleStartDateChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date & Time *</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="datetime-local"
                        min={getMinEndDate()}
                        value={endDate}
                        onChange={handleEndDateChange}
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
                      value="true" 
                      checked={registrationRequired}
                      onCheckedChange={setRegistrationRequired}
                    />
                    <Label htmlFor="registrationRequired">Registration Required</Label>
                  </div>

                  {registrationRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                        <Input
                          id="maxAttendees"
                          name="maxAttendees"
                          type="number"
                          min="1"
                          placeholder="100"
                          defaultValue="100"
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty for unlimited attendees
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                        <Input
                          id="registrationDeadline"
                          name="registrationDeadline"
                          type="datetime-local"
                          min={getMinStartDate()}
                        />
                      </div>
                    </div>
                  )}

                  {!registrationRequired && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        When registration is not required, attendees can check in directly without pre-registration.
                      </p>
                    </div>
                  )}
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
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
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
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
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

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date & Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Attendees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;
