import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Lock, Eye, EyeOff, User, UserCheck, Users } from 'lucide-react';
import { apiService } from '@/services/api';
import { InvitationAcceptance } from '@/types';
import { toast } from 'react-hot-toast';

const invitationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  gender: z.enum(['MALE', 'FEMALE'], { required_error: 'Please select your gender' }),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => {
  // At least one contact method is required (handle empty strings)
  const hasEmail = data.email && data.email.trim() !== '';
  const hasPhone = data.phone && data.phone.trim() !== '';
  
  if (!hasEmail && !hasPhone) {
    return false;
  }
  return true;
}, {
  message: "Either email or phone number is required",
  path: ["email"],
}).refine((data) => {
  // Password and confirmPassword must match
  if (data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  const hasPhone = data.phone && data.phone.trim() !== '';
  
  if (hasPhone) {
    // Remove all non-digit characters
    const cleanPhone = data.phone.replace(/\D/g, '');
    
    // UK phone number patterns:
    // - 11 digits starting with 07 (mobile)
    // - 11 digits starting with 01 (landline)
    // - 10 digits starting with 7 (mobile without 0)
    // - 10 digits starting with 1 (landline without 0)
    // - 12 digits starting with 44 (international format)
    const ukPhonePattern = /^(44|0)?(7[0-9]{9}|1[0-9]{9}|2[0-9]{9}|3[0-9]{9}|5[0-9]{9}|8[0-9]{9}|9[0-9]{9})$/;
    
    if (!ukPhonePattern.test(cleanPhone)) {
      return false;
    }
  }
  return true;
}, {
  message: "Please enter a valid UK phone number",
  path: ["phone"],
});

type InvitationForm = z.infer<typeof invitationSchema>;

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  const form = useForm<InvitationForm>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: undefined,
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Verify invitation token
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Please contact the administrator.');
      return;
    }

    const verifyInvitation = async () => {
      try {
        const response = await apiService.verifyInvitation(token);
        setInvitation(response.data);
      } catch (error: any) {
        setError(error.message || 'Invalid or expired invitation link');
      }
    };

    verifyInvitation();
  }, [token]);

  const onSubmit = async (data: InvitationForm) => {
    if (!token) {
      toast.error('Invalid invitation token');
      return;
    }

    setIsLoading(true);
    try {
      const invitationData: InvitationAcceptance = {
        token,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        email: data.email || undefined,
        phone: data.phone || undefined,
        password: data.password,
      };

      const response = await apiService.acceptInvitation(invitationData);
      
      // Auto-login the user after successful invitation acceptance
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      toast.success('Account created successfully! Welcome to the community.');
      
      // Redirect based on user role
      const userRole = response.data.user.role?.toLowerCase();
      const isAdmin = userRole === 'admin' || userRole === 'subadmin';
      navigate(isAdmin ? '/admin/dashboard' : '/events?filter=ongoing');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-gold/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-islamic rounded-full">
                <img src="/src/assets/mosque-logo.png" alt="Assalatur Rahman Logo" className="h-8 w-8 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Assalatur Rahman</h1>
            <p className="text-muted-foreground">Islamic Association</p>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardContent className="p-8 text-center">
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => navigate('/')}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-gold/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-islamic rounded-full">
                <img src="/src/assets/mosque-logo.png" alt="Assalatur Rahman Logo" className="h-8 w-8 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Assalatur Rahman</h1>
            <p className="text-muted-foreground">Islamic Association</p>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verifying invitation...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-gold/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-islamic rounded-full">
              <img src="/src/assets/mosque-logo.png" alt="Assalatur Rahman Logo" className="h-8 w-8 object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Assalatur Rahman</h1>
          <p className="text-muted-foreground">Islamic Association</p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Accept Invitation</CardTitle>
            <CardDescription>
              Complete your registration to join our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      className="pl-10"
                      {...form.register('firstName')}
                    />
                  </div>
                  {form.formState.errors.firstName && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>
                        {form.formState.errors.firstName.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      className="pl-10"
                      {...form.register('lastName')}
                    />
                  </div>
                  {form.formState.errors.lastName && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>
                        {form.formState.errors.lastName.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={(value) => form.setValue('gender', value as 'MALE' | 'FEMALE')}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.formState.errors.gender && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {form.formState.errors.gender.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...form.register('email')}
                  />
                </div>
                {form.formState.errors.email && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {form.formState.errors.email.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10"
                    {...form.register('phone')}
                  />
                </div>
                {form.formState.errors.phone && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {form.formState.errors.phone.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    {...form.register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {form.formState.errors.password.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {form.watch('password') && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      {...form.register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>
                        {form.formState.errors.confirmPassword.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Accept Invitation & Create Account'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
                    Sign in
                  </Button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvitation;
