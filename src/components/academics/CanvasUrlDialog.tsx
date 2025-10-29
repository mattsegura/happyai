/**
 * Canvas URL Input Dialog
 *
 * Modal dialog for entering Canvas instance URL.
 * Provides validation and helpful suggestions.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle } from 'lucide-react';

type CanvasUrlDialogProps = {
  open: boolean;
  onSubmit: (url: string) => void;
  onCancel: () => void;
};

export function CanvasUrlDialog({ open, onSubmit, onCancel }: CanvasUrlDialogProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl.trim()) {
      setError('Canvas URL is required');
      return false;
    }

    try {
      const parsedUrl = new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);

      // Must be HTTPS in production
      if (parsedUrl.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        setError('Canvas URL must use HTTPS');
        return false;
      }

      // Must include a domain
      if (!parsedUrl.hostname.includes('.')) {
        setError('Please enter a valid domain name');
        return false;
      }

      setError(null);
      return true;
    } catch {
      setError('Please enter a valid URL');
      return false;
    }
  };

  const handleSubmit = () => {
    const trimmedUrl = url.trim();

    if (!validateUrl(trimmedUrl)) {
      return;
    }

    // Ensure URL has protocol
    const finalUrl = trimmedUrl.startsWith('http')
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    // Remove trailing slash
    const cleanUrl = finalUrl.replace(/\/$/, '');

    onSubmit(cleanUrl);
    setUrl('');
    setError(null);
  };

  const handleCancel = () => {
    setUrl('');
    setError(null);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Canvas Account</DialogTitle>
          <DialogDescription>
            Enter your institution's Canvas LMS URL to connect your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="canvas-url">Canvas Instance URL</Label>
            <Input
              id="canvas-url"
              placeholder="canvas.university.edu"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className={error ? 'border-red-500' : ''}
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Examples:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>canvas.university.edu</li>
              <li>https://canvas.instructure.com</li>
              <li>university.instructure.com</li>
            </ul>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-3">
            <p className="font-medium mb-1">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>You'll be redirected to Canvas to authorize Hapi</li>
              <li>Grant Hapi access to your courses and grades</li>
              <li>You'll be redirected back to continue setup</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 sm:flex-initial">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
