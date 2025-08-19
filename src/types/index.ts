export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  role: 'admin' | 'subadmin' | 'user';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxAttendees?: number;
  currentAttendees: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  category: 'prayer' | 'lecture' | 'community' | 'education' | 'charity' | 'social';
  imageUrl?: string;
  registrationRequired: boolean;
  registrationDeadline?: Date;
}

export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'REGISTERED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'NO_SHOW';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  event: Event;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registrationDate: Date;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  user: User;
  event: Event;
}

export interface Invitation {
  id: string;
  email: string;
  phone?: string | null;
  role: 'USER' | 'SUBADMIN';
  token: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  isAccepted: boolean;
  acceptedAt?: string | null;
  invitedByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventFilters {
  category?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  search?: string;
}

export interface UserFilters {
  role?: string;
  isVerified?: boolean;
  search?: string;
}

export interface AttendanceFilters {
  eventId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
}

export interface OTPVerification {
  phone: string;
  otp: string;
}

export interface InvitationAcceptance {
  token: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  email?: string;
  phone?: string;
  password?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  role?: 'ADMIN' | 'SUBADMIN' | 'USER';
  profileImage?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxAttendees?: number;
  category: string;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  imageUrl?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  isActive?: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalAttendance: number;
  thisMonthAttendance: number;
  activeRegistrations: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  filters?: EventFilters | UserFilters | AttendanceFilters;
  includeHeaders?: boolean;
}
