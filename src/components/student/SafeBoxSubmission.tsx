/**
 * SafeBox Submission Component
 *
 * Allows students to submit anonymous feedback about their class.
 * Features:
 * - 100% anonymous (no user tracking)
 * - AI content moderation
 * - 10-2000 character limit
 * - Cannot edit/delete after submission
 * - Clear anonymity guarantee messaging
 */

import { useState } from 'react';
import { Shield, Send, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { moderateSafeBoxMessage } from '../../lib/safebox/safeboxModerator';

interface SafeBoxSubmissionProps {
  classId: string;
  className: string;
  onSubmitted?: () => void;
}

export function SafeBoxSubmission({ classId, className, onSubmitted }: SafeBoxSubmissionProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const characterCount = message.length;
  const minChars = 10;
  const maxChars = 2000;
  const isValid = characterCount >= minChars && characterCount <= maxChars;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Moderate the message with AI
      const moderation = await moderateSafeBoxMessage(message);

      // Step 2: If message is rejected, show error
      if (moderation.status === 'rejected') {
        setError(moderation.moderation_notes || 'Your message contains inappropriate content and cannot be submitted.');
        setLoading(false);
        return;
      }

      // Step 3: Insert into database (anonymous - no user_id!)
      const { error: insertError } = await supabase
        .from('safebox_messages')
        .insert({
          class_id: classId,
          message_text: moderation.moderated_message, // Use cleaned message
          sentiment: moderation.sentiment,
          ai_moderation_status: moderation.status,
          ai_detected_themes: moderation.detected_themes,
          is_urgent: moderation.is_urgent,
          moderation_notes: moderation.moderation_notes,
        });

      if (insertError) {
        throw insertError;
      }

      // Success!
      setSuccess(true);
      setMessage('');

      // Notify parent
      if (onSubmitted) {
        setTimeout(() => {
          onSubmitted();
        }, 2000);
      }
    } catch (err) {
      console.error('SafeBox submission error:', err);
      setError('Failed to submit your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-lg border-2 border-green-200 dark:border-green-800 animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Message Submitted!</h3>
          <p className="text-muted-foreground mb-4">
            Your anonymous feedback has been sent to your teacher.
          </p>
          <p className="text-sm text-muted-foreground">
            Thank you for helping improve the class experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-2xl p-6 shadow-lg border-2 border-indigo-200 dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">SafeBox</h3>
          <p className="text-sm text-muted-foreground">{className}</p>
        </div>
      </div>

      {/* Anonymity Guarantee */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-6 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              100% Anonymous
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your teacher will <strong>never</strong> know who wrote this message.
              We don't track or store any identifying information.
            </p>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="mb-4">
        <label htmlFor="safebox-message" className="block text-sm font-semibold text-foreground mb-2">
          What would you like to share about this class?
        </label>
        <textarea
          id="safebox-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your honest feedback about the class, homework load, teaching style, or anything else on your mind. Remember, this is completely anonymous."
          rows={8}
          maxLength={maxChars}
          className="w-full px-4 py-3 bg-card border-2 border-indigo-200 dark:border-indigo-700 rounded-xl focus:outline-none focus:border-indigo-400 transition-all duration-300 text-foreground placeholder:text-muted-foreground resize-none"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            {characterCount < minChars && (
              <span className="text-orange-600 dark:text-orange-400">
                Minimum {minChars} characters ({minChars - characterCount} more needed)
              </span>
            )}
            {characterCount >= minChars && characterCount <= maxChars && (
              <span className="text-green-600 dark:text-green-400">
                ✓ Ready to submit
              </span>
            )}
            {characterCount > maxChars && (
              <span className="text-red-600 dark:text-red-400">
                Too long ({characterCount - maxChars} over limit)
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {characterCount}/{maxChars}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Unable to Submit
              </h4>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-4 mb-6 border-2 border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          Important Notes:
        </h4>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• Be respectful and constructive</li>
          <li>• AI moderation keeps content appropriate</li>
          <li>• You cannot edit or delete after submitting</li>
          <li>• This is one-way communication (no replies expected)</li>
          <li>• Urgent safety concerns are flagged for immediate attention</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        aria-label="Submit anonymous feedback"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Submitting...</span>
          </div>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Submit Anonymously</span>
            <Send className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Your feedback helps create a better learning environment for everyone
      </p>
    </div>
  );
}
