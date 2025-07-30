"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExtensionCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking authentication...');
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          setStatus('error');
          setMessage('Authentication failed. Please try logging in again.');
          return;
        }

        // Get the session to extract the access token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setStatus('error');
          setMessage('Could not retrieve session. Please try again.');
          return;
        }

        // Send the access token back to the extension
        if (window.opener) {
          window.opener.postMessage({
            type: 'EXTENSION_AUTH_SUCCESS',
            accessToken: session.access_token,
            userEmail: user.email
          }, '*');
          
          setStatus('success');
          setMessage('Authentication successful! You can close this window.');
          
          // Close the popup after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Could not communicate with extension. Please try again.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    }

    handleAuth();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="space-y-4">
          {status === 'loading' && (
            <>
              <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
              <h2 className="text-xl font-semibold">Processing Authentication</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-600">Success!</h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-600">Authentication Failed</h2>
            </>
          )}
          
          <p className="text-gray-600">{message}</p>
          
          {status === 'error' && (
            <button 
              onClick={() => window.close()} 
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Close Window
            </button>
          )}
        </div>
      </div>
    </div>
  );
}