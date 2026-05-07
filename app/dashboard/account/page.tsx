'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [accountData, setAccountData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    bankName: '',
    bankAccountNumber: '',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);

      // Get account details
      const profileDetails = JSON.parse(localStorage.getItem('tavonlex_profile_details') || '{}');
      const userDetails = profileDetails[currentUser.id] || {};

      setAccountData(userDetails);
      setFormData({
        bankName: userDetails.bankName || '',
        bankAccountNumber: userDetails.bankAccountNumber || '',
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileDetails = JSON.parse(localStorage.getItem('tavonlex_profile_details') || '{}');
      profileDetails[user.id] = {
        ...profileDetails[user.id],
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
      };
      localStorage.setItem('tavonlex_profile_details', JSON.stringify(profileDetails));

      setAccountData(profileDetails[user.id]);
      setEditing(false);
      setMessage('Account details saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save account details');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Details</h1>
        <p className="text-muted-foreground">Manage your bank and payment information</p>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bank Information</CardTitle>
          <CardDescription>Your payment details for course earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {!editing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Bank Name</Label>
                <p className="text-lg">{accountData?.bankName || '-'}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Account Number</Label>
                <p className="text-lg">{accountData?.bankAccountNumber ? `****${accountData.bankAccountNumber.slice(-4)}` : '-'}</p>
              </div>

              <Button onClick={() => setEditing(true)}>Edit Bank Details</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Your Bank"
                  value={formData.bankName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  placeholder="Account Number"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Note: 4% commission will be deducted from your course earnings.
              </p>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  setFormData({
                    bankName: accountData?.bankName || '',
                    bankAccountNumber: accountData?.bankAccountNumber || '',
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Information</CardTitle>
          <CardDescription>How earnings work on Tavonlex</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Commission Rate</h4>
            <p className="text-lg font-bold text-primary">4%</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Example</h4>
            <p className="text-sm text-muted-foreground">
              If you earn $100 from a course, you'll receive $96 after the 4% commission.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
