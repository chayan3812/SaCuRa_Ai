import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SmartReplyFeedbackProps {
  messageId: string;
  aiSuggestion: string;
  onFeedbackSubmitted?: (feedback: boolean) => void;
}

export function SmartReplyFeedback({ 
  messageId, 
  aiSuggestion, 
  onFeedbackSubmitted 
}: SmartReplyFeedbackProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (isHelpful: boolean) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFeedbackGiven(isHelpful);
    
    try {
      await apiRequest('/api/feedback/submit', {
        method: 'POST',
        body: JSON.stringify({
          messageId,
          aiSuggestion,
          feedback: isHelpful,
          platformContext: 'inbox',
          responseTime: Date.now(), // Track when feedback was given
        })
      });
      
      onFeedbackSubmitted?.(isHelpful);
    } catch (err) {
      console.error('Feedback submission failed:', err);
      setFeedbackGiven(null); // Reset on error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedbackGiven !== null) {
    return (
      <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-300">
          Thanks for the feedback! This helps improve AI suggestions.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        Was this AI suggestion helpful?
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => submitFeedback(true)}
          disabled={isSubmitting}
          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          Helpful
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => submitFeedback(false)}
          disabled={isSubmitting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          Not helpful
        </Button>
      </div>
    </div>
  );
}