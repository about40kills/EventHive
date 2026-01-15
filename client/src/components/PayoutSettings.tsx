import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function PayoutSettings() {
    const { user, refreshUser } = useAuth(); // Assuming refreshUser exists, or we might need to implement it
    const { toast } = useToast();

    const [banks, setBanks] = useState<any[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);

    const [formData, setFormData] = useState({
        bankCode: user?.bankDetails?.bankCode || "",
        accountNumber: user?.bankDetails?.accountNumber || "",
        accountName: user?.bankDetails?.accountName || ""
    });

    const [resolvedName, setResolvedName] = useState("");
    const [isResolving, setIsResolving] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch banks on mount
    useEffect(() => {
        const fetchBanks = async () => {
            setLoadingBanks(true);
            try {
                const data = await apiClient.getBanks();
                setBanks(data);
            } catch (error) {
                console.error("Failed to fetch banks", error);
                toast({
                    title: "Error",
                    description: "Failed to load bank list. Please refresh.",
                    variant: "destructive"
                });
            } finally {
                setLoadingBanks(false);
            }
        };

        fetchBanks();
    }, []);

    useEffect(() => {
        if (user?.bankDetails) {
            setFormData({
                bankCode: user.bankDetails.bankCode || "",
                accountNumber: user.bankDetails.accountNumber || "",
                accountName: user.bankDetails.accountName || ""
            });
            if (user.bankDetails.accountName) {
                setResolvedName(user.bankDetails.accountName);
            }
        }

        // If no subaccount code, we should be in edit mode
        if (user && !user.paystackSubaccountCode) {
            setIsEditing(true);
        } else {
            setIsEditing(false);
        }
    }, [user]);

    // Validate bank code against loaded banks (handles Mock '025' vs Live switch)
    useEffect(() => {
        if (banks.length > 0 && formData.bankCode) {
            const isValid = banks.some((b: any) => b.code === formData.bankCode);
            if (!isValid) {
                console.warn(`Clearing invalid bank code: ${formData.bankCode}`);
                setFormData(prev => ({ ...prev, bankCode: "" }));
                setResolvedName("");
                toast({
                    title: "Action Required",
                    description: "Please re-select your bank. The saved bank code is invalid for the current payment provider.",
                    variant: "destructive"
                });
            }
        }
    }, [banks, formData.bankCode]);

    // Auto-verify account number with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (formData.bankCode && formData.accountNumber.length >= 10) {
                handleResolveAccount();
            }
        }, 1000); // Wait 1 second after typing stops

        return () => clearTimeout(delayDebounceFn);
    }, [formData.accountNumber, formData.bankCode]);

    const handleResolveAccount = async () => {
        if (!formData.bankCode || formData.accountNumber.length < 10) return;

        setIsResolving(true);
        setResolvedName("");
        try {
            const response = await apiClient.resolveAccount(formData.accountNumber, formData.bankCode);
            setResolvedName(response.account_name);
            setFormData(prev => ({ ...prev, accountName: response.account_name }));
            toast({
                title: "Account Verified",
                description: `Account name: ${response.account_name}`,
            });
        } catch (error) {
            console.error("Resolution error", error);
            setResolvedName("");
            toast({
                title: "Verification Failed",
                description: "Could not verify account details. Please check and try again.",
                variant: "destructive"
            });
        } finally {
            setIsResolving(false);
        }
    };

    const handleSave = async () => {
        if (!resolvedName) {
            toast({
                title: "Verify Account First",
                description: "Please enter your details and verify the account name before saving.",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            await apiClient.createSubaccount({
                bankCode: formData.bankCode,
                accountNumber: formData.accountNumber,
                businessName: user?.name || "Organizer"
            });

            toast({
                title: "Success",
                description: "Your payout details have been saved successfully.",
            });

            // basic refresh user workaround if method not available
            await refreshUser();
            setIsEditing(false);

        } catch (error) {
            console.error("Save error", error);
            toast({
                title: "Save Failed",
                description: "Failed to save payout details.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payout Settings</CardTitle>
                <CardDescription>
                    Add your bank account to receive payments from your events.
                    Payouts are processed automatically 24 hours after the event.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {user?.paystackSubaccountCode ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-green-900">Payout Account Connected</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    Your account <strong>{user.bankDetails?.bankName} - {user.bankDetails?.accountNumber}</strong> is active.
                                    Payment settlements will be sent here automatically.
                                </p>
                            </div>
                        </div>
                        {!isEditing && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="bg-white border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800">
                                Edit
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-yellow-900">Action Required</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                You must set up a payout account to create paid events and receive earnings.
                            </p>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="grid gap-4 max-w-xl animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Select
                                value={formData.bankCode}
                                onValueChange={(val) => {
                                    setFormData(prev => ({ ...prev, bankCode: val }));
                                    setResolvedName(""); // Reset verification if bank changes
                                }}
                                disabled={loadingBanks}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingBanks ? "Loading banks..." : "Select your bank"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {banks.map((bank: any) => (
                                        <SelectItem key={bank.code} value={bank.code}>
                                            {bank.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Account Number</Label>
                            <div className="relative">
                                <Input
                                    placeholder="1234567890"
                                    value={formData.accountNumber}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, accountNumber: e.target.value }));
                                        setResolvedName(""); // Reset verification if number changes
                                    }}
                                    maxLength={16}
                                    className="pr-10"
                                />
                                <div className="absolute right-3 top-2.5">
                                    {isResolving ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    ) : resolvedName ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {resolvedName && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>Account Name</Label>
                                <Input value={resolvedName} disabled readOnly className="bg-muted" />
                            </div>
                        )}

                        <div className="flex gap-3 mt-2">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !resolvedName}
                                className="flex-1"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Details...
                                    </>
                                ) : (
                                    "Save Payout Details"
                                )}
                            </Button>

                            {user?.paystackSubaccountCode && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
