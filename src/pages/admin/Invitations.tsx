import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Send, Trash2, Copy, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { safeFormatDate } from '@/utils/dateUtils';
import { toast } from 'react-hot-toast';

const Invitations = () => {
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteType, setInviteType] = useState<'single' | 'bulk'>('single');
  const [emails, setEmails] = useState<string>('');
  const [role, setRole] = useState<'USER' | 'SUBADMIN'>('USER');

  // Fetch invitations data
  const { data: invitationsResponse, isLoading, error } = useQuery({
    queryKey: ['invitations'],
    queryFn: () => apiService.getInvitations(),
  });

  const invitations = invitationsResponse?.data || [];

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: (data: { email: string; role: 'USER' | 'SUBADMIN' }) => 
      apiService.inviteUser(data),
    onSuccess: () => {
      toast.success('Invitation sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      setIsInviteDialogOpen(false);
      setEmails('');
      setRole('USER');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });

  // Bulk invite mutation
  const bulkInviteMutation = useMutation({
    mutationFn: (invitations: Array<{ email?: string; phone?: string; role: 'USER' | 'SUBADMIN' }>) => 
      apiService.bulkInviteUsers(invitations),
    onSuccess: (data) => {
      const { success, failed } = data.data;
      const successCount = success.length;
      const failedCount = failed.length;
      
      if (successCount > 0) {
        toast.success(`${successCount} invitation(s) sent successfully!`);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} invitation(s) failed. Check the details.`);
        // Log failed invitations for debugging
        console.log('Failed invitations:', failed);
      }
      
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      setIsInviteDialogOpen(false);
      setEmails('');
      setRole('USER');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send bulk invitations');
    },
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => apiService.deleteInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete invitation');
    },
  });

  const handleSendInvitation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    
    if (emailList.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    if (inviteType === 'single') {
      // Single invitation
      const invitationData = {
        email: emailList[0],
        role: role,
      };
      sendInvitationMutation.mutate(invitationData);
    } else {
      // Bulk invitation
      const invitations = emailList.map(email => ({
        email,
        role: role,
      }));
      bulkInviteMutation.mutate(invitations);
    }
  };

  const handleDeleteInvitation = (invitationId: string) => {
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      deleteInvitationMutation.mutate(invitationId);
    }
  };

  const copyInvitationLink = (invitation: any) => {
    const link = `${window.location.origin}/register?token=${invitation.token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'subadmin': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Invitations</h1>
              <p className="text-muted-foreground">
                Send and manage user invitations.
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 text-warning mx-auto mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
              <p className="text-muted-foreground mb-4">
                Unable to load invitations data. Please try again later.
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
            <h1 className="text-3xl font-bold text-foreground">Invitations</h1>
            <p className="text-muted-foreground">
              Send and manage user invitations.
            </p>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Send Invitation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div className="space-y-2">
                  <Label>Invitation Type</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={inviteType === 'single' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInviteType('single')}
                    >
                      Single
                    </Button>
                    <Button
                      type="button"
                      variant={inviteType === 'bulk' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInviteType('bulk')}
                    >
                      Bulk
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emails">
                    {inviteType === 'single' ? 'Email Address' : 'Email Addresses (comma-separated)'}
                  </Label>
                  <Textarea
                    id="emails"
                    name="emails"
                    placeholder={inviteType === 'single' ? 'Enter email address' : 'Enter email addresses separated by commas'}
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    rows={inviteType === 'single' ? 1 : 3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value: 'USER' | 'SUBADMIN') => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="SUBADMIN">Subadmin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>



                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendInvitationMutation.isPending || bulkInviteMutation.isPending}
                  >
                    {sendInvitationMutation.isPending || bulkInviteMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        {inviteType === 'single' ? 'Sending...' : 'Sending Bulk Invitations...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {inviteType === 'single' ? 'Send Invitation' : 'Send Bulk Invitations'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invitations</p>
                  <p className="text-2xl font-bold">{invitations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold">
                    {invitations.filter((i: any) => i.isAccepted).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {invitations.filter((i: any) => !i.isAccepted && new Date(i.expiresAt) > new Date()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold">
                    {invitations.filter((i: any) => !i.isAccepted && new Date(i.expiresAt) <= new Date()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invitations Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : invitations.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Invitations ({invitations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation: any) => {
                    const isExpired = new Date(invitation.expiresAt) <= new Date();
                    const status = invitation.isAccepted ? 'accepted' : isExpired ? 'expired' : 'pending';
                    
                    return (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">
                          {invitation.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(invitation.role?.toLowerCase())}>
                            {invitation.role?.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invitation.invitedByUser ? (
                            <div>
                              <p className="font-medium">{invitation.invitedByUser.firstName} {invitation.invitedByUser.lastName}</p>
                              <p className="text-sm text-muted-foreground">{invitation.invitedByUser.email}</p>
                            </div>
                          ) : (
                            'Unknown'
                          )}
                        </TableCell>
                        <TableCell>
                          {safeFormatDate(invitation.invitedAt, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {invitation.expiresAt 
                            ? safeFormatDate(invitation.expiresAt, 'MMM dd, yyyy')
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyInvitationLink(invitation)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteInvitation(invitation.id)}
                              disabled={deleteInvitationMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Invitations</h3>
              <p className="text-muted-foreground mb-4">
                You haven't sent any invitations yet. Start inviting new members to your community!
              </p>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Send First Invitation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Invitations;
