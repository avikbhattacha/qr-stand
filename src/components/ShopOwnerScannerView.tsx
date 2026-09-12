import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Copy,
  Check,
  QrCode,
  Smartphone,
  Star,
  MessageCircle,
  Mail,
  Store,
  Eye,
  Link as LinkIcon,
  Sparkles,
  Tag,
  PenTool,
  FileText,
  ExternalLink,
  MessageSquarePlus,
  Sliders,
  RotateCcw,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import {
  INDUSTRY_CATEGORIES,
  getTemplatesForBusiness,
  normalizeReviewUrl,
  convertToDirectReviewUrl,
  isDirectReviewCommentUrl,
  getDefaultTemplates,
  getStoredTweakedTemplates,
  setStoredTweakedTemplates,
  clearStoredTweakedTemplates,
  encodeTemplatesForUrl,
} from '../data/industryTemplates';

interface ShopOwnerScannerViewProps {
  businessName: string;
  setBusinessName: (val: string) => void;
  publicReviewUrl: string;
  setPublicReviewUrl: (val: string) => void;
  businessCategory: string;
  setBusinessCategory: (val: string) => void;
  customTemplate: string;
  setCustomTemplate: (val: string) => void;
  tweakedTemplates?: string[];
  setTweakedTemplates?: (val: string[]) => void;
  contactMethod: 'both' | 'whatsapp' | 'email';
  setContactMethod: (val: 'both' | 'whatsapp' | 'email') => void;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  ownerEmail: string;
  setOwnerEmail: (val: string) => void;
  onPreviewCustomerScan: () => void;
}

export const ShopOwnerScannerView: React.FC<ShopOwnerScannerViewProps> = ({
  businessName,
  setBusinessName,
  publicReviewUrl,
  setPublicReviewUrl,
  businessCategory,
  setBusinessCategory,
  customTemplate,
  setCustomTemplate,
  tweakedTemplates,
  setTweakedTemplates,
  contactMethod,
  setContactMethod,
  whatsappNumber,
  setWhatsappNumber,
  ownerEmail,
  setOwnerEmail,
  onPreviewCustomerScan,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [standTheme, setStandTheme] = useState<'gold' | 'navy' | 'minimal'>('gold');
  const standRef = useRef<HTMLDivElement>(null);

  const defaultCategoryTemplates = getDefaultTemplates(businessCategory);
  const [activeCategoryTemplates, setActiveCategoryTemplates] = useState<string[]>(() => {
    const stored = getStoredTweakedTemplates(businessCategory);
    if (stored && stored.length > 0) return stored;
    if (tweakedTemplates && tweakedTemplates.length > 0) return tweakedTemplates;
    return defaultCategoryTemplates;
  });

  const [editingTemplateIdx, setEditingTemplateIdx] = useState<number | null>(null);
  const [editTemplateValue, setEditTemplateValue] = useState<string>('');
  const [isTemplatesExpanded, setIsTemplatesExpanded] = useState<boolean>(true);
  const [saveToast, setSaveToast] = useState<string>('');

  useEffect(() => {
    const defaults = getDefaultTemplates(businessCategory);
    const stored = getStoredTweakedTemplates(businessCategory);
    const resolved = stored && stored.length > 0 ? stored : defaults;
    setActiveCategoryTemplates(resolved);
    setEditingTemplateIdx(null);
    if (setTweakedTemplates) setTweakedTemplates(resolved);
  }, [businessCategory]);

  const tweakedCount = activeCategoryTemplates.filter(
    (t, i) => i >= defaultCategoryTemplates.length || t !== defaultCategoryTemplates[i]
  ).length;

  const handleStartEdit = (idx: number) => {
    setEditingTemplateIdx(idx);
    setEditTemplateValue(activeCategoryTemplates[idx] || '');
    setIsTemplatesExpanded(true);
    setTimeout(() => {
      const el = document.getElementById(`template-tweak-item-${idx}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleSaveEdit = (idx: number) => {
    if (!editTemplateValue.trim()) return;
    const updated = [...activeCategoryTemplates];
    updated[idx] = editTemplateValue.trim();
    setActiveCategoryTemplates(updated);
    setStoredTweakedTemplates(businessCategory, updated);
    if (setTweakedTemplates) setTweakedTemplates(updated);
    setEditingTemplateIdx(null);
    setSaveToast(`Template #${idx + 1} updated!`);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleRevertTemplate = (idx: number) => {
    const defaults = getDefaultTemplates(businessCategory);
    const updated = [...activeCategoryTemplates];
    if (idx < defaults.length) updated[idx] = defaults[idx];
    setActiveCategoryTemplates(updated);
    setStoredTweakedTemplates(businessCategory, updated);
    if (setTweakedTemplates) setTweakedTemplates(updated);
    if (editingTemplateIdx === idx) setEditTemplateValue(defaults[idx] || '');
    setSaveToast(`Template #${idx + 1} restored to original`);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleResetAllToDefaults = () => {
    const defaults = getDefaultTemplates(businessCategory);
    setActiveCategoryTemplates(defaults);
    clearStoredTweakedTemplates(businessCategory);
    if (setTweakedTemplates) setTweakedTemplates(defaults);
    setEditingTemplateIdx(null);
    setSaveToast('All templates restored to industry defaults');
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleAddNewTemplate = () => {
    const newTpl = `Top-notch quality, prompt communication, and exceptional care from {name}! Will definitely be recommending to others.`;
    const updated = [...activeCategoryTemplates, newTpl];
    setActiveCategoryTemplates(updated);
    setStoredTweakedTemplates(businessCategory, updated);
    if (setTweakedTemplates) setTweakedTemplates(updated);
    setEditingTemplateIdx(updated.length - 1);
    setEditTemplateValue(newTpl);
    setIsTemplatesExpanded(true);
  };

  const handleRemoveTemplate = (idx: number) => {
    if (activeCategoryTemplates.length <= 2) return;
    const updated = activeCategoryTemplates.filter((_, i) => i !== idx);
    setActiveCategoryTemplates(updated);
    setStoredTweakedTemplates(businessCategory, updated);
    if (setTweakedTemplates) setTweakedTemplates(updated);
    if (editingTemplateIdx === idx) setEditingTemplateIdx(null);
  };

  const insertToken = (token: string) => {
    setEditTemplateValue((prev) => `${prev.trim()} ${token}`);
  };

  const directReviewUrl = convertToDirectReviewUrl(publicReviewUrl) || normalizeReviewUrl(publicReviewUrl);
  const isDirectModal = isDirectReviewCommentUrl(publicReviewUrl);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [copiedQRImage, setCopiedQRImage] = useState<boolean>(false);

  const isTweakedFromDefaults = activeCategoryTemplates.some(
    (t, i) => i >= defaultCategoryTemplates.length || t !== defaultCategoryTemplates[i]
  );

  const buildScanUrl = (includeTemplates: boolean = true) => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('mode', 'review');
    params.set('name', businessName || '');
    params.set('url', directReviewUrl || '');
    params.set('cat', businessCategory || '');
    if (customTemplate && customTemplate.trim()) params.set('customTpl', customTemplate.trim());
    if (includeTemplates && isTweakedFromDefaults) {
      const encoded = encodeTemplatesForUrl(activeCategoryTemplates);
      if (encoded) params.set('tpls', encoded);
    }
    params.set('contact', contactMethod);
    params.set('wa', whatsappNumber);
    if (ownerEmail && ownerEmail.trim()) params.set('email', ownerEmail.trim());
    return `${base}?${params.toString()}`;
  };

  const customerScanUrl = buildScanUrl(true);
  const activeTemplates = getTemplatesForBusiness(businessCategory, businessName, customTemplate, activeCategoryTemplates);

  useEffect(() => {
    let cancelled = false;
    const generateQR = async () => {
      const renderQR = async (data: string, ecLevel: 'M' | 'L' | 'H') => {
        const url = await QRCode.toDataURL(data, {
          width: 800, margin: 1, color: { dark: '#0f172a', light: '#ffffff' }, errorCorrectionLevel: ecLevel,
        });
        const svg = await QRCode.toString(data, {
          type: 'svg', margin: 1, color: { dark: '#0f172a', light: '#ffffff' }, errorCorrectionLevel: ecLevel,
        });
        return { url, svg };
      };

      try {
        const res = await renderQR(customerScanUrl, 'M');
        if (!cancelled) { setQrDataUrl(res.url); setQrSvg(res.svg); }
        return;
      } catch (err1) {
        try {
          const res = await renderQR(customerScanUrl, 'L');
          if (!cancelled) { setQrDataUrl(res.url); setQrSvg(res.svg); }
          return;
        } catch (err2) {
          try {
            const compactUrl = buildScanUrl(false);
            const res = await renderQR(compactUrl, 'M');
            if (!cancelled) { setQrDataUrl(res.url); setQrSvg(res.svg); }
          } catch (err3) {}
        }
      }
    };
    generateQR();
    return () => { cancelled = true; };
  }, [customerScanUrl, isTweakedFromDefaults, businessCategory, businessName, directReviewUrl, whatsappNumber]);

  // Download full standalone stand graphic as PNG using HTML5 Canvas rendering
  const handleDownloadStandPNG = async () => {
    if (!standRef.current) return;
    try {
      // Dynamically import html2canvas or use standard canvas drawing
      const node = standRef.current;
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(node, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
      const image = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = image;
      const safeName = (businessName || 'review-stand').toLowerCase().replace(/[^a-z0-9]/g, '-');
      a.download = `${safeName}-counter-stand.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to render standalone stand image:', err);
      // Fallback: download raw QR if canvas renderer fails
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = 'review-qr.png';
      a.click();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerScanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
              <QrCode className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Review Stand &amp; QR Generator</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Stateless &amp; Instant</span>
          </div>
          <p className="text-xs text-slate-500">
            Configure your business details, review page link, and industry templates. Generate scannable counter stands that route happy reviews (4-5) directly to your review profile with 6+ ready-made templates, and route issues (1-3) privately to WhatsApp or Email.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={handleDownloadStandPNG} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-98">
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Stand (PNG)</span>
          </button>
          <button onClick={onPreviewCustomerScan} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-98">
            <Eye className="w-4 h-4" />
            <span>Test Customer Scan</span>
          </button>
        </div>
      </div>

      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Business Configuration</span>
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Business Name</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. GREENWAVE REFRIGERATION" className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
              <span>Business Industry Category</span>
              <span className="text-[10px] text-amber-600 font-semibold">6 Tailored Templates</span>
            </label>
            <select value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
              {INDUSTRY_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.description})</option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <label className="text-xs font-bold text-slate-800">Pre-Built Review Templates</label>
              </div>
              <div className="flex items-center gap-1.5">
                {tweakedCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    <span>{tweakedCount} Tweaked</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200/70 text-slate-600">
                    {activeCategoryTemplates.length} Available
                  </span>
                )}
                <button onClick={() => setIsTemplatesExpanded(!isTemplatesExpanded)} className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50 transition">
                  {isTemplatesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">Tweak any pre-built template so it reflects your exact services, personnel, or tone. Customers can tap and copy these directly into your review box!</p>
            {saveToast && (
              <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{saveToast}</span>
              </div>
            )}
            {isTemplatesExpanded && (
              <div className="space-y-2.5 pt-1">
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {activeCategoryTemplates.map((template, idx) => {
                    const isTweaked = idx >= defaultCategoryTemplates.length || template !== defaultCategoryTemplates[idx];
                    const isEditing = editingTemplateIdx === idx;
                    return (
                      <div key={idx} id={`template-tweak-item-${idx}`} className={`p-3 rounded-xl border transition-all ${isEditing ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/20' : isTweaked ? 'bg-amber-50/20 border-amber-200 hover:border-amber-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                                <Edit3 className="w-3 h-3 text-amber-600" />
                                <span>Editing Template #{idx + 1}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{editTemplateValue.length} chars</span>
                            </div>
                            <textarea rows={3} value={editTemplateValue} onChange={(e) => setEditTemplateValue(e.target.value)} className="w-full p-2 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed" autoFocus />
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] text-slate-400 font-semibold">Quick insert:</span>
                              <button onClick={() => insertToken('{name}')} className="px-1.5 py-0.5 bg-white hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold rounded shadow-2xs transition">+ {'{name}'}</button>
                              <button onClick={() => insertToken(businessName || 'our business')} className="px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold rounded shadow-2xs transition">+ "{businessName || 'business'}"</button>
                            </div>
                            <div className="p-2 bg-white/80 rounded-lg border border-amber-200/60 text-[11px] text-slate-600 italic">
                              <span className="font-semibold not-italic text-slate-400 text-[10px] block mb-0.5">Preview as customer sees it:</span>
                              "{editTemplateValue.replace(/\{name\}/g, businessName || 'this business')}"
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => handleSaveEdit(idx)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-2xs transition active:scale-95"><Save className="w-3 h-3 text-slate-900" /><span>Save Tweak</span></button>
                                <button onClick={() => setEditingTemplateIdx(null)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1 transition"><X className="w-3 h-3" /><span>Cancel</span></button>
                              </div>
                              {idx < defaultCategoryTemplates.length && (
                                <button onClick={() => handleRevertTemplate(idx)} className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"><RotateCcw className="w-2.5 h-2.5" /><span>Revert</span></button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Template #{idx + 1}</span>
                                {isTweaked ? <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md"><Sparkles className="w-2.5 h-2.5 text-amber-600" /><span>Tweaked</span></span> : <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">Default</span>}
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleStartEdit(idx)} className="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1 transition active:scale-95"><Edit3 className="w-3 h-3 text-slate-500" /><span>Tweak</span></button>
                                {isTweaked && idx < defaultCategoryTemplates.length && <button onClick={() => handleRevertTemplate(idx)} className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition"><RotateCcw className="w-3 h-3" /></button>}
                                {idx >= defaultCategoryTemplates.length && <button onClick={() => handleRemoveTemplate(idx)} className="p-1 text-red-400 hover:text-red-700 rounded hover:bg-red-50 transition"><Trash2 className="w-3 h-3" /></button>}
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed italic">"{template.replace(/\{name\}/g, businessName || 'this business')}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <button onClick={handleAddNewTemplate} className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-100/60 transition"><Plus className="w-3.5 h-3.5" /><span>Add Another Template</span></button>
                  {tweakedCount > 0 && <button onClick={handleResetAllToDefaults} className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition"><RotateCcw className="w-3 h-3" /><span>Reset All</span></button>}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5 text-slate-500" /><span>Promoted Custom Template (Pinned to Top)</span></label>
              <span className="text-[10px] font-medium text-slate-400">Optional</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">Add a specialized promo or seasonal review to appear as the very first option for customers.</p>
            <textarea rows={2} value={customTemplate} onChange={(e) => setCustomTemplate(e.target.value)} placeholder="e.g. Diagnosed our walk-in freezer issue fast, saved our inventory, and charged a fair price!" className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><MessageSquarePlus className="w-3.5 h-3.5 text-amber-500" /><span>Business Review Page Link</span></label>
              <a href="https://support.google.com/business/answer/16816815?hl=en-IN&ref_topic=4596755&sjid=4455838597510979161-NC" target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-600 font-bold hover:underline flex items-center gap-0.5">
                <span>Direct Comment Box Guide</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="url" value={publicReviewUrl} onChange={(e) => setPublicReviewUrl(e.target.value)} placeholder="Paste your business review page link here" className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button onClick={() => window.open(directReviewUrl, '_blank', 'noopener,noreferrer')} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-2xs"><ExternalLink className="w-3.5 h-3.5 text-slate-900" /><span>Test Link</span></button>
            </div>
            <div className="flex items-center justify-between">
              {isDirectModal ? (
                <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1.5 font-semibold"><Check className="w-3 h-3 text-emerald-600 shrink-0" /><span>Configured to land directly in Google's comment box</span></div>
              ) : (
                <div className="text-[10px] text-slate-500 flex items-center gap-1"><span>Customers rating 4-5 will be taken to this link.</span></div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
              <span>Private Feedback Destination (1-3)</span>
              <span className="text-[10px] text-slate-400 font-normal">Issues sent to owner</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 'both', label: 'WhatsApp & Email' }, { id: 'whatsapp', label: 'WhatsApp Only' }, { id: 'email', label: 'Email Only' }].map((m) => (
                <button key={m.id} onClick={() => setContactMethod(m.id as any)} className={`py-1.5 px-2 text-center rounded-xl text-xs font-semibold border transition ${contactMethod === m.id ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>{m.label}</button>
              ))}
            </div>
          </div>

          {(contactMethod === 'both' || contactMethod === 'whatsapp') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">WhatsApp Phone Number</label>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><span>Default: +91</span></span>
              </div>
              <div className="relative">
                <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+91 98765 43210" className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
          )}

          {(contactMethod === 'both' || contactMethod === 'email') && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Owner / Management Email</label>
              <div className="relative">
                <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="service@business.com" className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500" />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Stand Visual Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 'gold', label: 'Gold Executive' }, { id: 'navy', label: 'Classic Navy' }, { id: 'minimal', label: 'Minimal Monochrome' }].map((t) => (
                <button key={t.id} onClick={() => setStandTheme(t.id as any)} className={`py-1.5 px-2 text-center rounded-xl text-xs font-semibold border transition ${standTheme === t.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>{t.label}</button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Encoded Customer Scan Link (Stateless):</span>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={customerScanUrl} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-600 truncate" />
              <button onClick={handleCopyLink} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Copied</span></> : <><Copy className="w-3.5 h-3.5 text-slate-500" /><span>Copy</span></>}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5 text-amber-600" /><span>Counter Stand Output</span></span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /><span>Scannable QR</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsQRModalOpen(true)} className="text-xs font-semibold px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg flex items-center gap-1 transition"><Maximize2 className="w-3 h-3 text-amber-700" /><span>Enlarge QR</span></button>
              <button onClick={handleDownloadStandPNG} className="text-xs font-semibold px-3 py-1 bg-slate-900 text-white rounded-lg flex items-center gap-1 transition shadow-sm"><Download className="w-3.5 h-3.5 text-amber-400" /><span>Download Stand (PNG)</span></button>
            </div>
          </div>

          <div className="bg-slate-200/80 p-6 sm:p-10 rounded-2xl flex items-center justify-center overflow-x-auto min-h-[520px]">
            {/* The Physical Card Stand Ref for HTML5 PNG Download */}
            <div
              ref={standRef}
              className={`w-[340px] sm:w-[380px] bg-white rounded-3xl p-8 text-center shadow-2xl border transition-all ${standTheme === 'gold' ? 'border-amber-400 ring-2 ring-amber-400/20' : standTheme === 'navy' ? 'border-4 border-slate-900' : 'border-2 border-black'}`}
            >
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase mb-3 bg-amber-50 text-amber-900 border border-amber-200"><span>Leave Us a Review</span></div>
              <div className="flex justify-center items-center gap-1 mb-3">{[1, 2, 3, 4, 5].map((s) => (<Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-2xs" />))}</div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug mb-1">{businessName || 'YOUR BUSINESS'}</h3>
              <p className="text-xs text-slate-500 mb-5">Loved our service? Point your phone camera to review us:</p>
              
              <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm mb-3 inline-block relative group cursor-pointer transition hover:shadow-md hover:scale-[1.01]" onClick={() => setIsQRModalOpen(true)}>
                {qrDataUrl ? <img src={qrDataUrl} alt="QR" className="w-48 h-48 rounded-lg mx-auto" /> : <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2"><QrCode className="w-8 h-8 animate-bounce text-amber-500" /><span className="text-xs font-semibold">Generating QR...</span></div>}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 mb-1"><Smartphone className="w-4 h-4 text-amber-600" /><span>Scan with any smartphone camera</span></div>
              <p className="text-[11px] text-slate-400">Takes less than 30 seconds</p>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <button onClick={onPreviewCustomerScan} className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"><Eye className="w-3.5 h-3.5 text-slate-600" /><span>Simulate Customer Scan Flow</span></button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-amber-500" /><span>Active Review Templates ({activeTemplates.length})</span></span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Ready for 1-Click Copy</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {activeTemplates.map((tpl, i) => {
                const isCustom = Boolean(customTemplate && i === 0);
                return (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition flex flex-col justify-between gap-1.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400">Option {i + 1} {isCustom ? ' Custom' : ''}:</span>
                      </div>
                      <p className="italic text-[11px] leading-relaxed line-clamp-3">"{tpl}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsQRModalOpen(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsQRModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">{businessName}</h3>
            <div className="p-4 bg-white border-4 border-slate-900 rounded-3xl inline-block shadow-md mb-4">
              {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-64 h-64 mx-auto rounded-xl" />}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleDownloadStandPNG} className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center"><Download className="w-4 h-4 mr-1" /> Download Stand</button>
              <button onClick={handleCopyLink} className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center"><Copy className="w-4 h-4 mr-1" /> Copy Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
