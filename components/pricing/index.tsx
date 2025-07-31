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
import { Bot, Check, ExternalLink, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Typewriter } from "@/components/typewriter";

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
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const router = useRouter();

  // Check MetaMask availability
  useEffect(() => {
    const checkMetaMask = () => {
      const hasEthereum =
        typeof window !== "undefined" && typeof window.ethereum !== "undefined";
      console.log("🦊 MetaMask detection:", {
        hasWindow: typeof window !== "undefined",
        hasEthereum: typeof window.ethereum !== "undefined",
        ethereum: window.ethereum,
        result: hasEthereum,
      });
      setHasMetaMask(hasEthereum);
    };

    checkMetaMask();

    // Also check after a delay in case MetaMask loads later
    setTimeout(checkMetaMask, 1000);
  }, []);

  // Calculate price based on usage (example: $0.10 per use)
  const pricePerUse = 0.1;
  const calculatedPrice = (usageCount[0] * pricePerUse).toFixed(2);

  const handlePayment = async (planType: "payPerUse" | "unlimited") => {
    console.log("🚀 Payment button clicked:", planType);
    setIsProcessing(true);

    try {
      // Use fake MetaMask payment for development
      const FAKE_METAMASK = true;

      if (FAKE_METAMASK) {
        // Simulate fake MetaMask payment
        const actualPlanType = planType === "unlimited" ? "pro" : "usage";
        const credits = planType === "payPerUse" ? usageCount[0] : undefined;

        const response = await fetch("/api/plan/upgrade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan_type: actualPlanType,
            usage_credits: credits,
            transaction_hash: "FAKE_TX_" + Date.now(),
            payment_amount: planType === "unlimited" ? 100 : calculatedPrice,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to upgrade plan");
        }

        // Show success dialog
        setPaymentInfo({
          plan: planType === "unlimited" ? "Unlimited Pro" : "Pay Per Use",
          amount: planType === "unlimited" ? "$100" : `$${calculatedPrice}`,
          txHash: "FAKE_TX_" + Date.now(),
          walletAddress: "0xFAKE...DEV",
        });
        setIsPaymentDialogOpen(true);

        // Refresh user plan data by dispatching a custom event
        window.dispatchEvent(new CustomEvent("planUpdated"));

        setIsProcessing(false);
        return;
      }

      // Real MetaMask integration (for production)
      if (typeof window.ethereum === "undefined") {
        alert(
          "Please install MetaMask from https://metamask.io to make payments. This feature requires a Web3 wallet."
        );
        setIsProcessing(false);
        return;
      }

      // Check if we're on a supported network (for now, just warn about mainnet costs)
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        if (network.chainId === BigInt(1)) {
          const confirmed = confirm(
            "⚠️ You're on Ethereum Mainnet. This will use real ETH and incur gas fees. Continue with payment?"
          );
          if (!confirmed) {
            setIsProcessing(false);
            return;
          }
        }
      } catch (networkError) {
        console.warn("Could not detect network:", networkError);
      }

      // Request account access
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (accountError: any) {
        if (accountError.code === 4001) {
          alert(
            "Please connect your MetaMask wallet to continue with payment."
          );
        } else {
          alert("Failed to connect to MetaMask. Please try again.");
        }
        setIsProcessing(false);
        return;
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Payment amounts (in ETH) - Using current ETH price approximation
      const ethPrice = 3000; // Approximate ETH price in USD

      const payPerUseAmount = (
        Number.parseFloat(calculatedPrice) / ethPrice
      ).toFixed(6);

      const unlimitedAmount = (100 / ethPrice).toFixed(6); // $100 USD

      const amount =
        planType === "payPerUse" ? payPerUseAmount : unlimitedAmount;

      const recipient = process.env.NEXT_PUBLIC_PAYMENT_WALLET;
      console.log("💰 Payment recipient:", recipient);

      if (!recipient || recipient === "") {
        alert("Payment system is not configured. Please contact support.");
        setIsProcessing(false);
        return;
      }

      // Validate recipient address
      if (!ethers.isAddress(recipient)) {
        alert("Invalid payment address configuration. Please contact support.");
        setIsProcessing(false);
        return;
      }

      // Confirm payment details with user
      const confirmPayment = confirm(
        `Confirm payment:\n\nPlan: ${
          planType === "payPerUse" ? "Pay Per Use" : "Unlimited Pro"
        }\nAmount: ${amount} ETH (~$${
          planType === "payPerUse" ? calculatedPrice : "100"
        })\n\nProceed with transaction?`
      );

      if (!confirmPayment) {
        setIsProcessing(false);
        return;
      }

      // Send transaction
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      // Show transaction submitted message
      alert(
        `Transaction submitted! Hash: ${tx.hash}\n\nWaiting for confirmation...`
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (!receipt) {
        alert(
          "Transaction failed or was not confirmed. Please check your wallet and try again."
        );
        setIsProcessing(false);
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
    } catch (error: any) {
      console.error("💥 Payment failed:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        data: error.data,
      });

      // Handle specific error types
      if (error.code === 4001) {
        alert("Transaction was rejected by user.");
      } else if (error.code === -32603) {
        alert("Transaction failed. You may not have enough ETH for gas fees.");
      } else if (error.message?.includes("insufficient funds")) {
        alert(
          "Insufficient funds. Please ensure you have enough ETH for the payment and gas fees."
        );
      } else if (error.message?.includes("user rejected")) {
        alert("Transaction was cancelled by user.");
      } else {
        alert(
          `Payment failed: ${
            error.message || "Unknown error"
          }. Please check browser console for details or contact support.`
        );
      }
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
          <h1
            className="text-4xl font-bold text-gray-900"
            data-cy="pricing-title"
          >
            Shopify AI Extension
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          <Typewriter
            text="Supercharge your Shopify store with AI-powered tools that help you sell more, work smarter, and grow faster. Choose the plan that fits your needs."
            speed={30}
            delay={500}
            className="inline"
            data-cy="pricing-description"
          />
        </p>
        <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
          <Typewriter
            text="Automatically generate compelling, SEO-optimized product descriptions that convert visitors into customers. Watch how our AI analyzes your product and creates professional descriptions in seconds."
            speed={25}
            delay={4000}
            className="inline"
            data-cy="pricing-description-2"
          />
        </p>

        {/* Download Extension Button */}
        <div className="mt-8 flex justify-center">
          <a
            href="https://github.com/quochuydev/shopify-ai-extension/releases/tag/v1.0.4"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-shopify-green to-green-600 hover:from-green-600 hover:to-shopify-green text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-1"
          >
            {/* Animated background sparkles */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div
                className="absolute top-2 left-4 w-1 h-1 bg-white/40 rounded-full animate-ping"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute top-4 right-6 w-1 h-1 bg-white/30 rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute bottom-3 left-8 w-1 h-1 bg-white/50 rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute bottom-4 right-4 w-1 h-1 bg-white/35 rounded-full animate-ping"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>

            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-shopify-green via-green-400 to-green-600 rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>

            {/* Content */}
            <div className="relative flex items-center gap-3">
              <svg
                className="w-6 h-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-lg group-hover:tracking-wide transition-all duration-300">
                Download Chrome Extension
              </span>
              <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm font-medium group-hover:bg-white/30 transition-all duration-300">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-bounce"></span>
                v1.0.4
              </div>
            </div>

            {/* Hover ripple effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </a>
        </div>
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
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full bg-shopify-green hover:bg-shopify-green-dark text-white font-medium py-3 flex items-center gap-2"
              onClick={() => {
                console.log("🎯 Pay-per-use payment button clicked!");
                console.log("Button state:", { isProcessing, hasMetaMask });
                handlePayment("payPerUse");
              }}
              disabled={isProcessing}
            >
              <Wallet className="h-4 w-4" />
              {isProcessing ? "Processing..." : "Fake Payment (Dev)"}
            </Button>

            {!hasMetaMask && (
              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-shopify-green text-shopify-green hover:bg-shopify-green/5 font-medium py-3 flex items-center gap-2"
                  onClick={() =>
                    window.open("https://metamask.io/download/", "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                  Install MetaMask
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              {hasMetaMask
                ? "💡 MetaMask detected - ready for crypto payment"
                : "⚠️ MetaMask required for payment"}
            </p>
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
                $100
              </div>
              <p className="text-gray-600">a year</p>
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
            </div>

            <div className="bg-shopify-green/5 border border-shopify-green/20 rounded-lg p-4">
              <p className="text-sm text-shopify-green-dark font-medium">
                💡 Save money when you use more than 100 AI actions per year
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full bg-shopify-green hover:bg-shopify-green-dark text-white font-medium py-3 flex items-center gap-2"
              onClick={() => {
                console.log("🎯 Unlimited payment button clicked!");
                console.log("Button state:", { isProcessing, hasMetaMask });
                handlePayment("unlimited");
              }}
              disabled={isProcessing}
            >
              <Wallet className="h-4 w-4" />
              {isProcessing ? "Processing..." : "Fake Payment (Dev)"}
            </Button>

            {!hasMetaMask && (
              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-shopify-green text-shopify-green hover:bg-shopify-green/5 font-medium py-3 flex items-center gap-2"
                  onClick={() =>
                    window.open("https://metamask.io/download/", "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                  Install MetaMask
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              {hasMetaMask
                ? "💡 MetaMask detected - ready for crypto payment"
                : "⚠️ MetaMask required for payment"}
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Development Notice */}
      <div className="text-center mt-12">
        <div className="max-w-2xl mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🚧 <strong>Development Mode:</strong> Payment buttons use fake
            transactions for testing. No MetaMask required - plans will be
            upgraded instantly for development purposes.
          </p>
        </div>
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
