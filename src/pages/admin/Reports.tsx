import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Calendar, Users, TrendingUp, FileText, Filter } from 'lucide-react';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { exportToPDF, exportToExcel } from '@/utils/export';
import { safeFormatDate } from '@/utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [reportType, setReportType] = useState<'attendance' | 'events' | 'users'>('attendance');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Fetch dashboard stats for reports
  const { data: dashboardStats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
  });

  // Fetch events for event-specific reports
  const { data: eventsResponse } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiService.getEvents(),
  });

  const events = eventsResponse?.data || [];

  // Mock data for charts (replace with real data from API)
  const attendanceData = [
    { name: 'Jan', attendance: 120 },
    { name: 'Feb', attendance: 150 },
    { name: 'Mar', attendance: 180 },
    { name: 'Apr', attendance: 200 },
    { name: 'May', attendance: 160 },
    { name: 'Jun', attendance: 220 },
  ];

  const eventCategoryData = [
    { name: 'Prayer', value: 40, color: '#10b981' },
    { name: 'Lecture', value: 25, color: '#3b82f6' },
    { name: 'Community', value: 20, color: '#f59e0b' },
    { name: 'Education', value: 15, color: '#8b5cf6' },
  ];

  const userGrowthData = [
    { name: 'Jan', users: 50 },
    { name: 'Feb', users: 65 },
    { name: 'Mar', users: 80 },
    { name: 'Apr', users: 95 },
    { name: 'May', users: 110 },
    { name: 'Jun', users: 125 },
  ];

  const handleExportReport = (type: 'pdf' | 'excel') => {
    const stats = dashboardStats?.data;
    
    if (!stats) {
      return;
    }

    const data = [
      { 'Metric': 'Total Users', 'Value': stats.totalUsers || 0 },
      { 'Metric': 'Total Events', 'Value': stats.totalEvents || 0 },
      { 'Metric': 'Upcoming Events', 'Value': stats.upcomingEvents || 0 },
      { 'Metric': 'Past Events', 'Value': stats.pastEvents || 0 },
      { 'Metric': 'Total Attendance', 'Value': stats.totalAttendance || 0 },
      { 'Metric': 'This Month Attendance', 'Value': stats.thisMonthAttendance || 0 },
      { 'Metric': 'Active Registrations', 'Value': stats.activeRegistrations || 0 },
    ];

    if (type === 'pdf') {
      exportToPDF(data, 'Dashboard Report', 'dashboard-report');
    } else {
      exportToExcel(data, 'dashboard-report');
    }
  };

  const handleExportEventReport = (type: 'pdf' | 'excel') => {
    const data = events.map((event: any) => ({
      'Event': event.title,
      'Category': event.category,
      'Location': event.location,
      'Start Date': safeFormatDate(event.startDate, 'MMM dd, yyyy'),
      'End Date': safeFormatDate(event.endDate, 'MMM dd, yyyy'),
      'Max Attendees': event.maxAttendees,
      'Current Attendees': event.currentAttendees,
      'Status': event.isActive ? 'Active' : 'Inactive',
    }));

    if (type === 'pdf') {
      exportToPDF(data, 'Events Report', 'events-report');
    } else {
      exportToExcel(data, 'events-report');
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground">
                View detailed reports and analytics for your community.
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 text-warning mx-auto mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
              <p className="text-muted-foreground mb-4">
                Unable to load reports data. Please try again later.
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
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              View detailed reports and analytics for your community.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleExportReport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={(value: 'attendance' | 'events' | 'users') => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance Report</SelectItem>
                    <SelectItem value="events">Events Report</SelectItem>
                    <SelectItem value="users">Users Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeRange">Time Range</Label>
                <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{dashboardStats?.data?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{dashboardStats?.data?.totalEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Attendance</p>
                  <p className="text-2xl font-bold">{dashboardStats?.data?.totalAttendance || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Registrations</p>
                  <p className="text-2xl font-bold">{dashboardStats?.data?.activeRegistrations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Event Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Event Categories Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="space-y-6">
          {/* Events Report */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Events Report</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportEventReport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportEventReport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{dashboardStats?.data?.upcomingEvents || 0}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{dashboardStats?.data?.pastEvents || 0}</p>
                    <p className="text-sm text-muted-foreground">Past Events</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{dashboardStats?.data?.thisMonthAttendance || 0}</p>
                    <p className="text-sm text-muted-foreground">This Month Attendance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Community Members</span>
                  <span className="font-semibold">{dashboardStats?.data?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Events</span>
                  <span className="font-semibold">{dashboardStats?.data?.upcomingEvents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Attendance</span>
                  <span className="font-semibold">
                    {dashboardStats?.data?.totalEvents && dashboardStats?.data?.totalAttendance 
                      ? Math.round(dashboardStats.data.totalAttendance / dashboardStats.data.totalEvents)
                      : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Registration Rate</span>
                  <span className="font-semibold text-green-600">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-semibold text-blue-600">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Community Growth</span>
                  <span className="font-semibold text-orange-600">+12%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
