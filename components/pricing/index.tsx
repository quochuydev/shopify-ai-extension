declare global {
  interface Window {
    ethereum?: any;
  }
}

import { ethers } from "ethers";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Check, Bot, Play, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

      // Payment amounts (in ETH)
      const payPerUseAmount = (
        Number.parseFloat(calculatedPrice) / 3000
      ).toFixed(6); // Assuming 1 ETH = $3000
      const unlimitedAmount = (29 / 3000).toFixed(6); // $29 / $3000 per ETH

      const amount =
        planType === "payPerUse" ? payPerUseAmount : unlimitedAmount;
      const recipient = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Replace with your wallet address

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

  const demoFeatures = [
    {
      title: "AI Product Description Generator",
      description:
        "Automatically generate compelling, SEO-optimized product descriptions that convert visitors into customers. Watch how our AI analyzes your product and creates professional descriptions in seconds.",
      videoUrl: "https://youtube.com/watch?v=demo1", // Replace with your actual YouTube URL
    },
    {
      title: "Smart Customer Support Assistant",
      description:
        "AI-powered customer support that handles inquiries 24/7. See how it understands customer questions and provides accurate, helpful responses that maintain your brand voice.",
      videoUrl: "https://youtube.com/watch?v=demo2", // Replace with your actual YouTube URL
    },
    {
      title: "Inventory Management & Forecasting",
      description:
        "Get AI-driven insights on inventory levels, demand forecasting, and automated reorder suggestions. Learn how it predicts trends and prevents stockouts before they happen.",
      videoUrl: "https://youtube.com/watch?v=demo3", // Replace with your actual YouTube URL
    },
    {
      title: "Sales Analytics & Optimization",
      description:
        "Comprehensive AI-driven analytics that provide actionable insights to grow your business. Discover how it identifies opportunities and recommends strategies to boost your revenue.",
      videoUrl: "https://youtube.com/watch?v=demo4", // Replace with your actual YouTube URL
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
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
        </div>

        {/* Demo Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Watch video demonstrations of how our AI extension transforms your
              Shopify store workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {demoFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-shopify-green/10 rounded-lg mr-4 flex-shrink-0">
                    <Play className="h-6 w-6 text-shopify-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                    {feature.title}
                  </h3>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <Button
                  className="w-full bg-shopify-green hover:bg-shopify-green-dark text-white font-medium py-3 flex items-center justify-center gap-2"
                  onClick={() => window.open(feature.videoUrl, "_blank")}
                >
                  <Play className="h-4 w-4" />
                  Watch Demo Video
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                <p className="text-sm text-gray-500 mt-1">
                  Unlimited AI actions
                </p>
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
                  <span className="text-sm text-gray-700">
                    Priority support
                  </span>
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
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
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
    </div>
  );
}
