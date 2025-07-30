"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ethers } from "ethers";
import { Bot, Check, ExternalLink, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function PricingPage() {
  const [usageCount, setUsageCount] = useState([50]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    plan: string;
    amount: string;
    txHash: string;
    walletAddress: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Calculate price based on usage (example: $0.10 per use)
  const pricePerUse = 0.1;
  const calculatedPrice = (usageCount[0] * pricePerUse).toFixed(2);

  const handlePayment = async (planType: "payPerUse" | "unlimited") => {
    setIsProcessing(true);

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask to make payments");
        return;
      }

      // Request account access
      await window.ethereum.request({ method: "eth_request_accounts" });

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Payment amounts (in ETH) // Assuming 1 ETH = $3000
      const payPerUseAmount = (
        Number.parseFloat(calculatedPrice) / 3000
      ).toFixed(6);
      const unlimitedAmount = (29 / 3000).toFixed(6); // $29 / $3000 per ETH

      const amount =
        planType === "payPerUse" ? payPerUseAmount : unlimitedAmount;
      const recipient = ""; // Replace with your wallet address

      // Send transaction
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (!receipt) {
        alert("Transaction failed. Please try again.");
        return;
      }

      // Set payment info and show success dialog
      setPaymentInfo({
        plan: planType === "payPerUse" ? "Pay Per Use" : "Unlimited Pro",
        amount: `${amount} ETH`,
        txHash: receipt.hash,
        walletAddress: userAddress,
      });
      setIsPaymentDialogOpen(true);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      {/* Header */}
      <div className="text-center mb-16 flex flex-col items-center gap-4">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-shopify-green rounded-lg mr-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Shopify AI Helper
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Supercharge your Shopify store with AI-powered tools that help you
          sell more, work smarter, and grow faster. Choose the plan that fits
          your needs.
        </p>
        <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Automatically generate compelling, SEO-optimized product descriptions
          that convert visitors into customers. Watch how our AI analyzes your
          product and creates professional descriptions in seconds.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Trial */}
        <Card className="relative bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 text-white px-4 py-1 font-medium">
              Free Trial
            </Badge>
          </div>
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Free Trial
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Try our AI features with no commitment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">$0</div>
              <p className="text-gray-600">5 AI actions included</p>
              <p className="text-sm text-gray-500 mt-1">Perfect for testing</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">5 free AI actions</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  All AI features included
                </span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  No payment required
                </span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">Email support</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium">
                🎯 Perfect way to experience our AI before committing
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3"
              onClick={() => router.push("/auth/login")}
              disabled={isProcessing}
            >
              {isProcessing ? "Setting up..." : "Start Free Trial"}
            </Button>
          </CardFooter>
        </Card>
        {/* Pay Per Use */}
        <Card className="relative bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Pay Per Use
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Perfect for stores just getting started or with occasional AI
              needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-shopify-green mb-2">
                ${calculatedPrice}
              </div>
              <p className="text-gray-600">for {usageCount[0]} AI actions</p>
              <p className="text-sm text-gray-500 mt-1">
                ${pricePerUse} per use
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Estimated monthly usage: {usageCount[0]} actions
                </label>
                <Slider
                  value={usageCount}
                  onValueChange={setUsageCount}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>10</span>
                  <span>500+</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  All AI features included
                </span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  No monthly commitment
                </span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">Email support</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">Usage analytics</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-shopify-green hover:bg-shopify-green-dark text-white font-medium py-3"
              onClick={() => handlePayment("payPerUse")}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Start with Pay Per Use"}
            </Button>
          </CardFooter>
        </Card>

        {/* Unlimited Plan */}
        <Card className="relative bg-white shadow-lg border-2 border-shopify-green hover:shadow-xl transition-shadow">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-shopify-green text-white px-4 py-1 font-medium">
              Most Popular
            </Badge>
          </div>
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Unlimited Pro
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Best for growing stores that want unlimited AI power
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-shopify-green mb-2">
                $29
              </div>
              <p className="text-gray-600">per month</p>
              <p className="text-sm text-gray-500 mt-1">Unlimited AI actions</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Unlimited AI actions
                </span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  All AI features included
                </span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">Priority support</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Advanced analytics
                </span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Custom AI training
                </span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">API access</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-shopify-green mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">Cancel anytime</span>
              </div>
            </div>

            <div className="bg-shopify-green/5 border border-shopify-green/20 rounded-lg p-4">
              <p className="text-sm text-shopify-green-dark font-medium">
                💡 Save money when you use more than 290 AI actions per month
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-shopify-green hover:bg-shopify-green-dark text-white font-medium py-3"
              onClick={() => handlePayment("unlimited")}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Start Unlimited Pro"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Footer CTA */}
      <div className="text-center mt-16">
        <p className="text-gray-600 mb-6">
          {`Need help choosing? We're here to help you find the perfect plan.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium bg-transparent"
          >
            View Documentation
          </Button>
          <Button
            variant="outline"
            className="border-shopify-green text-shopify-green hover:bg-shopify-green/5 font-medium bg-transparent"
          >
            Contact Sales
          </Button>
        </div>
      </div>
      {/* Payment Success Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-shopify-green">
              Payment Successful! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              Your payment has been processed successfully
            </DialogDescription>
          </DialogHeader>

          {paymentInfo && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Plan:</span>
                  <span className="text-gray-900">{paymentInfo.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Amount:</span>
                  <span className="text-gray-900">{paymentInfo.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Your Wallet:
                  </span>
                  <span className="text-gray-900 text-sm">
                    {paymentInfo.walletAddress.slice(0, 6)}...
                    {paymentInfo.walletAddress.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    Transaction:
                  </span>
                  <a
                    href={`https://etherscan.io/tx/${paymentInfo.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-shopify-green hover:underline text-sm"
                  >
                    View on Etherscan
                  </a>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  You will receive access to your plan within 5 minutes.
                </p>
                <Button
                  onClick={() => setIsPaymentDialogOpen(false)}
                  className="w-full bg-shopify-green hover:bg-shopify-green-dark"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
