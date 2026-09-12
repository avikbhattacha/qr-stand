import React, { useState } from 'react';
import { Star, MessageCircle, Mail, ExternalLink, Check, Copy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getTemplatesForBusiness,
  convertToDirectReviewUrl,
  normalizeReviewUrl,
} from '../data/industryTemplates';

interface SimpleReviewScreenProps {
  businessName: string;
  publicReviewUrl: string;
  whatsappNumber: string;
  ownerEmail: string;
  contactMethod?: 'both' | 'whatsapp' | 'email';
  businessCategory?: string;
  customTemplate?: string;
  tweakedTemplates?: string[];
  onSwitchToOwnerView?: () => void;
}

export const SimpleReviewScreen: React.FC<SimpleReviewScreenProps> = ({
  businessName = '',
  publicReviewUrl = '',
  whatsappNumber = '',
  ownerEmail = '',
  contactMethod = 'both',
  businessCategory = 'general',
  customTemplate = '',
  tweakedTemplates,
  onSwitchToOwnerView,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const targetReviewUrl = convertToDirectReviewUrl(publicReviewUrl) || normalizeReviewUrl(publicReviewUrl);

  const reviewTemplates = getTemplatesForBusiness(
    businessCategory,
    businessName,
    customTemplate,
    tweakedTemplates
  );
  const [activeComment, setActiveComment] = useState<string>(reviewTemplates[0] || '');

  const handleSelectRating = (selected: number) => {
    setRating(selected);
    if (selected >= 4) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-100 flex flex-col justify-between py-6 px-4 font-sans">
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            {businessName || 'Rate Your Experience'}
          </h1>
          <p className="text-xs text-slate-500 mb-4">Tap a star to rate your visit:</p>

          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((starVal) => (
              <button
                key={starVal}
                type="button"
                onMouseEnter={() => setHoverRating(starVal)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => handleSelectRating(starVal)}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 ${
                    (hoverRating || rating || 0) >= starVal
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              </button>
            ))}
          </div>

          {rating !== null && rating >= 4 && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl">
                Thank you! Select a review template below to paste on Google:
              </p>
              <textarea
                rows={3}
                value={activeComment}
                onChange={(e) => setActiveComment(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeComment);
                  window.open(targetReviewUrl, '_blank');
                }}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2"
              >
                <span>Go to Google Review</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {rating !== null && rating <= 3 && (
            <div className="space-y-4 text-left animate-fadeIn">
              <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl">
                We're sorry your visit wasn't 5 stars. Send your feedback directly to management:
              </p>
              <button
                type="button"
                onClick={() => {
                  const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Feedback for ${businessName}: Unsatisfactory experience.`)}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp to Owner</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
