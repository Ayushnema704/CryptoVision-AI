"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, CreditCard, Crown, TrendingUp, Calendar, Shield, Zap, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { initiatePayment, PAYMENT_PLANS, RazorpayResponse } from "@/lib/razorpay";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handlePaymentSuccess = async (paymentId: string, planType: string) => {
    try {
      console.log('💳 Payment successful, updating premium status...', { paymentId, planType });
      
      // Calculate premium days based on plan type
      const premiumDays = planType === 'monthly' ? 30 : 365;
      
      // Update user to premium via Flask API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPremium: true,
          premiumDays: premiumDays,
          subscriptionType: planType,
          paymentId: paymentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update premium status');
      }

      const data = await response.json();
      console.log('✅ Premium status updated:', data);

      toast({
        title: "Payment Successful! 🎉",
        description: `You are now a Premium member! Enjoy unlimited predictions for ${premiumDays} days.`,
      });

      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('❌ Error updating premium status:', error);
      toast({
        title: "Payment Successful",
        description: "But there was an issue updating your account. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (planType: 'monthly' | 'annual') => {
    if (processingPayment) return;

    setProcessingPayment(true);
    const plan = PAYMENT_PLANS[planType];

    try {
      await initiatePayment({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX', // Add your Razorpay key
        amount: plan.amount,
        currency: plan.currency,
        name: 'CryptoVision AI',
        description: plan.description,
        image: '/favicon.svg',
        handler: async (response: RazorpayResponse) => {
          setProcessingPayment(false);
          await handlePaymentSuccess(response.razorpay_payment_id, planType);
        },
        prefill: {
          name: userData.email.split('@')[0] || '',
          email: userData.email,
        },
        theme: {
          color: '#3b82f6', // primary color
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
            });
          },
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      setProcessingPayment(false);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Payment Processing Overlay */}
      {processingPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-8 rounded-lg shadow-2xl border max-w-md mx-4"
          >
            <div className="text-center space-y-6">
              {/* Animated Icon */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
                className="inline-block"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <CreditCard className="relative h-16 w-16 text-primary" />
                </div>
              </motion.div>

              {/* Processing Text */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Processing Payment</h3>
                <p className="text-muted-foreground">
                  Please wait while we securely process your payment...
                </p>
              </div>

              {/* Loading Dots */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-3 h-3 bg-primary rounded-full"
                  />
                ))}
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secured by Razorpay</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                My Account
              </h1>

              {/* Profile Card */}
              <Card className="mb-6">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">
                        {new Date(userData.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <p className="font-medium">{userData.isPremium ? 'Premium Member' : 'Free Member'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Available Credits</p>
                      <p className="font-medium">{userData.isPremium ? 'Unlimited' : userData.credits}</p>
                    </div>
                  </div>
                  {userData.isPremium && userData.premiumExpiresAt && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg md:col-span-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Premium Valid Until</p>
                        <p className="font-medium text-yellow-600 dark:text-yellow-400">
                          {new Date(userData.premiumExpiresAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Subscription Plan
                  </span>
                  {userData.isPremium ? (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Free Plan</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData.isPremium ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Crown className="h-8 w-8 text-yellow-500" />
                        <div>
                          <h3 className="text-xl font-bold">Premium Member</h3>
                          <p className="text-sm text-muted-foreground">Unlimited access to all features</p>
                          {userData.premiumExpiresAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Expires on {new Date(userData.premiumExpiresAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Unlimited Predictions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm">8 Cryptocurrencies</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Up to 30 Days Ahead</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Advanced Analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Priority Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm">No Ads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-6">
                        You're currently on the Free plan with limited predictions. Upgrade to Premium for unlimited access!
                      </p>
                      <Button 
                        onClick={() => setShowUpgrade(!showUpgrade)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white"
                        size="lg"
                      >
                        <Crown className="mr-2 h-5 w-5" />
                        {showUpgrade ? 'Hide' : 'View'} Premium Plans
                      </Button>
                    </div>

                    {showUpgrade && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Monthly Plan */}
                          <Card className="border-primary/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                              Popular
                            </div>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Monthly Plan
                              </CardTitle>
                              <CardDescription>Best for trying out Premium</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <span className="text-4xl font-bold">$9.99</span>
                                <span className="text-muted-foreground">/month</span>
                              </div>
                              <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">Unlimited predictions</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">All cryptocurrencies</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">Advanced analytics</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">Priority support</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">Cancel anytime</span>
                                </li>
                              </ul>
                              <Button 
                                onClick={() => handlePayment('monthly')}
                                className="w-full bg-gradient-to-r from-primary to-accent"
                                disabled={processingPayment}
                              >
                                {processingPayment ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  'Subscribe Monthly'
                                )}
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Annual Plan */}
                          <Card className="border-yellow-500/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                              Save 20%
                            </div>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-500" />
                                Annual Plan
                              </CardTitle>
                              <CardDescription>Best value for long-term</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <span className="text-4xl font-bold">$95.99</span>
                                <span className="text-muted-foreground">/year</span>
                                <div className="text-sm text-green-500 font-medium">Save $24 annually</div>
                              </div>
                              <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">Everything in Monthly</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">20% discount</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">Exclusive features</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">Priority updates</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">VIP support</span>
                                </li>
                              </ul>
                              <Button 
                                onClick={() => handlePayment('annual')}
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                disabled={processingPayment}
                              >
                                {processingPayment ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  'Subscribe Annually'
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Payment Methods */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-center text-muted-foreground mb-3">
                            Secure payment powered by
                          </p>
                          <div className="flex items-center justify-center gap-6 flex-wrap">
                            <Badge variant="outline" className="text-xs font-semibold">Razorpay</Badge>
                            <Badge variant="outline" className="text-xs">UPI</Badge>
                            <Badge variant="outline" className="text-xs">Credit Card</Badge>
                            <Badge variant="outline" className="text-xs">Debit Card</Badge>
                            <Badge variant="outline" className="text-xs">Net Banking</Badge>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Credits Card */}
            {!userData.isPremium && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Prediction Credits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold">{userData.credits}</span>
                        <span className="text-muted-foreground">credits remaining</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${(userData.credits / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {userData.credits === 0 ? (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                          You've used all your free credits. Upgrade to Premium for unlimited predictions!
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Each prediction uses 1 credit. Get more credits by upgrading to Premium.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
      </div>
    </>
  );
}
