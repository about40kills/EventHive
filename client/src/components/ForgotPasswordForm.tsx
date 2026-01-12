import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { SERVER_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError("");

    try {
      const response = await fetch(`${SERVER_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setIsEmailSent(true);
      toast({
        title: "Reset link successfully sent!",
        description: `We've sent password reset instructions to ${email}`,
        variant: "default",
      });
    } catch (error) {
      let errorMessage = "Failed to send reset email. Please try again.";

      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('email') || message.includes('user not found') || message.includes('account not found')) {
          errorMessage = "No account found with this email address.";
          setEmailError("No account found with this email");
        } else if (message.includes('invalid email') || message.includes('email format')) {
          errorMessage = "Please enter a valid email address.";
          setEmailError("Invalid email format");
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-chart-2/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-700">Reset Link Successfully Sent!</CardTitle>
            <CardDescription>
              We've sent password reset instructions to <strong className="text-green-700">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success message box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Email Sent Successfully</span>
              </div>
              <p className="text-sm text-green-700">
                Check your inbox and click the reset link to continue
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
              }}
              variant="outline"
              className="w-full"
            >
              Send Another Email
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-chart-2/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                required
                data-testid="input-email"
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-red-500">{emailError}</p>
                  {emailError.includes('No account found') && (
                    <Link href="/register">
                      <span className="text-xs text-primary hover:underline cursor-pointer">
                        Create an account instead →
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-send-reset"
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>

            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}