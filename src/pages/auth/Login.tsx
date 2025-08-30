import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

const emailLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const otpLoginSchema = z.object({
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
  otp: z.string().length(6, 'Please enter the 6-digit OTP'),
});

type EmailLoginForm = z.infer<typeof emailLoginSchema>;
type OTPLoginForm = z.infer<typeof otpLoginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'otp'>('otp');
  
  // Reset loading states when component mounts
  useEffect(() => {
    setIsLoading(false);
    setOtpLoading(false);
    setOtpSent(false);
  }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithOTP, sendOTP } = useAuth();

  // Initialize forms first
  const emailForm = useForm<EmailLoginForm>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const otpForm = useForm<OTPLoginForm>({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: {
      phone: '',
      otp: '',
    },
  });

  const handleSendOTP = async () => {
    const phone = otpForm.getValues('phone');
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setOtpLoading(true);
    try {
      await sendOTP(phone);
      setOtpSent(true);
      toast.success('OTP sent to your phone');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle URL parameters for pre-filling phone and switching to OTP tab
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    const tabParam = searchParams.get('tab');
    
    // Reset ALL states to ensure clean state
    setOtpLoading(false);
    setIsLoading(false);
    setShowPassword(false);
    
    // Reset form values
    emailForm.reset();
    otpForm.reset();
    
    if (phoneParam) {
      // Decode the phone number (handles %2B for + and other encoded characters)
      const decodedPhone = decodeURIComponent(phoneParam);
      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        otpForm.setValue('phone', decodedPhone);
      }, 100);
      
      // If we have a phone parameter and tab=otp, it means we're coming from registration
      // The backend has already sent an OTP, so show the OTP input field
      if (tabParam === 'otp') {
        setOtpSent(true);
        toast.success('OTP has been sent to your phone. Please enter the code to complete login.');
      }
    }
    
    if (tabParam === 'email') {
      setActiveTab('email');
    } else {
      setActiveTab('otp');
    }
  }, [searchParams, otpForm, emailForm]);

  const onEmailSubmit = async (data: EmailLoginForm) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      
      // Check for redirect parameter
      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        navigate(redirectParam);
        return;
      }
      
      // Redirect based on user role
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
        navigate(isAdmin ? '/admin/dashboard' : '/events?filter=ongoing');
      } else {
        navigate('/events?filter=ongoing');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPLoginForm) => {
    setIsLoading(true);
    try {
      await loginWithOTP({ phone: data.phone, otp: data.otp });
      toast.success('Welcome back!');
      
      // Check for redirect parameter
      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        navigate(redirectParam);
        return;
      }
      
      // Redirect based on user role
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
        navigate(isAdmin ? '/admin/dashboard' : '/events?filter=ongoing');
      } else {
        navigate('/events?filter=ongoing');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'otp')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="otp" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
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
                        placeholder="Enter your password"
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

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="otp">
                <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="07123456789 or +447123456789"
                        className="pl-10"
                        {...otpForm.register('phone')}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your UK phone number with or without country code (+44)
                    </p>
                    {otpForm.formState.errors.phone && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription>
                          {otpForm.formState.errors.phone.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {otpSent && (
                    <div className="space-y-2">
                      <Label htmlFor="otp">OTP Code</Label>
                      <InputOTP
                        maxLength={6}
                        value={otpForm.watch('otp')}
                        onChange={(value) => otpForm.setValue('otp', value)}
                        className="justify-center"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      {otpForm.formState.errors.otp && (
                        <Alert variant="destructive" className="py-2">
                          <AlertDescription>
                            {otpForm.formState.errors.otp.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!otpSent ? (
                      <Button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                        className="flex-1"
                      >
                        {otpLoading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendOTP}
                          disabled={otpLoading}
                          className="flex-1"
                        >
                          {otpLoading ? 'Sending...' : 'Resend OTP'}
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isLoading}>
                          {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
