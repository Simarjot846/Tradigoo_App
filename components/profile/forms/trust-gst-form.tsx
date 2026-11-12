'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrustScoreCard } from '@/components/ui/trust-score-card';
import { createClient } from '@/lib/supabase-client';
import { Building2, Landmark, CheckCircle2, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TrustGstFormProps {
  profile: any;
  onUpdate: () => void;
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function TrustGstForm({ profile, onUpdate }: TrustGstFormProps) {
  const bankDetails =
    profile?.bank_details && typeof profile.bank_details === 'object'
      ? profile.bank_details
      : {};

  const [gstin, setGstin] = useState(profile?.gst_number || '');
  const [pan, setPan] = useState(bankDetails?.pan || '');
  const [bankName, setBankName] = useState(bankDetails?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(bankDetails?.account_number || '');
  const [ifsc, setIfsc] = useState(bankDetails?.ifsc || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const details =
      profile?.bank_details && typeof profile.bank_details === 'object'
        ? profile.bank_details
        : {};
    setGstin(profile?.gst_number || '');
    setPan(details?.pan || '');
    setBankName(details?.bank_name || '');
    setAccountNumber(details?.account_number || '');
    setIfsc(details?.ifsc || '');
  }, [profile]);

  const isFormatValid = !gstin.trim() || GSTIN_REGEX.test(gstin.trim().toUpperCase());

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedGstin = gstin.trim().toUpperCase();

    if (cleanedGstin && !GSTIN_REGEX.test(cleanedGstin)) {
      toast.error('Please enter a valid 15-character GSTIN (e.g. 27AABCU9603R1ZN).');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          gst_number: cleanedGstin || null,
          bank_details: {
            pan: pan.trim().toUpperCase() || null,
            bank_name: bankName.trim() || null,
            account_number: accountNumber.trim() || null,
            ifsc: ifsc.trim().toUpperCase() || null,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success(
        profile?.gst_verified
          ? 'Compliance and payout details updated.'
          : 'GSTIN and payout details saved. Founder compliance review pending.'
      );
      onUpdate();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save compliance details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <TrustScoreCard
        trustScore={profile?.trust_score}
        gstVerified={profile?.gst_verified}
        totalOrders={profile?.total_orders}
        successfulOrders={profile?.successful_orders}
        disputedOrders={profile?.disputed_orders}
        isLowTrust={profile?.is_low_trust}
        businessName={profile?.business_name}
      />

      {/* GSTIN & Tax Registration */}
      <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                GSTIN &amp; Tax Compliance
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Submit your registered GSTIN for B2B tax invoicing and verified supplier status
              </p>
            </div>
          </div>

          {profile?.gst_verified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Compliance
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" /> {gstin ? 'Pending Verification' : 'Not Submitted'}
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="gstin" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              GSTIN Number (15 characters)
            </Label>
            <Input
              id="gstin"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 27AABCU9603R1ZN"
              className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 uppercase font-mono text-sm"
              maxLength={15}
            />
            {!isFormatValid && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Format: 2-digit state code + 10-char PAN + 1 entity + Z + check digit
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pan" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Business PAN
            </Label>
            <Input
              id="pan"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="e.g. ABCDE1234F"
              className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 uppercase font-mono text-sm"
              maxLength={10}
            />
          </div>
        </div>
      </Card>

      {/* Escrow Settlement Payout Account */}
      <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Escrow Settlement Bank Account
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Bank account for released escrow settlements and dispute refunds
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bankName" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Bank Name
            </Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. HDFC Bank"
              className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountNumber" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Account Number
            </Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter business account number"
              className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifsc" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              IFSC Code
            </Label>
            <Input
              id="ifsc"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0001234"
              className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 uppercase font-mono text-sm"
              maxLength={11}
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          Changes are persisted securely to your partner profile.
        </p>
        <Button
          type="submit"
          disabled={saving}
          className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shrink-0"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {saving ? 'Saving...' : 'Save Compliance Details'}
        </Button>
      </div>
    </form>
  );
}
