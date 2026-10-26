/**
 * Next.js Project Structure Identifier:
 * components/PricingSection.jsx
 * 
 * Project Identity: ليرن ويب | Lern Web
 * Purpose: Full Pricing, Licensing Tiers & Payment Wallets Section
 * Features:
 *   - 3 Flexible Licensing Tiers (Monthly, Annual, Full Outright Buyout)
 *   - Live Mobile Wallets (Vodafone Cash, Orange Cash, InstaPay)
 *   - 1-click WhatsApp order integration
 *   - Copy wallet details & interactive transaction guide
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, Check, Sparkles, Smartphone, Copy, CheckCircle2, 
  ArrowUpRight, CreditCard, Lock, MessageSquare, Zap, Crown, Star
} from 'lucide-react';
import { SubscriptionPlan, WalletConfig, AdminSettings, buildWhatsAppUrl } from '../src/services/storageService';

interface PricingSectionProps {
  plans: SubscriptionPlan[];
  wallets: WalletConfig[];
  adminSettings: AdminSettings;
  lang?: 'ar' | 'en';
  onLaunchSandbox?: (config?: any) => void;
  showToast?: (message: string, type?: 'success' | 'error') => void;
  isAdmin?: boolean;
  onOpenAdminWallets?: () => void;
}

export default function PricingSection({
  plans = [],
  wallets = [],
  adminSettings,
  lang = 'ar',
  onLaunchSandbox = () => {},
  showToast = () => {},
  isAdmin = false,
  onOpenAdminWallets = () => {}
}: PricingSectionProps) {
  const isRtl = lang === 'ar';
  const targetWhatsAppNumber = adminSettings?.targetWhatsAppNumber || '201024889921';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeWalletTab, setActiveWalletTab] = useState<string>(wallets[0]?.id || 'vodafone-cash');

  const handleCopyWalletNumber = (wallet: WalletConfig) => {
    navigator.clipboard.writeText(wallet.number);
    setCopiedId(wallet.id);
    showToast(isRtl ? `تم نسخ رقم المحفظة (${wallet.number}) بنجاح!` : `Copied wallet number (${wallet.number})!`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOrderPlanWhatsApp = (plan: SubscriptionPlan) => {
    const planName = isRtl ? plan.nameAr : plan.nameEn;
    const planPrice = isRtl ? plan.priceAr : plan.priceEn;
    const message = isRtl
      ? `مرحباً، أود الاشتراك في *${planName}* بسعر (${planPrice}) لمنظومة ليرن ويب. يرجى تزويدي بخطوات الدفع وتفعيل المنصة.`
      : `Hello, I would like to subscribe to *${planName}* (${planPrice}) on Lern Web. Please provide onboarding steps.`;
    window.open(buildWhatsAppUrl(targetWhatsAppNumber, message), '_blank');
  };

  const planFeaturesMapAr: Record<string, string[]> = {
    'plan-monthly': [
      'استضافة سحابية فائقة السرعة على خوادم Edge',
      'تحديثات الأمان الدورية ودعم فني مستمر',
      'دعم كامل لتطبيقات الويب التقدمية PWA',
      'توليد باركود QR لحضور الطلاب',
      'دفع شهري مرن مع إمكانية الإلغاء في أي وقت'
    ],
    'plan-annual': [
      'اسم نطاق مخصص مجاني (Custom Domain) باسم مركزك',
      'سعة غير محدودة للطلاب والامتحانات الذكية',
      'أولوية قصوى في الدعم الفني المباشر (SLA 24/7)',
      'تحديثات مجانية دورية لكافة الميزات والـ CMS',
      'وفر 25% مقارنة بالاشتراك الشهري'
    ],
    'plan-full': [
      'التسليم الكامل للكود المصدري الأصلي بدون تشفير',
      'مستودع GitHub خاص بك مع ملكية فكرية مدى الحياة',
      'ترخيص استخدام غير محدود بدون أي رسوم شهرية أو سنوية',
      'حرية كاملة في تعديل الأكواد واستضافة المنظومة على خوادمك',
      'جلسة تدريب تقني مع مهندسي ليرن ويب لتسليم الكود'
    ]
  };

  const planFeaturesMapEn: Record<string, string[]> = {
    'plan-monthly': [
      'Ultra-fast cloud hosting on Edge network',
      'Continuous security updates and tech support',
      'Full Progressive Web App (PWA) offline engine',
      'Instant QR check-in gate generator',
      'Flexible month-to-month billing with no lock-in'
    ],
    'plan-annual': [
      'Free Custom Domain with SSL certificate included',
      'Unlimited student quotas and AI exams capacity',
      '24/7 VIP Priority Engineering SLA',
      'Complimentary updates for all CMS features',
      'Save over 25% compared to monthly tier'
    ],
    'plan-full': [
      'Complete uncompressed source code delivery',
      'Private GitHub repository with perpetual ownership',
      'Zero recurring monthly or annual subscription fees',
      '100% freedom to customize and self-host anywhere',
      '1-on-1 technical onboarding handoff session'
    ]
  };

  return (
    <section id="pricing" className="w-full space-y-12 my-12 animate-fadeIn scroll-mt-24">
      {/* Header Container */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isRtl ? 'باقات الاشتراك، الترخيص والتملك الكامل' : 'Licensing Tiers & Outright Buyout'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {isRtl ? 'نماذج استثمار مرنة تناسب طموح مركزك' : 'Flexible Investment Models Built for Growth'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isRtl 
                ? 'اختر بين الاشتراك الشهري المرن، الترخيص السنوي الشامل، أو التملك التام والنهائي للكود المصدري الأصلي بدون أي اشتراكات متكررة.'
                : 'Choose between operational monthly rental, high-performance annual suite, or perpetual source code buyout with zero recurring charges.'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAdminWallets}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition active:scale-95 shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isRtl ? 'إدارة الأسعار والمحافظ' : 'Manage Pricing & Wallets'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {plans.map((plan) => {
          const isPopular = plan.isPopular;
          const features = (isRtl ? planFeaturesMapAr[plan.id] : planFeaturesMapEn[plan.id]) || [
            isRtl ? 'استضافة وتشغيل فوري' : 'Instant deployment',
            isRtl ? 'تطبيق ويب PWA متكامل' : 'Full PWA compliance',
            isRtl ? 'دعم فني مباشر' : 'Direct support'
          ];

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? 'border-2 border-blue-500 bg-gradient-to-b from-blue-950/70 via-slate-900 to-slate-900 shadow-2xl shadow-blue-900/30 scale-[1.02]'
                  : 'border border-slate-800 bg-slate-900/90 hover:border-slate-700 shadow-xl'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-black text-white shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{isRtl ? plan.badgeAr || 'الأكثر طلباً' : plan.badgeEn || 'Most Popular'}</span>
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">
                      {isRtl ? plan.nameAr : plan.nameEn}
                    </h3>
                    {!isPopular && plan.badgeAr && (
                      <span className="rounded-lg bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-400">
                        {isRtl ? plan.badgeAr : plan.badgeEn}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                    {isRtl ? plan.descriptionAr : plan.descriptionEn}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-1">
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    {isRtl ? plan.priceAr : plan.priceEn}
                  </div>
                  <div className="text-xs text-blue-400 font-bold">
                    {isRtl ? plan.periodAr : plan.periodEn}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isRtl ? 'المميزات المتضمنة في الباقة:' : 'Included Features:'}
                  </div>
                  <ul className="space-y-2.5">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2.5">
                <button
                  onClick={() => handleOrderPlanWhatsApp(plan)}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs sm:text-sm font-black transition active:scale-95 shadow-lg ${
                    isPopular
                      ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-blue-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>{isRtl ? 'طلب الاشتراك وتأكيد الحجز عبر واتساب' : 'Order via WhatsApp'}</span>
                </button>

                <button
                  onClick={() => onLaunchSandbox()}
                  className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-blue-400 transition"
                >
                  {isRtl ? 'تجربة المحاكي التفاعلي أولاً ←' : 'Try Live Sandbox First →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Wallets Showcase */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 md:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Smartphone className="w-4 h-4" />
              <span>{isRtl ? 'طرق الدفع والتحويل المعتمدة' : 'Instant Payment Wallets'}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white">
              {isRtl ? 'محافظ إلكترونية وتحويل بنكي فوري 0% عمولة' : 'Instant Mobile Wallets & Bank IPN Transfer'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl 
                ? 'ندعم التحويل المباشر عبر المحافظ الإلكترونية المصرية وانستاباي لتفعيل المنظومة في غضون دقائق.'
                : 'Instant transfers via Vodafone Cash, Orange Cash, and InstaPay without transaction fees.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {wallets.filter(w => w.isActive).map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveWalletTab(w.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeWalletTab === w.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color || '#3b82f6' }} />
                <span>{isRtl ? w.nameAr : w.nameEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Wallet Display */}
        {(() => {
          const currentWallet = wallets.find(w => w.id === activeWalletTab) || wallets[0];
          if (!currentWallet) return null;
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg text-lg" style={{ backgroundColor: currentWallet.color || '#2563eb' }}>
                    📱
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">
                      {isRtl ? currentWallet.nameAr : currentWallet.nameEn}
                    </h4>
                    <span className="text-xs font-semibold text-emerald-400">
                      {currentWallet.badge || (isRtl ? 'تحويل لحظي معتمد' : 'Instant Verified Transfer')}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="text-xs text-slate-400 font-bold">
                    {isRtl ? 'تعليمات وإرشادات الدفع:' : 'Transfer Instructions:'}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isRtl ? currentWallet.instructionsAr : currentWallet.instructionsEn}
                  </p>
                </div>
              </div>

              {/* Number and Copy Card */}
              <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/90 p-6 space-y-4 text-center">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {isRtl ? 'رقم المحفظة / عنوان IPA' : 'Wallet Number / IPA Address'}
                </div>

                <div className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider bg-slate-900 py-3 px-4 rounded-xl border border-slate-800" dir="ltr">
                  {currentWallet.number}
                </div>

                <button
                  onClick={() => handleCopyWalletNumber(currentWallet)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow"
                >
                  {copiedId === currentWallet.id ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === currentWallet.id ? (isRtl ? 'تم نسخ الرقم!' : 'Number Copied!') : (isRtl ? 'نسخ رقم المحفظة' : 'Copy Number')}</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
