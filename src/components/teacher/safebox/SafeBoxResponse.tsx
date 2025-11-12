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
import { motion } from 'framer-motion';
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
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-1">Respond to Feedback</h3>
        <p className="text-xs text-muted-foreground">{className}</p>
      </div>

      {/* New Response Form */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Post Class-Wide Response</h4>
            <p className="text-[10px] text-muted-foreground">
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
            className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-lg focus:outline-none focus:border-primary transition-all duration-300 text-foreground placeholder:text-muted-foreground resize-none"
            disabled={submitting}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-[10px] text-muted-foreground">
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
            <div className="text-[10px] text-muted-foreground">
              {characterCount}/{maxChars}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full py-2.5 bg-gradient-to-br from-primary to-accent text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Posting...</span>
            </div>
          ) : success ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Posted!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Post Response</span>
            </>
          )}
        </button>
      </div>

      {/* Previous Responses */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">Your Previous Responses</h4>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 animate-pulse">
                <div className="h-3 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : responses.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-5 h-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground">You haven't posted any responses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((response, idx) => (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-primary">
                    Teacher Response
                  </span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(response.posted_at)}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {response.response_text}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
