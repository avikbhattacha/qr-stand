import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageCircle,
  Mail,
  ExternalLink,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Award,
  Tag,
  ArrowRight,
  MessageSquarePlus,
  Edit3,
  QrCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getTemplatesForBusiness,
  normalizeReviewUrl,
  convertToDirectReviewUrl,
  isDirectReviewCommentUrl,
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
  isStandalone?: boolean;
}

export const SimpleReviewScreen: React.FC<SimpleReviewScreenProps> = ({
  businessName = 'GREENWAVE REFRIGERATION',
  publicReviewUrl = 'https://share.google/N87XploYcGSuoH3Mk',
  whatsappNumber = '+1 (555) 019-2834',
  ownerEmail = 'service@greenwaverefrigeration.com',
  contactMethod = 'both',
  businessCategory = 'refrigeration_hvac',
  customTemplate = '',
  tweakedTemplates,
  onSwitchToOwnerView,
  isStandalone = false,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [privateFeedback, setPrivateFeedback] = useState<string>('');
  const [feedbackDispatched, setFeedbackDispatched] = useState<boolean>(false);
  const [pageOpenedNotice, setPageOpenedNotice] = useState<boolean>(false);
  const [copiedActiveNotice, setCopiedActiveNotice] = useState<boolean>(false);

  const rawDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone =
    rawDigits.length === 10
      ? `91${rawDigits}`
      : rawDigits.length === 11 && rawDigits.startsWith('0')
      ? `91${rawDigits.slice(1)}`
      : rawDigits;

  const targetReviewUrl = convertToDirectReviewUrl(publicReviewUrl) || normalizeReviewUrl(publicReviewUrl);
  const isDirectModal = isDirectReviewCommentUrl(targetReviewUrl);

  const reviewTemplates = getTemplatesForBusiness(
    businessCategory,
    businessName,
    customTemplate,
    tweakedTemplates
  );
  const [activeComment, setActiveComment] = useState<string>(reviewTemplates[0] || '');

  useEffect(() => {
    if (reviewTemplates.length > 0 && !activeComment) {
      setActiveComment(reviewTemplates[0]);
    }
  }, [reviewTemplates, activeComment]);

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return 'Disappointing Experience';
      case 2: return 'Needs Improvement';
      case 3: return 'Average / Could Be Better';
      case 4: return 'Great Experience!';
      case 5: return 'Exceptional Service!';
      default: return '';
    }
  };

  const openReviewCommentSection = (textToCopy?: string) => {
    const text = textToCopy !== undefined ? textToCopy : activeComment;
    if (text && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedActiveNotice(true);
      setTimeout(() => setCopiedActiveNotice(false), 3000);
    }
    window.open(targetReviewUrl, '_blank', 'noopener,noreferrer');
    setPageOpenedNotice(true);
  };

  const handleSelectRating = (selected: number) => {
    setRating(selected);
    if (selected >= 4) {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'],
      });
      const commentToUse = activeComment || reviewTemplates[0] || '';
      if (commentToUse && navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(commentToUse).catch(() => {});
        setCopiedActiveNotice(true);
        setTimeout(() => setCopiedActiveNotice(false), 3000);
      }
      try {
        window.open(targetReviewUrl, '_blank', 'noopener,noreferrer');
        setPageOpenedNotice(true);
      } catch (err) {
        setPageOpenedNotice(false);
      }
    } else {
      setPageOpenedNotice(false);
    }
  };

  const handleSelectTemplateAndGo = (text: string) => {
    setActiveComment(text);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedActiveNotice(true);
      setTimeout(() => setCopiedActiveNotice(false), 3000);
    }
    window.open(targetReviewUrl, '_blank', 'noopener,noreferrer');
    setPageOpenedNotice(true);
  };

  const handleSelectTemplateOnly = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    setActiveComment(text);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedActiveNotice(true);
      setTimeout(() => setCopiedActiveNotice(false), 3000);
    }
  };

  const getFormattedFeedbackMessage = () => {
    const starString = '★'.repeat(rating || 0) + '☆'.repeat(5 - (rating || 0));
    const dateStr = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return `*Direct Customer Feedback for ${businessName}*\n` +
      `⭐ *Rating:* ${starString} (${rating}/5 Stars)\n` +
      `📅 *Date:* ${dateStr}\n\n` +
      `💬 *Feedback Details:*\n${privateFeedback.trim() || 'Customer requested direct management follow-up.'}\n\n` +
      `_(Sent privately via QR Review Funnel)_`;
  };

  const handleOpenWhatsApp = () => {
    const message = getFormattedFeedbackMessage();
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setFeedbackDispatched(true);
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent(`[Private Feedback] Customer rated ${businessName} (${rating}/5 Stars)`);
    const body = encodeURIComponent(
      `Private Customer Feedback Submission\n` +
      `====================================\n\n` +
      `Business: ${businessName}\n` +
      `Rating: ${rating}/5 Stars\n` +
      `Date: ${new Date().toLocaleString()}\n\n` +
      `Customer Notes:\n` +
      `${privateFeedback.trim() || 'Customer indicated an unsatisfactory experience and requested follow-up.'}\n\n` +
      `Please review to address this customer concern.`
    );
    window.location.href = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
    setFeedbackDispatched(true);
  };

  const showWhatsApp = contactMethod === 'both' || contactMethod === 'whatsapp';
  const showEmail = contactMethod === 'both' || contactMethod === 'email';

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-100/60 flex flex-col justify-between py-6 px-4 sm:px-6 font-sans">
      {onSwitchToOwnerView && (
        <div className="no-print max-w-md mx-auto w-full mb-4 flex items-center justify-between bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 text-[11px]">Visitor QR Scan View</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-500 block">Simulating camera scan from your counter stand</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchToOwnerView}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl flex items-center gap-1.5 text-[11px] shadow-sm transition shrink-0"
          >
            <QrCode className="w-3 h-3 text-amber-400" />
            <span>QR Stand</span>
          </button>
        </div>
      )}

      <main className="flex-1 flex items-center justify-center my-auto">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center transition-all">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full mb-3">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Customer Feedback &amp; Reviews</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-2">{businessName}</h1>
          <p className="text-xs text-slate-500 mb-1">Loved our service? Point your phone camera to review us:</p>
          <p className="text-[11px] text-amber-700 font-semibold mb-4">We already have populated comment templates below if you want to choose one!</p>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const active = (hoverRating || rating || 0) >= starVal;
              return (
                <button
                  key={starVal}
                  type="button"
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => handleSelectRating(starVal)}
                  className="p-1 sm:p-2 rounded-xl transition transform hover:scale-110 active:scale-95 focus:outline-none"
                >
                  <Star className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${active ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-slate-200 fill-slate-100 hover:text-amber-200'}`} />
                </button>
              );
            })}
          </div>

          <div className="h-6 mb-4">
            {(hoverRating || rating) && (
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                {getRatingLabel(hoverRating || rating || 0)}
              </span>
            )}
          </div>

          {rating !== null && rating >= 4 && (
            <div className="space-y-4 text-center animate-fadeIn">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-left">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-emerald-100 text-emerald-800 rounded-full"><Sparkles className="w-4 h-4" /></div>
                    <h3 className="text-xs font-bold text-emerald-900">Thank You for Your {rating}-Star Rating!</h3>
                  </div>
                  {isDirectModal && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Direct Comment Box</span>}
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">Your review comment is ready. Tap below to land directly in Google's review comment section and paste!</p>
              </div>

              <div className="text-left bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquarePlus className="w-3.5 h-3.5 text-amber-500" />
                    <span>Your Review Comment (Ready to Paste):</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Editable</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={activeComment}
                    onChange={(e) => setActiveComment(e.target.value)}
                    placeholder="Type or customize your review comment..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-normal text-slate-800 resize-none leading-relaxed"
                  />
                  {copiedActiveNotice && (
                    <span className="absolute right-2 bottom-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm"><Check className="w-2.5 h-2.5" /><span>Copied!</span></span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
                  <span>Pick any template below to swap this comment.</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeComment && navigator?.clipboard?.writeText) {
                        navigator.clipboard.writeText(activeComment).catch(() => {});
                        setCopiedActiveNotice(true);
                        setTimeout(() => setCopiedActiveNotice(false), 2500);
                      }
                    }}
                    className="text-amber-600 font-bold hover:text-amber-800 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openReviewCommentSection()}
                className="w-full py-4 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition transform active:scale-95 cursor-pointer"
              >
                <MessageSquarePlus className="w-5 h-5 text-slate-950" />
                <span>Go to Review Comment Section</span>
                <ExternalLink className="w-4 h-4 text-slate-900" />
              </button>

              <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-100/80 rounded-xl border border-slate-200/80 text-[10px] text-slate-600 text-center">
                <div className="p-1 rounded bg-white font-medium"><span className="block font-bold text-slate-900">1. Copied</span><span>Text on clipboard</span></div>
                <div className="p-1 rounded bg-white font-medium"><span className="block font-bold text-amber-700">2. Lands in Box</span><span>Direct comment popup</span></div>
                <div className="p-1 rounded bg-white font-medium"><span className="block font-bold text-emerald-700">3. Paste &amp; Post</span><span>Tap paste in Google</span></div>
              </div>

              {pageOpenedNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-[11px] text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-900">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Review section opened! Tap &amp; hold in comment box to Paste.
                  </span>
                  <button type="button" onClick={() => openReviewCommentSection()} className="text-amber-700 font-bold underline hover:text-amber-900 ml-2 shrink-0">Open again &rarr;</button>
                </div>
              )}

              <div className="text-left pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Or Tap a Template to Land in Comment Box ({reviewTemplates.length} Options):</span>
                  <span className="text-[10px] text-amber-600 font-bold">1-Tap Select &amp; Go</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {reviewTemplates.map((template, idx) => {
                    const isCustom = customTemplate && idx === 0;
                    const isSelected = activeComment === template;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectTemplateAndGo(template)}
                        className={`w-full p-3 rounded-2xl border text-left text-xs transition cursor-pointer flex flex-col gap-2 ${isSelected ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-amber-300'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {isCustom && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md mb-1"><Tag className="w-2.5 h-2.5" />Custom Business Template</span>
                            )}
                            <p className="text-xs italic leading-relaxed">"{template}"</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] font-bold">
                          <span className="text-amber-700 flex items-center gap-1"><span>Select &amp; Land in Comment Box</span><ArrowRight className="w-3 h-3" /></span>
                          <button
                            type="button"
                            onClick={(e) => handleSelectTemplateOnly(e, template)}
                            className="text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded bg-white border border-slate-200 flex items-center gap-1"
                          >
                            {isSelected ? <><Check className="w-3 h-3 text-emerald-600" /><span className="text-emerald-700">Selected</span></> : <><Edit3 className="w-3 h-3 text-slate-400" /><span>Use in box</span></>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2">
                <button type="button" onClick={() => setRating(null)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto"><RotateCcw className="w-3 h-3" /><span>Change Star Rating</span></button>
              </div>
            </div>
          )}

          {rating !== null && rating <= 3 && (
            <div className="space-y-4 text-left animate-fadeIn">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-100 text-amber-900 rounded-lg shrink-0 mt-0.5"><AlertTriangle className="w-4 h-4" /></div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-900">We're sorry your visit wasn't perfect.</h3>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">Your feedback goes directly to business management so we can make this right immediately.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Describe what happened (Issues &amp; Details):</label>
                <textarea
                  rows={3}
                  value={privateFeedback}
                  onChange={(e) => setPrivateFeedback(e.target.value)}
                  placeholder="Tell us what went wrong and how we can resolve it for you..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-normal"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Send directly to management:</span>
                {showWhatsApp && (
                  <button type="button" onClick={handleOpenWhatsApp} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95">
                    <MessageCircle className="w-4 h-4" /><span>Send via WhatsApp to Owner</span>
                  </button>
                )}
                {showEmail && (
                  <button type="button" onClick={handleOpenEmail} className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95">
                    <Mail className="w-4 h-4" /><span>Send via Email to Management</span>
                  </button>
                )}
              </div>

              {feedbackDispatched && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Feedback dispatched! The management team will review your message.</span>
                </div>
              )}

              <div className="text-center pt-2">
                <button type="button" onClick={() => setRating(null)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto"><RotateCcw className="w-3 h-3" /><span>Change Star Rating</span></button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="no-print mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Stateless Feedback Portal &bull; Direct &amp; Private</span>
        <span className="ml-2 font-bold text-emerald-600">Done</span>
      </footer>
    </div>
  );
};
