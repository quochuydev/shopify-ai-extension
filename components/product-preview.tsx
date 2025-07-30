"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

type ProductProps = {
  title: string;
  description: string;
  price: string;
  compare_at_price?: string;
  sku: string;
  weight: string;
  meta_title: string;
  meta_description: string;
  status: string;
  published_scope: string;
  product_type: string;
  vendor: string;
  collections: string[];
  tags: string;
};

export function ProductPreview() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<ProductProps | null>(null);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "GENERATED_CONTENT") {
        setOpen(true);
        console.log("debug:generatedContent", event.data.content);
        setProduct(event.data.content);
      }
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="min-w-[80%] min-h-[80%] z-[99999]">
        {JSON.stringify(product)}
        {product && (
          <div className="hidden max-w-2xl mx-auto p-4 bg-white rounded-lg space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {product.title}
            </h1>

            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            <div className="flex gap-4 items-baseline">
              <span className="text-xl font-semibold text-green-600">
                ${product.price}
              </span>
              {product.compare_at_price && (
                <span className="line-through text-gray-400">
                  ${product.compare_at_price}
                </span>
              )}
            </div>

            <div className="text-sm text-gray-700">
              <p>
                <strong>SKU:</strong> {product.sku}
              </p>
              <p>
                <strong>Weight:</strong> {product.weight} kg
              </p>
              <p>
                <strong>Type:</strong> {product.product_type}
              </p>
              <p>
                <strong>Vendor:</strong> {product.vendor}
              </p>
              <p>
                <strong>Status:</strong> {product.status}
              </p>
              <p>
                <strong>Scope:</strong> {product.published_scope}
              </p>
            </div>

            <div className="text-sm">
              <strong>Collections:</strong>
              <ul className="list-disc list-inside">
                {product.collections.map((col) => (
                  <li key={col}>{col}</li>
                ))}
              </ul>
            </div>

            <div className="text-sm">
              <strong>Tags:</strong> {product.tags}
            </div>

            <div className="border-t pt-2 text-xs text-gray-500">
              <p>
                <strong>Meta Title:</strong> {product.meta_title}
              </p>
              <p>
                <strong>Meta Description:</strong> {product.meta_description}
              </p>
            </div>

            {/* 🚨 Warning Banner */}
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-center text-sm font-semibold">
              ⚠️ This is <strong>demo data</strong> for testing purposes only.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
