import React, { useState, useEffect } from 'react';
import { SimpleReviewScreen } from './components/SimpleReviewScreen';
import { ShopOwnerScannerView } from './components/ShopOwnerScannerView';
import { QrCode, Smartphone, Star } from 'lucide-react';
import {
  decodeTemplatesFromUrl,
  getStoredTweakedTemplates,
} from './data/industryTemplates';

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode = searchParams.get('mode') === 'review' ? 'review' : 'owner';
  
  // Clean initialization: Owners fill in their own details dynamically
  const initialName = searchParams.get('name') || '';
  const initialReviewUrl =
    searchParams.get('url') ||
    searchParams.get('google') ||
    '';
  const initialCategory = searchParams.get('cat') || 'general';
  const initialCustomTpl = searchParams.get('customTpl') || '';
  const initialContact = (searchParams.get('contact') as 'both' | 'whatsapp' | 'email') || 'both';
  const initialWa = searchParams.get('wa') || '';
  const initialEmail = searchParams.get('email') || '';
  
  const initialUrlTpls = searchParams.get('tpls');
  const decodedTpls = initialUrlTpls ? decodeTemplatesFromUrl(initialUrlTpls) : null;
  const initialTweakedTpls =
    decodedTpls && decodedTpls.length > 0
      ? decodedTpls
      : getStoredTweakedTemplates(initialCategory) || [];

  const [activeView, setActiveView] = useState<'owner' | 'review'>(initialMode);
  const [businessName, setBusinessName] = useState<string>(initialName);
  const [publicReviewUrl, setPublicReviewUrl] = useState<string>(initialReviewUrl);
  const [businessCategory, setBusinessCategory] = useState<string>(initialCategory);
  const [customTemplate, setCustomTemplate] = useState<string>(initialCustomTpl);
  const [tweakedTemplates, setTweakedTemplates] = useState<string[]>(initialTweakedTpls);
  const [contactMethod, setContactMethod] = useState<'both' | 'whatsapp' | 'email'>(initialContact);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(initialWa);
  const [ownerEmail, setOwnerEmail] = useState<string>(initialEmail);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'review') setActiveView('review');
    if (params.get('name')) setBusinessName(params.get('name')!);
    if (params.get('url')) setPublicReviewUrl(params.get('url')!);
    else if (params.get('google')) setPublicReviewUrl(params.get('google')!);
    if (params.get('cat')) setBusinessCategory(params.get('cat')!);
    if (params.get('customTpl')) setCustomTemplate(params.get('customTpl')!);
    if (params.get('contact')) {
      setContactMethod(params.get('contact') as 'both' | 'whatsapp' | 'email');
    }
    if (params.get('wa')) setWhatsappNumber(params.get('wa')!);
    if (params.get('email')) setOwnerEmail(params.get('email')!);
    if (params.get('tpls')) {
      const parsed = decodeTemplatesFromUrl(params.get('tpls')!);
      if (parsed.length > 0) setTweakedTemplates(parsed);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
              <Star className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white block">
                  ReviewerPulse
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Smart Review QR &amp; Stand
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveView('owner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'owner'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Stand &amp; Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'review'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Customer Scan Test</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activeView === 'owner' ? (
          <ShopOwnerScannerView
            businessName={businessName}
            setBusinessName={setBusinessName}
            publicReviewUrl={publicReviewUrl}
            setPublicReviewUrl={setPublicReviewUrl}
            businessCategory={businessCategory}
            setBusinessCategory={setBusinessCategory}
            customTemplate={customTemplate}
            setCustomTemplate={setCustomTemplate}
            tweakedTemplates={tweakedTemplates}
            setTweakedTemplates={setTweakedTemplates}
            contactMethod={contactMethod}
            setContactMethod={setContactMethod}
            whatsappNumber={whatsappNumber}
            setWhatsappNumber={setWhatsappNumber}
            ownerEmail={ownerEmail}
            setOwnerEmail={setOwnerEmail}
            onPreviewCustomerScan={() => setActiveView('review')}
          />
        ) : (
          <SimpleReviewScreen
            businessName={businessName}
            publicReviewUrl={publicReviewUrl}
            whatsappNumber={whatsappNumber}
            ownerEmail={ownerEmail}
            contactMethod={contactMethod}
            businessCategory={businessCategory}
            customTemplate={customTemplate}
            tweakedTemplates={tweakedTemplates}
            onSwitchToOwnerView={() => setActiveView('owner')}
          />
        )}
      </main>
    </div>
  );
}
