"use client";

import { useState } from "react";
import { UserProfilePopover } from "./plan/user-profile-popover";
import { LogoutButton } from "./logout-button";

interface AuthButtonClientProps {
  userEmail: string;
}

export function AuthButtonClient({ userEmail }: AuthButtonClientProps) {
  const [productPreviewContent, setProductPreviewContent] = useState(null);

  const handleProductPreview = (content: any) => {
    setProductPreviewContent(content);
    // Send message to trigger ProductPreview dialog
    window.postMessage({
      type: 'GENERATED_CONTENT',
      content: content
    }, '*');
  };

  return (
    <div className="flex items-center gap-4">
      <UserProfilePopover 
        userEmail={userEmail}
        onProductPreview={handleProductPreview}
      />
      <LogoutButton />
    </div>
  );
}