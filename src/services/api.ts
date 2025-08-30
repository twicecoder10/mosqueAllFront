import { 
  User, 
  Event, 
  Attendance, 
  EventRegistration, 
  Invitation,
  InvitationAcceptance,
  EventFilters,
  UserFilters,
  AttendanceFilters,
  CreateEventData,
  UpdateEventData,
  UpdateUserData,
  DashboardStats,
  ExportOptions,
  PaginatedResponse,
  ApiResponse,
  AuthResponse
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  async loginWithOTP(credentials: { phone: string; otp: string }): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  async register(userData: any): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async sendOTP(phone: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(userId: string, userData: UpdateUserData): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async inviteUser(inviteData: { email?: string; phone?: string; role: 'USER' | 'SUBADMIN' }): Promise<ApiResponse<Invitation>> {
    const response = await fetch(`${API_BASE_URL}/users/invite`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(inviteData),
    });
    return this.handleResponse(response);
  }

  async bulkInviteUsers(invitations: Array<{ email?: string; phone?: string; role: 'USER' | 'SUBADMIN' }>): Promise<ApiResponse<{ success: any[]; failed: any[] }>> {
    const response = await fetch(`${API_BASE_URL}/users/bulk-invite`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ invitations }),
    });
    return this.handleResponse(response);
  }

  async verifyInvitation(token: string): Promise<ApiResponse<Invitation>> {
    const response = await fetch(`${API_BASE_URL}/auth/invitations/verify/${token}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse(response);
  }

  async acceptInvitation(invitationData: InvitationAcceptance): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invitationData),
    });
    return this.handleResponse(response);
  }

  async getUsers(filters?: UserFilters, page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.isVerified !== undefined && { isVerified: filters.isVerified.toString() }),
      ...(filters?.search && { search: filters.search }),
    });

    const response = await fetch(`${API_BASE_URL}/users?${params}`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // Event endpoints
  async getEvents(filters?: EventFilters, page = 1, limit = 10): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.category && { category: filters.category.toUpperCase() }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.startDate && { startDate: filters.startDate.toISOString() }),
      ...(filters?.endDate && { endDate: filters.endDate.toISOString() }),
    });

    const response = await fetch(`${API_BASE_URL}/events?${params}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<{ data: PaginatedResponse<Event> }>(response);
    return result.data; // Extract the data from the API response
  }

  async getEvent(eventId: string): Promise<ApiResponse<Event>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createEvent(eventData: CreateEventData): Promise<ApiResponse<Event>> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return this.handleResponse(response);
  }

  async updateEvent(eventId: string, eventData: UpdateEventData): Promise<ApiResponse<Event>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return this.handleResponse(response);
  }

  async deleteEvent(eventId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Attendance endpoints
  async getAttendance(filters?: AttendanceFilters, page = 1, limit = 10): Promise<PaginatedResponse<Attendance>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.eventId && { eventId: filters.eventId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.startDate && { startDate: filters.startDate.toISOString() }),
      ...(filters?.endDate && { endDate: filters.endDate.toISOString() }),
    });

    const response = await fetch(`${API_BASE_URL}/attendance?${params}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async checkIn(eventId: string, userId: string, notes?: string): Promise<ApiResponse<Attendance>> {
    const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ eventId, userId, notes }),
    });
    return this.handleResponse(response);
  }

  async checkOut(eventId: string, userId: string, notes?: string): Promise<ApiResponse<Attendance>> {
    const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ eventId, userId, notes }),
    });
    return this.handleResponse(response);
  }

  async markAttendance(eventId: string): Promise<ApiResponse<Attendance>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Registration endpoints
  async registerForEvent(eventId: string): Promise<ApiResponse<EventRegistration>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async cancelRegistration(eventId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getMyRegistrations(): Promise<ApiResponse<EventRegistration[]>> {
    const response = await fetch(`${API_BASE_URL}/events/my-registrations`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<EventRegistration[]>>(response);
    return result;
  }



  async getInvitations(): Promise<ApiResponse<Invitation[]>> {
    const response = await fetch(`${API_BASE_URL}/invitations`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteInvitation(invitationId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }



  // Dashboard endpoints
  async getUserDashboard(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<any>>(response);
    return result;
  }

  async getAdminDashboard(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<any>>(response);
    return result;
  }

  // Legacy endpoint for backward compatibility
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<DashboardStats>>(response);
    return result;
  }

  // Export endpoints
  async exportData(type: 'events' | 'users' | 'attendance', options: ExportOptions): Promise<Blob> {
    const params = new URLSearchParams({
      format: options.format,
      ...(options.filters && { filters: JSON.stringify(options.filters) }),
      ...(options.includeHeaders !== undefined && { includeHeaders: options.includeHeaders.toString() }),
    });

    const response = await fetch(`${API_BASE_URL}/export/${type}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Export failed' }));
      throw new Error(error.message || `Export failed! status: ${response.status}`);
    }

    return response.blob();
  }

  // Verification endpoints
  async sendVerificationEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/send-verification-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return this.handleResponse(response);
  }

  // QR Code endpoints
  async generateQRCode(eventId: string, expirationHours?: number): Promise<ApiResponse<{
    qrCode: string;
    qrData: string;
    frontendUrl: string;
    expiresAt: string;
    eventId: string;
    type: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/generate-qr`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ expirationHours }),
    });
    return this.handleResponse(response);
  }

  async validateCheckinToken(eventId: string, token: string): Promise<ApiResponse<{
    eventId: string;
    eventTitle: string;
    startDate: string;
    endDate: string;
    registrationRequired: boolean;
    registrationDeadline: string | null;
    maxAttendees: number | null;
    currentAttendees: number;
    isValid: boolean;
    expiresAt: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/validate-checkin-token?token=${encodeURIComponent(token)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse(response);
  }

  async checkinWithToken(eventId: string, token: string): Promise<ApiResponse<Attendance>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/checkin-with-token`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ token }),
    });
    return this.handleResponse(response);
  }

  async getQRStatus(eventId: string): Promise<ApiResponse<{
    id: string;
    eventId: string;
    type: string;
    expiresAt: string;
    createdAt: string;
    event: {
      title: string;
      startDate: string;
      endDate: string;
    };
  } | null>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/qr-status`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async revokeQRCode(eventId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/revoke-qr`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

}

export const apiService = new ApiService();
