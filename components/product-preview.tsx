"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductContent } from "@/types";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";

export function ProductPreview() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<ProductContent | null>(null);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "GENERATED_CONTENT") {
        setOpen(true);
        console.log("debug:generatedContent", event.data.content);
        setProduct(event.data.content);
        
        // Refresh user plan data since a credit was consumed
        window.dispatchEvent(new CustomEvent('planUpdated'));
      }
    });
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[90vw] h-[90vh] min-w-[90vw] min-h-[90vh] z-[99999] p-0 overflow-auto"
        showCloseButton={false}
      >
        <div className="flex flex-col w-full h-full">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                🤖 AI Generated Product Details
                <Badge variant="secondary" className="text-xs">
                  FREE TRIAL
                </Badge>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {product && (
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="title"
                          className="flex items-center justify-between"
                        >
                          Title
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(product.title, "Title")
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </Label>
                        <Input
                          id="title"
                          value={product.title}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="flex items-center justify-between"
                        >
                          Description
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                product.description,
                                "Description"
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </Label>
                        <Textarea
                          id="description"
                          value={product.description}
                          readOnly
                          className="bg-gray-50 min-h-[200px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            value={`$${product.price}`}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compare_price">Compare Price</Label>
                          <Input
                            id="compare_price"
                            value={
                              product.compare_at_price
                                ? `$${product.compare_at_price}`
                                : ""
                            }
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU</Label>
                          <Input
                            id="sku"
                            value={product.sku}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            value={product.weight}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Organization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product_type">Product Type</Label>
                          <Input
                            id="product_type"
                            value={product.product_type}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vendor">Vendor</Label>
                          <Input
                            id="vendor"
                            value={product.vendor}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Collections</Label>
                        <div className="flex flex-wrap gap-2">
                          {product.collections.map((collection, index) => (
                            <Badge key={index} variant="outline">
                              {collection}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="tags"
                          className="flex items-center justify-between"
                        >
                          Tags
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(product.tags, "Tags")
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </Label>
                        <Input
                          id="tags"
                          value={product.tags}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - SEO & Settings */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">SEO Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="meta_title"
                          className="flex items-center justify-between"
                        >
                          Meta Title
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(product.meta_title, "Meta Title")
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </Label>
                        <Input
                          id="meta_title"
                          value={product.meta_title}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="meta_description"
                          className="flex items-center justify-between"
                        >
                          Meta Description
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                product.meta_description,
                                "Meta Description"
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </Label>
                        <Textarea
                          id="meta_description"
                          value={product.meta_description}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Publishing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Input
                            id="status"
                            value={product.status}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="published_scope">Scope</Label>
                          <Input
                            id="published_scope"
                            value={product.published_scope}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview Card */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">
                        HTML Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="prose prose-sm max-w-none text-sm"
                        dangerouslySetInnerHTML={{
                          __html: product.description,
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <p className="text-sm text-yellow-800 font-medium">
                    This is <strong>AI-generated demo data</strong> for testing
                    purposes only. Review and modify as needed before using in
                    production.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
