import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { toast } from 'react-hot-toast';

const VerificationRequired = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isResent, setIsResent] = useState(false);

  // Send verification email mutation
  const sendVerificationMutation = useMutation({
    mutationFn: (email: string) => apiService.sendVerificationEmail(email),
    onSuccess: () => {
      toast.success('Verification email sent successfully!');
      setIsResent(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send verification email');
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => apiService.verifyEmail(token),
    onSuccess: (data) => {
      toast.success('Email verified successfully!');
      // Store the auth token and redirect to dashboard
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify email');
    },
  });

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    sendVerificationMutation.mutate(email);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get('token');
    if (!token) {
      toast.error('No verification token found');
      return;
    }
    verifyEmailMutation.mutate(token);
  };

  // Check if we have a verification token in URL (handle both /verification-required and /verify-email routes)
  const hasVerificationToken = searchParams.get('token');

  if (hasVerificationToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription>
              Click the button below to verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={verifyEmailMutation.isPending}
              >
                {verifyEmailMutation.isPending ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Account Verification Required
          </CardTitle>
          <CardDescription>
            Please verify your email address to access your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isResent && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Verification email sent! Please check your inbox and click the verification link.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSendVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={sendVerificationMutation.isPending}
            >
              <Mail className="mr-2 h-4 w-4" />
              {sendVerificationMutation.isPending 
                ? 'Sending...' 
                : isResent 
                  ? 'Resend Verification Email' 
                  : 'Send Verification Email'
              }
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already verified? 
              <Button
                variant="link"
                onClick={() => navigate('/login')}
                className="p-0 h-auto text-sm"
              >
                Sign in here
              </Button>
            </p>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationRequired;
