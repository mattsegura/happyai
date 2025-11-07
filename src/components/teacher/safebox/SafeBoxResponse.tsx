/**
 * SafeBox Response Component - Teacher View
 *
 * Allows teachers to post anonymous class-wide responses to SafeBox feedback.
 * Features:
 * - Anonymous response (not linked to specific messages)
 * - 10-1000 character limit
 * - View previous responses
 */

import { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface SafeBoxResponse {
  id: string;
  response_text: string;
  posted_at: string;
}

interface SafeBoxResponseProps {
  classId: string;
  className: string;
}

export function SafeBoxResponse({ classId, className }: SafeBoxResponseProps) {
  const { user } = useAuth();
  const [responses, setResponses] = useState<SafeBoxResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const minChars = 10;
  const maxChars = 1000;
  const characterCount = newResponse.length;
  const isValid = characterCount >= minChars && characterCount <= maxChars;

  useEffect(() => {
    fetchResponses();
  }, [classId]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('safebox_responses')
        .select('*')
        .eq('class_id', classId)
        .order('posted_at', { ascending: false });

      if (error) throw error;

      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching SafeBox responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('safebox_responses').insert({
        class_id: classId,
        teacher_id: user.id,
        response_text: newResponse,
      });

      if (error) throw error;

      // Success
      setSuccess(true);
      setNewResponse('');
      setTimeout(() => setSuccess(false), 3000);

      // Refresh responses
      fetchResponses();
    } catch (error) {
      console.error('Error submitting SafeBox response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Respond to Feedback</h3>
        <p className="text-sm text-muted-foreground">{className}</p>
      </div>

      {/* New Response Form */}
      <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-purple-50 dark:to-purple-950/30 rounded-xl p-6 shadow-md border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Post Class-Wide Response</h4>
            <p className="text-xs text-muted-foreground">
              Students will see this as "Teacher Response" (not linked to individual messages)
            </p>
          </div>
        </div>

        <div className="mb-4">
          <textarea
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            placeholder="Thank you for your feedback. I've heard your concerns about... and I'm planning to..."
            rows={6}
            maxLength={maxChars}
            className="w-full px-4 py-3 bg-card border-2 border-indigo-200 dark:border-indigo-700 rounded-xl focus:outline-none focus:border-indigo-400 transition-all duration-300 text-foreground placeholder:text-muted-foreground resize-none"
            disabled={submitting}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-muted-foreground">
              {characterCount < minChars && (
                <span className="text-orange-600 dark:text-orange-400">
                  Minimum {minChars} characters ({minChars - characterCount} more needed)
                </span>
              )}
              {characterCount >= minChars && characterCount <= maxChars && (
                <span className="text-green-600 dark:text-green-400">✓ Ready to post</span>
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

        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Posting...</span>
            </div>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Posted!</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Post Response</span>
            </>
          )}
        </button>
      </div>

      {/* Previous Responses */}
      <div>
        <h4 className="text-lg font-bold text-foreground mb-4">Your Previous Responses</h4>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 shadow-md animate-pulse border border-border">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : responses.length === 0 ? (
          <div className="bg-card rounded-xl p-8 shadow-md border border-border text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">You haven't posted any responses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((response) => (
              <div
                key={response.id}
                className="bg-card rounded-xl p-4 shadow-md border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Teacher Response
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTime(response.posted_at)}</span>
                </div>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {response.response_text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
