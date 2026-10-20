'use client';

import React, { useState } from 'react';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { Check, Copy } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
  className?: string;
  variant?: 'default' | 'primary';
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  url,
  className,
  variant = 'default',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <NeuButton
      variant={copied ? 'pressed' : variant}
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
          <span className="text-emerald-700">Link Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy Link</span>
        </>
      )}
    </NeuButton>
  );
};
