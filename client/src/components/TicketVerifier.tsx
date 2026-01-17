import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useVerifyTicket } from "@/hooks/useRegistrations";
import { Loader2, CheckCircle2, XCircle, Search, QrCode, Camera } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';

export function TicketVerifier() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const verifyTicketMutation = useVerifyTicket();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount or verify if code usage
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlCode = searchParams.get('code');

        if (urlCode) {
            setCode(urlCode);
            performVerification(urlCode);
        } else if (!isScanning) {
            inputRef.current?.focus();
        }
    }, [isScanning]);

    const performVerification = async (ticketCode: string) => {
        if (!ticketCode.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const data = await verifyTicketMutation.mutateAsync(ticketCode.trim());
            setResult({
                status: 'success',
                data: data
            });
            toast({
                title: "Ticket Verified",
                description: "Validation successful.",
                variant: 'default'
            });
        } catch (error: any) {
            console.error('Verification failed:', error);
            setResult({
                status: 'error',
                message: error.message || 'Invalid Ticket'
            });
            toast({
                title: "Verification Failed",
                description: error.message || "Could not verify ticket",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            if (!isScanning) {
                // Re-focus for next scan if not in camera mode
                inputRef.current?.focus();
                // Select all text to make next scan overwrite
                setTimeout(() => inputRef.current?.select(), 100);
            }
        }
    };

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        performVerification(code);
    };

    const handleScan = (detectedCodes: any[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const rawValue = detectedCodes[0].rawValue;
            if (rawValue) {
                setCode(rawValue);
                setIsScanning(false);
                performVerification(rawValue);
            }
        }
    };

    const clear = () => {
        setCode("");
        setResult(null);
        inputRef.current?.focus();
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
                    ← Back to Dashboard
                </Button>
            </div>

            <Card className="shadow-lg border-2">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-fit">
                        <QrCode className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Verify Ticket</CardTitle>
                    <p className="text-muted-foreground">
                        Scan with your camera or enter the Ticket ID manually.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isScanning ? (
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-lg border-2 border-primary/50 aspect-square max-w-sm mx-auto relative bg-black">
                                <Scanner
                                    onScan={handleScan}
                                    onError={(error) => console.log((error as Error)?.message || error)}
                                    components={{
                                        finder: true,
                                    }}
                                    styles={{
                                        container: { width: '100%', height: '100%' },
                                    }}
                                />
                                <div className="absolute top-4 right-4 z-10">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="rounded-full opacity-80"
                                        onClick={() => setIsScanning(false)}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" /> Close
                                    </Button>
                                </div>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                Point camera at the QR code
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 text-lg gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                                onClick={() => setIsScanning(true)}
                            >
                                <Camera className="w-5 h-5" />
                                Scan with Camera
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or enter code
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleVerify} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        ref={inputRef}
                                        placeholder="EH-..."
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="pl-9 h-12 text-lg font-mono"
                                        autoFocus
                                    />
                                </div>
                                <Button type="submit" size="lg" disabled={loading || !code}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                                </Button>
                            </form>
                        </div>
                    )}

                    {result && !isScanning && (
                        <div className={`rounded-xl border p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ${result.status === 'success' ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'
                            }`}>
                            <div className="flex items-start gap-4">
                                {result.status === 'success' ? (
                                    <CheckCircle2 className="w-8 h-8 text-green-600 mt-1" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-600 mt-1" />
                                )}

                                <div className="flex-1 space-y-1">
                                    <h3 className={`text-xl font-bold ${result.status === 'success' ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                        {result.status === 'success' ? 'Valid Ticket' : 'Invalid Ticket'}
                                    </h3>

                                    {result.status === 'success' && (
                                        <div className="mt-4 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 bg-white/60 rounded-lg">
                                                    <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-1">Attendee</span>
                                                    <span className="font-semibold text-base">{result.data.attendee}</span>
                                                </div>
                                                <div className="p-3 bg-white/60 rounded-lg">
                                                    <span className="text-muted-foreground text-xs uppercase tracking-wider block mb-1">Event</span>
                                                    <div className="flex items-center gap-3">
                                                        {result.data.eventImage && (
                                                            <img
                                                                src={result.data.eventImage.startsWith('http') ? result.data.eventImage : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'}${result.data.eventImage}`}
                                                                alt={result.data.event}
                                                                className="w-10 h-10 rounded-md object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <span className="font-semibold text-base line-clamp-1">{result.data.event}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-white/60 rounded-lg border border-green-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-muted-foreground">Ticket Details</span>
                                                    <Badge variant={result.data.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                                                        {result.data.paymentStatus}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    {result.data.tickets.map((t: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center text-sm font-medium text-slate-700">
                                                            <span>{t.name}</span>
                                                            <span>x{t.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="text-xs text-center text-muted-foreground pt-2">
                                                Ticket ID: {code}
                                            </div>
                                        </div>
                                    )}

                                    {result.status === 'error' && (
                                        <p className="text-red-600 mt-1">{result.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                {!isScanning && (
                    <CardFooter className="justify-center text-sm text-muted-foreground">
                        <p>Press Enter to verify. </p>
                        {result && (
                            <Button variant="ghost" onClick={clear} className="px-2 h-auto text-primary underline">
                                Clear
                            </Button>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
