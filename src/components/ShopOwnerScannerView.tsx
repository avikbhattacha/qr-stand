import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
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
  PenTool,
  FileText,
  Sliders,
  ExternalLink,
  MessageSquarePlus,
  HelpCircle,
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
  const [placeIdInput, setPlaceIdInput] = useState<string>('');
  const [showDirectHelp, setShowDirectHelp] = useState<boolean>(false);

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
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [copiedQRImage, setCopiedQRImage] = useState<boolean>(false);

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
    setSaveToast(`Template #${idx + 1} restored`);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const directReviewUrl = convertToDirectReviewUrl(publicReviewUrl) || normalizeReviewUrl(publicReviewUrl);
  const isDirectModal = isDirectReviewCommentUrl(publicReviewUrl);
  const isTweakedFromDefaults = activeCategoryTemplates.some(
    (t, i) => i >= defaultCategoryTemplates.length || t !== defaultCategoryTemplates[i]
  );

  const buildScanUrl = () => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('mode', 'review');
    params.set('name', businessName || '');
    params.set('url', directReviewUrl || '');
    params.set('cat', businessCategory || '');
    if (customTemplate && customTemplate.trim()) params.set('customTpl', customTemplate.trim());
    if (isTweakedFromDefaults) {
      const encoded = encodeTemplatesForUrl(activeCategoryTemplates);
      if (encoded) params.set('tpls', encoded);
    }
    params.set('contact', contactMethod);
    params.set('wa', whatsappNumber);
    if (ownerEmail && ownerEmail.trim()) params.set('email', ownerEmail.trim());
    return `${base}?${params.toString()}`;
  };

  const customerScanUrl = buildScanUrl();
  const activeTemplates = getTemplatesForBusiness(
    businessCategory,
    businessName,
    customTemplate,
    activeCategoryTemplates
  );

  useEffect(() => {
    let cancelled = false;
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(customerScanUrl, { width: 800, margin: 1 });
        const svg = await QRCode.toString(customerScanUrl, { type: 'svg', margin: 1 });
        if (!cancelled) {
          setQrDataUrl(url);
          setQrSvg(svg);
        }
      } catch (err) {
        console.error(err);
      }
    };
    generateQR();
    return () => { cancelled = true; };
  }, [customerScanUrl, businessName]);

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
              <QrCode className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Review Stand &amp; QR Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Configure your business details below to generate a scannable stand preview.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Counter Stand</span>
          </button>
          <button
            type="button"
            onClick={onPreviewCustomerScan}
            className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Test Customer Scan</span>
          </button>
        </div>
      </div>

      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Business Configuration</span>
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name"
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Industry Category</label>
            <select
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            >
              {INDUSTRY_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Google Review Page Link</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={publicReviewUrl}
                onChange={(e) => setPublicReviewUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl"
              />
              <button
                type="button"
                onClick={() => window.open(directReviewUrl, '_blank')}
                className="px-3 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shrink-0"
              >
                Test Link
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Phone Number</label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+1 555-019-2834"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Management Email</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="owner@business.com"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-200 p-8 rounded-2xl flex items-center justify-center min-h-[500px]">
            <div className="w-[340px] bg-white rounded-3xl p-6 text-center shadow-2xl border-4 border-slate-900">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">★ LEAVE US A REVIEW ★</p>
              <div className="text-amber-400 text-xl mb-2">★★★★★</div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                {businessName || 'YOUR BUSINESS NAME'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">Point your phone camera to review us:</p>
              
              <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl inline-block mb-3">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 rounded-lg" />
                ) : (
                  <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-lg" />
                )}
              </div>

              <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Scan with any smartphone camera</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
