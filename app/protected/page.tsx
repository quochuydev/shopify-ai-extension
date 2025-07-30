import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExtensionTester } from "@/components/extension-tester";
import { ProductPreview } from "@/components/product-preview";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center">
          Welcome to Shopify AI Extension Testing
        </div>
        <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
          <header className="flex flex-col gap-16">
            <div className="flex gap-5 justify-center items-center">
              <div className="flex flex-col gap-2 items-center">
                <h2 className="font-bold text-2xl mb-4">Test the Extension</h2>
                <p className="text-sm text-foreground/60 max-w-2xl text-center">
                  Try dragging and dropping a product image below to see how the AI Extension works. 
                  You have 5 free tries with your account.
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col gap-6">
            <ExtensionTester />
            <ProductPreview />
          </main>
        </div>
      </div>
    </div>
  );
}
