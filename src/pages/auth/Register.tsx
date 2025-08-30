import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Lock, Eye, EyeOff, User, UserCheck, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Base schema for common fields
const baseSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  gender: z.enum(['MALE', 'FEMALE'], { required_error: 'Please select your gender' }),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

// Email registration schema
const emailRegisterSchema = baseSchema.extend({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Phone registration schema
const phoneRegisterSchema = baseSchema.extend({
  phone: z.string().min(10, 'Please enter a valid phone number').refine((phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // UK phone number patterns:
    // - 11 digits starting with 07 (mobile)
    // - 11 digits starting with 01 (landline)
    // - 10 digits starting with 7 (mobile without 0)
    // - 10 digits starting with 1 (landline without 0)
    // - 12 digits starting with 44 (international format)
    const ukPhonePattern = /^(44|0)?(7[0-9]{9}|1[0-9]{9}|2[0-9]{9}|3[0-9]{9}|5[0-9]{9}|8[0-9]{9}|9[0-9]{9})$/;
    
    return ukPhonePattern.test(cleanPhone);
  }, 'Please enter a valid UK phone number'),
});

type EmailRegisterForm = z.infer<typeof emailRegisterSchema>;
type PhoneRegisterForm = z.infer<typeof phoneRegisterSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'phone'>('phone');
  const navigate = useNavigate();
  const { register } = useAuth();

  const emailForm = useForm<EmailRegisterForm>({
    resolver: zodResolver(emailRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: undefined,
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const phoneForm = useForm<PhoneRegisterForm>({
    resolver: zodResolver(phoneRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: undefined,
      phone: '',
      acceptTerms: false,
    },
  });

  const onEmailSubmit = async (data: EmailRegisterForm) => {
    setIsLoading(true);
    try {
      const response = await register(data);
      
      toast.success('Account created! Please check your email for verification link to complete registration.');
      navigate(`/verification-required?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneRegisterForm) => {
    setIsLoading(true);
    try {
      const response = await register(data);
      
      toast.success('Account created! Please check your phone for OTP to complete login.');
      // Use window.location.href for a fresh page load to avoid state conflicts
      window.location.href = `/login?phone=${encodeURIComponent(data.phone)}&tab=otp`;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Common fields component
  const CommonFields = ({ form, isEmailForm }: { form: any, isEmailForm: boolean }) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`firstName-${isEmailForm ? 'email' : 'phone'}`}>First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id={`firstName-${isEmailForm ? 'email' : 'phone'}`}
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
          <Label htmlFor={`lastName-${isEmailForm ? 'email' : 'phone'}`}>Last Name</Label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id={`lastName-${isEmailForm ? 'email' : 'phone'}`}
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
        <Label htmlFor={`gender-${isEmailForm ? 'email' : 'phone'}`}>Gender</Label>
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
    </>
  );

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
            <CardTitle className="text-xl">Join Our Community</CardTitle>
            <CardDescription>
              Choose your preferred sign-up method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={registrationMethod} onValueChange={setRegistrationMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phone">
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                  <CommonFields form={phoneForm} isEmailForm={false} />
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="07123456789 or +447123456789"
                        className="pl-10"
                        {...phoneForm.register('phone')}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your UK phone number with or without country code (+44)
                    </p>
                    {phoneForm.formState.errors.phone && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription>
                          {phoneForm.formState.errors.phone.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms-phone"
                      checked={phoneForm.watch('acceptTerms')}
                      onCheckedChange={(checked) => phoneForm.setValue('acceptTerms', !!checked)}
                    />
                    <Label htmlFor="acceptTerms-phone" className="text-sm">
                      I accept the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        terms and conditions
                      </Link>
                    </Label>
                  </div>
                  {phoneForm.formState.errors.acceptTerms && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>
                        {phoneForm.formState.errors.acceptTerms.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Sign Up with Phone'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="email">
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <CommonFields form={emailForm} isEmailForm={true} />
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...emailForm.register('email')}
                      />
                    </div>
                    {emailForm.formState.errors.email && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription>
                          {emailForm.formState.errors.email.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        {...emailForm.register('password')}
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
                    {emailForm.formState.errors.password && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription>
                          {emailForm.formState.errors.password.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        {...emailForm.register('confirmPassword')}
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
                    {emailForm.formState.errors.confirmPassword && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription>
                          {emailForm.formState.errors.confirmPassword.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms-email"
                      checked={emailForm.watch('acceptTerms')}
                      onCheckedChange={(checked) => emailForm.setValue('acceptTerms', !!checked)}
                    />
                    <Label htmlFor="acceptTerms-email" className="text-sm">
                      I accept the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        terms and conditions
                      </Link>
                    </Label>
                  </div>
                  {emailForm.formState.errors.acceptTerms && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>
                        {emailForm.formState.errors.acceptTerms.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Sign Up with Email'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
