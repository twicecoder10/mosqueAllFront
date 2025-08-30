import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, RefreshCw, X, Clock, CheckCircle, AlertCircle, Eye, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import { toast } from 'react-hot-toast';
import { safeFormatDate } from '@/utils/dateUtils';

interface QRCodeManagerProps {
  eventId: string;
  eventTitle: string;
  isAdmin: boolean;
}

const QRCodeManager: React.FC<QRCodeManagerProps> = ({ eventId, eventTitle, isAdmin }) => {
  const [expirationHours, setExpirationHours] = useState(24);
  const [showQR, setShowQR] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch QR status
  const { data: qrStatusResponse, isLoading: qrStatusLoading, refetch: refetchQRStatus } = useQuery({
    queryKey: ['qr-status', eventId],
    queryFn: () => apiService.getQRStatus(eventId),
    enabled: !!eventId && isAdmin,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const qrStatus = qrStatusResponse?.data;

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: () => apiService.generateQRCode(eventId, expirationHours),
    onSuccess: (data) => {
      toast.success('QR code generated successfully!');
      setShowQR(true);
      queryClient.invalidateQueries({ queryKey: ['qr-status', eventId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate QR code');
    },
  });

  // Fetch existing QR code data if there's an active QR code
  const { data: existingQRData } = useQuery({
    queryKey: ['existing-qr-data', eventId],
    queryFn: () => apiService.generateQRCode(eventId, 24), // Use default expiration
    enabled: !!eventId && isAdmin && !!qrStatus && !generateQRMutation.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const qrData = generateQRMutation.data?.data || existingQRData?.data;

  // Auto-show QR code if one exists
  useEffect(() => {
    if (qrStatus && !generateQRMutation.data) {
      setShowQR(true);
    }
  }, [qrStatus]);

  // Revoke QR code mutation
  const revokeQRMutation = useMutation({
    mutationFn: () => apiService.revokeQRCode(eventId),
    onSuccess: () => {
      toast.success('QR code revoked successfully!');
      setShowQR(false);
      queryClient.invalidateQueries({ queryKey: ['qr-status', eventId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke QR code');
    },
  });

  const handleGenerateQR = () => {
    generateQRMutation.mutate();
  };

  const handleRevokeQR = () => {
    revokeQRMutation.mutate();
  };

  const handleShareQR = async () => {
    if (!qrData?.frontendUrl) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check-in for ${eventTitle}`,
          text: `Scan this QR code to check in for ${eventTitle}`,
          url: qrData.frontendUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(qrData.frontendUrl);
        toast.success('Check-in URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share QR code');
    }
  };

  const handleDownloadQR = () => {
    if (!qrData?.qrCode) return;
    
    try {
      const link = document.createElement('a');
      link.href = qrData.qrCode;
      link.download = `qr-code-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded!');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download QR code');
    }
  };

  const isQRExpired = () => {
    if (!qrStatus?.expiresAt) return false;
    return new Date() > new Date(qrStatus.expiresAt);
  };

  const getTimeUntilExpiry = () => {
    if (!qrStatus?.expiresAt) return '';
    const now = new Date();
    const expiry = new Date(qrStatus.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Status */}
        {qrStatusLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : qrStatus ? (
          <div className="space-y-4">
            {/* Active QR Code */}
            <Alert className={isQRExpired() ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              {isQRExpired() ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription className="text-sm">
                <div className="flex items-center justify-between">
                  <span>
                    {isQRExpired() ? 'QR Code has expired' : 'QR Code is active'}
                  </span>
                  <Badge variant={isQRExpired() ? 'destructive' : 'default'}>
                    {getTimeUntilExpiry()}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Created: {safeFormatDate(qrStatus.createdAt, 'MMM dd, yyyy h:mm a')}
                </div>
              </AlertDescription>
            </Alert>

                         {/* QR Code Display */}
             {showQR && qrData && (
               <div className="text-center space-y-4 p-4 border rounded-lg bg-gray-50">
                 <div className="flex justify-center">
                   <img 
                     src={qrData.qrCode} 
                     alt="QR Code" 
                     className="max-w-48 h-auto border rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                     onClick={() => setShowQRModal(true)}
                   />
                 </div>
                 <div className="text-xs text-muted-foreground space-y-1">
                   <p><strong>Expires:</strong> {safeFormatDate(qrData.expiresAt, 'MMM dd, yyyy h:mm a')}</p>
                   <p className="text-xs">Click QR code to view larger</p>
                 </div>
                 <div className="flex gap-2 justify-center flex-wrap">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       navigator.clipboard.writeText(qrData.frontendUrl);
                       toast.success('URL copied to clipboard!');
                     }}
                   >
                     Copy URL
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={handleShareQR}
                   >
                     <Share2 className="h-4 w-4 mr-1" />
                     Share
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={handleDownloadQR}
                   >
                     <Download className="h-4 w-4 mr-1" />
                     Download
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setShowQR(false)}
                   >
                     Hide QR
                   </Button>
                 </div>
               </div>
             )}

             {/* View QR Button when hidden */}
             {!showQR && qrData && (
               <div className="text-center space-y-4 p-4 border rounded-lg bg-gray-50">
                 <div className="space-y-2">
                   <p className="text-sm text-muted-foreground">QR Code is hidden</p>
                   <div className="flex gap-2 justify-center flex-wrap">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowQR(true)}
                     >
                       <Eye className="h-4 w-4 mr-1" />
                       View QR Code
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowQRModal(true)}
                     >
                       <QrCode className="h-4 w-4 mr-1" />
                       View Large
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleShareQR}
                     >
                       <Share2 className="h-4 w-4 mr-1" />
                       Share
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleDownloadQR}
                     >
                       <Download className="h-4 w-4 mr-1" />
                       Download
                     </Button>
                   </div>
                 </div>
               </div>
             )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!showQR && (
                <Button
                  onClick={handleGenerateQR}
                  disabled={generateQRMutation.isPending}
                  className="flex-1"
                >
                  {generateQRMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate New QR
                    </>
                  )}
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={revokeQRMutation.isPending}>
                    {revokeQRMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Revoke QR
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke QR Code</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to revoke the current QR code? This will immediately invalidate it and users won't be able to check in using it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRevokeQR}>
                      Revoke QR Code
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          /* No Active QR Code */
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No active QR code found. Generate one to enable QR code check-ins for this event.
              </AlertDescription>
            </Alert>

            {/* Generate QR Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expirationHours">Expiration Time (hours)</Label>
                <Input
                  id="expirationHours"
                  type="number"
                  min="1"
                  max="168" // 1 week max
                  value={expirationHours}
                  onChange={(e) => setExpirationHours(parseInt(e.target.value) || 24)}
                  placeholder="24"
                />
                <p className="text-xs text-muted-foreground">
                  QR code will expire after this many hours (1-168 hours)
                </p>
              </div>

              <Button
                onClick={handleGenerateQR}
                disabled={generateQRMutation.isPending}
                className="w-full"
              >
                {generateQRMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

                 {/* Instructions */}
         <div className="text-xs text-muted-foreground space-y-1">
           <p><strong>How it works:</strong></p>
           <ul className="list-disc list-inside space-y-1 ml-2">
             <li>Generate a QR code for this event</li>
             <li>Display the QR code for attendees to scan</li>
             <li>Attendees scan with any QR scanner app or camera</li>
             <li>QR code opens the app directly with check-in page</li>
             <li>System automatically validates and processes check-ins</li>
             <li>Revoke QR code when no longer needed</li>
           </ul>
                  </div>
       </CardContent>

       {/* QR Code Modal */}
       {qrData && (
         <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                 <QrCode className="h-5 w-5" />
                 QR Code for {eventTitle}
               </DialogTitle>
             </DialogHeader>
             <div className="text-center space-y-4">
               <div className="flex justify-center">
                 <img 
                   src={qrData.qrCode} 
                   alt="QR Code" 
                   className="max-w-64 h-auto border rounded-lg"
                 />
               </div>
               <div className="text-sm text-muted-foreground space-y-1">
                 <p><strong>Event:</strong> {eventTitle}</p>
                 <p><strong>Expires:</strong> {safeFormatDate(qrData.expiresAt, 'MMM dd, yyyy h:mm a')}</p>
                 <p><strong>URL:</strong> {qrData.frontendUrl}</p>
               </div>
               <div className="flex gap-2 justify-center flex-wrap">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     navigator.clipboard.writeText(qrData.frontendUrl);
                     toast.success('URL copied to clipboard!');
                   }}
                 >
                   Copy URL
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handleShareQR}
                 >
                   <Share2 className="h-4 w-4 mr-1" />
                   Share
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handleDownloadQR}
                 >
                   <Download className="h-4 w-4 mr-1" />
                   Download
                 </Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>
       )}
     </Card>
   );
 };

export default QRCodeManager;
