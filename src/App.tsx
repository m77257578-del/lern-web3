/**
 * Project Identity: ليرن ويب | Lern Web
 * Architecture Framework: Next.js (App Router Layout Structure) + React Vite Runtime
 * Purpose: Dynamic Web Application with Dedicated CMS Control Panel, Interactive Marketplace,
 *          Live Sandbox Simulator, Real-Time Firestore Sync, and One-Page Seamless Architecture.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Layers, Play, Video, ShieldCheck, Sun, Moon, 
  Globe, Download, Smartphone, Code2, ArrowUpRight,
  CheckCircle2, Menu, X, Share2, Terminal, Copy, Check, Lock, User, Sparkles, Printer, BarChart3, Rocket, Clock, Bot, LogOut, LayoutDashboard, FileText, HelpCircle,
  Crown, Sliders, Bell, ArrowDown, ChevronUp, Radio, Compass, MessageSquare, Zap, ExternalLink, Activity, ArrowRight, Star, CreditCard, ChevronRight
} from 'lucide-react';

import AppStore from '../components/AppStore';
import SandboxPreview from '../components/SandboxPreview';
import FaqSection from '../components/FaqSection';
import PwaDiagnostics from '../components/PwaDiagnostics';
import UserProfileSection from '../components/UserProfileSection';
import ProductTour from '../components/ProductTour';
import AboutUsSection from '../components/AboutUsSection';
import AdminDashboard from '../components/AdminDashboard';
import SecretLoginModal from '../components/SecretLoginModal';
import NotificationCenterRaw from '../components/NotificationCenter';
const NotificationCenter = NotificationCenterRaw as any;
import AiSupportChat from './components/AiSupportChat';
import ClientSpendingChart from './components/ClientSpendingChart';
import CmsArticlesSection from '../components/CmsArticlesSection';
import PricingSection from '../components/PricingSection';
import GlobalSkeletonLoader from '../components/GlobalSkeletonLoader';
import { toast } from 'sonner';
import { translations } from './data/translations';
import { APPS_DATA, WALLET_OPTIONS, MEDIA_RESOURCES, AppItem } from './data/storeData';
import { 
  storageService, buildWhatsAppUrl, ProjectItem, AdminSettings, WalletConfig, MediaResourceItem, AiCustomizationDraft, UserOrder,
  getProjects, getSettings, getWallets, getMediaResources, getPlans, getNotifications, UserNotification, CmsArticle, AnnouncementBanner
} from './services/storageService';
import { subscribeToAuthChanges, signOutUser } from './services/firebaseService';

const VSCODE_CODE_CATALOG: Record<string, { lang: string; title: string; code: string }> = {
  'app/page.jsx': {
    lang: 'javascript',
    title: 'app/page.jsx (Root layout routing and state coordinator)',
    code: `/**
 * Next.js Project Structure Identifier:
 * app/page.jsx
 * 
 * Project Identity: ليرن ويب | Lern Web
 * Architecture Framework: Next.js (App Router Layout Structure)
 * Purpose: Dynamic Web Application with Dedicated CMS Control Panel & One-Page Architecture
 */

'use client';

import React, { useState } from 'react';
import AppStore from '@/components/AppStore';
import SandboxPreview from '@/components/SandboxPreview';

export default function Page() {
  const [theme, setTheme] = useState('dark');
  return (
    <div className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}>
      <AppStore />
    </div>
  );
}`
  },
  'app/layout.jsx': {
    lang: 'javascript',
    title: 'app/layout.jsx (Bilingual context wrappers, metadata providers, and global font injections)',
    code: `export const metadata = {
  title: 'ليرن ويب | Lern Web - المنظومة التعليمية السحابية المتكاملة',
  description: 'سوق أدوات ومحاكي مراكز تعليمية متطورة مع محرك PWA ونظام CMS ولوحة تحكم مخصصة وتملك كامل للكود المصدري.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg', apple: '/icon-192.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}`
  }
};

export default function App() {
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
  }, []);

  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const t = translations[lang] || translations.ar;
  const isRtl = lang === 'ar';

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [viewMode, setViewMode] = useState<'onepage' | 'tabs'>('onepage');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [activeTab, setActiveTab] = useState<'store' | 'sandbox' | 'articles' | 'pricing' | 'faq' | 'media' | 'billing' | 'vscode' | 'client-dashboard' | 'about' | 'cms-dashboard'>('store');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sandboxConfig, setSandboxConfig] = useState<any>(null);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState<boolean>(false);

  // Admin Master State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Client Authentication State
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isClientLoginOpen, setIsClientLoginOpen] = useState(false);
  const [isSecretLoginOpen, setIsSecretLoginOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (activeTab === 'client-dashboard' && isUserLoggedIn && !localStorage.getItem('hasSeenTour')) {
      setShowTour(true);
    }
  }, [activeTab, isUserLoggedIn]);

  const [userDrafts, setUserDrafts] = useState<AiCustomizationDraft[]>(() => storageService.getAiDrafts());
  const prevDraftStatuses = useRef<Record<string, string>>({});

  useEffect(() => {
    if (isUserLoggedIn && userDrafts.length > 0) {
      userDrafts.forEach((draft) => {
        const prevStatus = prevDraftStatuses.current[draft.id];
        if (prevStatus && prevStatus !== draft.status) {
          const statusMapAr: Record<string, string> = {
            'pending_review': 'قيد المراجعة الفنية',
            'in_progress': 'قيد التنفيذ والبرمجة',
            'completed': 'تم التنفيذ / جاهز',
            'approved_published': 'تم الاعتماد والنشر بالمتجر',
            'rejected': 'تم الرفض / يحتاج مراجعة'
          };
          const statusMapEn: Record<string, string> = {
            'pending_review': 'Pending Review',
            'in_progress': 'In Progress',
            'completed': 'Completed / Ready',
            'approved_published': 'Approved & Published',
            'rejected': 'Rejected / Needs Review'
          };
          const statusLabel = isRtl ? statusMapAr[draft.status] : statusMapEn[draft.status];
          let details = isRtl 
            ? `🔔 تحديث حالة: طلبك "${draft.modifiedConfig?.centerName || 'المنصة'}" أصبح الآن [${statusLabel}]`
            : `🔔 Status Update: Your request "${draft.modifiedConfig?.centerName || 'Platform'}" is now [${statusLabel}]`;
          if (draft.notes) {
            details += isRtl ? `\n\nملاحظة الإدارة: ${draft.notes}` : `\n\nAdmin Note: ${draft.notes}`;
          }
          showToast(details, 'success');
        }
        prevDraftStatuses.current[draft.id] = draft.status;
      });
    } else if (!isUserLoggedIn) {
      prevDraftStatuses.current = {};
    }
  }, [userDrafts, isUserLoggedIn, isRtl, showToast]);

  const [projects, setProjects] = useState<ProjectItem[]>(() => getProjects(false));
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => getSettings());
  const [wallets, setWallets] = useState<WalletConfig[]>(() => getWallets());
  const [mediaItems, setMediaItems] = useState<MediaResourceItem[]>(() => {
    const stored = getMediaResources();
    return stored.length > 0 ? stored : (MEDIA_RESOURCES as any[]);
  });
  const [plans, setPlans] = useState<any[]>(() => getPlans());
  const [notifications, setNotifications] = useState<UserNotification[]>(() => getNotifications());
  const [userOrders, setUserOrders] = useState<UserOrder[]>(() => storageService.getUserOrders());
  const [articles, setArticles] = useState<CmsArticle[]>(() => storageService.getArticles(false));
  const [announcements, setAnnouncements] = useState<AnnouncementBanner[]>(() => storageService.getAnnouncements());

  const refreshStorageData = () => {
    const isAdminActive = storageService.isAdminLoggedIn();
    setIsAdmin(isAdminActive);
    setIsUserLoggedIn(storageService.isUserLoggedIn());
    setCurrentUser(storageService.getCurrentUser());
    setProjects(storageService.getProjects(isAdminActive));
    setAdminSettings(storageService.getSettings());
    setWallets(storageService.getWallets());
    const storedMedia = storageService.getMediaResources();
    setMediaItems(storedMedia.length > 0 ? storedMedia : (MEDIA_RESOURCES as any[]));
    setPlans(storageService.getPlans());
    setUserDrafts(storageService.getAiDrafts());
    setNotifications(storageService.getNotifications());
    setUserOrders(storageService.getUserOrders());
    setArticles(storageService.getArticles(false));
    setAnnouncements(storageService.getAnnouncements());
  };

  useEffect(() => {
    refreshStorageData();
    storageService.syncNow();

    const unsubscribeStorage = storageService.subscribe(() => {
      refreshStorageData();
    });

    const unsubscribeAuth = subscribeToAuthChanges((user) => {
      if (user) {
        setIsUserLoggedIn(true);
        setCurrentUser({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          phone: '',
          email: user.email,
          createdAt: user.metadata.creationTime
        });
      } else {
        const localUser = storageService.getCurrentUser();
        setIsUserLoggedIn(!!localUser);
        setCurrentUser(localUser);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsSecretLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleContextMenu = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('input, textarea, pre, code')) {
        e.preventDefault();
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      unsubscribeAuth();
      unsubscribeStorage();
    };
  }, []);

  // ScrollSpy for Single Page Application navigation
  useEffect(() => {
    if (viewMode !== 'onepage') return;

    const sectionIds = ['hero', 'store', 'sandbox', 'articles', 'pricing', 'faq', 'about', 'client-portal'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (viewMode === 'tabs') {
      if (['store', 'sandbox', 'articles', 'pricing', 'faq', 'media', 'billing', 'vscode', 'client-dashboard', 'about'].includes(id)) {
        setActiveTab(id as any);
      }
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogoClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    scrollToSection('hero');
  };

  const handleClientLogout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Firebase signout skipped', e);
    }
    storageService.logoutUser();
    setIsUserLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('store');
    showToast(isRtl ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully', 'success');
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [activeVsCodeFile, setActiveVsCodeFile] = useState('app/page.jsx');
  const [hasCopiedFile, setHasCopiedFile] = useState(false);

  const effectiveTheme = adminSettings?.themeMode === 'dark' 
    ? 'dark' 
    : adminSettings?.themeMode === 'light' 
      ? 'light' 
      : theme;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    if (adminSettings?.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', adminSettings.primaryColor);
    }
    if (adminSettings?.accentColor) {
      document.documentElement.style.setProperty('--accent-color', adminSettings.accentColor);
    }
    if (adminSettings?.fontFamily) {
      const fontMap: Record<string, string> = {
        cairo: "'Cairo', sans-serif",
        tajawal: "'Tajawal', sans-serif",
        inter: "'Inter', sans-serif",
        almarai: "'Almarai', sans-serif"
      };
      document.body.style.fontFamily = fontMap[adminSettings.fontFamily] || "'Cairo', sans-serif";
    }
  }, [lang, isRtl, effectiveTheme, adminSettings]);

  useEffect(() => {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      alert(isRtl 
        ? 'يمكنك تثبيت التطبيق مباشرة من قائمة إعدادات المتصفح (Install App أو Add to Home Screen).' 
        : 'You can install the app directly via your browser menu (Install App / Add to Home Screen).');
    }
  };

  const handleLaunchAppInSandbox = (itemOrConfig: any) => {
    if (!itemOrConfig) return;

    if (itemOrConfig.category && itemOrConfig.centerName) {
      setSandboxConfig(itemOrConfig);
    } else if (itemOrConfig.defaultSandboxConfig) {
      setSandboxConfig({
        category: itemOrConfig.category || 'lms',
        centerName: isRtl ? itemOrConfig.titleAr : itemOrConfig.titleEn,
        theme: itemOrConfig.defaultSandboxConfig.theme,
        activeCourse: isRtl ? itemOrConfig.defaultSandboxConfig.activeCourse : itemOrConfig.titleEn,
        bannerText: isRtl ? itemOrConfig.defaultSandboxConfig.bannerText : 'Active runtime deployment configured',
        activeTab: 'courses',
        studentCount: 850,
        tutorName: 'فريق ليرن ويب التقني',
        hasQuiz: itemOrConfig.defaultSandboxConfig.hasQuiz
      });
    } else {
      setSandboxConfig(itemOrConfig);
    }

    if (viewMode === 'onepage') {
      scrollToSection('sandbox');
    } else {
      setActiveTab('sandbox');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyCode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setHasCopiedFile(true);
    setTimeout(() => setHasCopiedFile(false), 2500);
  };

  const activeAnnouncement = announcements.find(a => a.isActive);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      effectiveTheme === 'dark' 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Dynamic CMS Announcement Ticker */}
      {!isAnnouncementDismissed && activeAnnouncement && (
        <aside aria-label="CMS announcement banner" className="no-print bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/30 px-4 py-2 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-md z-40 relative">
          <div className="max-w-7xl mx-auto flex-1 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
              {isRtl ? activeAnnouncement.badgeAr : activeAnnouncement.badgeEn}
            </span>
            <span className="font-medium text-slate-200">
              {isRtl ? activeAnnouncement.messageAr : activeAnnouncement.messageEn}
            </span>
            {activeAnnouncement.targetUrl && (
              <button
                onClick={() => {
                  const target = activeAnnouncement.targetUrl;
                  if (target && target.startsWith('#')) {
                    scrollToSection(target.replace('#', ''));
                  }
                }}
                className="font-bold underline text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                {isRtl ? 'عرض التفاصيل ←' : 'Learn more →'}
              </button>
            )}
          </div>
          <button
            onClick={() => setIsAnnouncementDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
            title={isRtl ? 'إغلاق التنبيه' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Admin Mode Floating Header Ribbon if Logged In */}
      {isAdmin && (
        <div className="no-print bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border-b border-blue-400/40 px-4 py-2 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm shadow-xl z-50 sticky top-0">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/30 animate-pulse" />
            <span className="font-bold">👑 {isRtl ? 'وضع تحكم المشرف والـ CMS نشط:' : 'CMS Master Admin Active:'}</span>
            <span className="text-slate-200 hidden md:inline">{isRtl ? 'تحكم كامل في نشر المقالات، إدارة المشاريع وتتبع مسودات الـ AI' : 'Full CMS & Projects Authority'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                storageService.logoutAdmin();
                refreshStorageData();
                showToast(isRtl ? 'تم تسجيل الخروج من الإدارة' : 'Logged out of admin', 'success');
              }}
              className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-1 text-white transition cursor-pointer"
            >
              {isRtl ? 'خروج' : 'Logout'}
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {!isInstalled && (
        <aside aria-label="PWA install banner" className="no-print relative z-30 border-b border-blue-500/20 bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 px-4 py-2 text-white shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Smartphone className="w-3.5 h-3.5 text-blue-300" />
              <span className="font-semibold">{t.pwaInstallTitle}:</span>
              <span className="text-slate-300 hidden md:inline">{t.pwaInstallDesc}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 px-3 py-1 font-bold text-white shadow transition active:scale-95"
              >
                <Download className="w-3 h-3" />
                <span>{t.installNow}</span>
              </button>

              {isIOS && (
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="rounded-xl border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white hover:bg-white/20"
                >
                  iPhone Guide
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Global Real-time Sync & Skeleton Loading Indicator Layer */}
      <GlobalSkeletonLoader lang={lang} />

      {/* Global Sticky Header */}
      <header className={`no-print sticky ${isAdmin ? 'top-10' : 'top-0'} z-30 border-b backdrop-blur-xl transition-colors ${
        theme === 'dark' 
          ? 'border-slate-800/80 bg-slate-950/90' 
          : 'border-slate-200/80 bg-white/90'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleLogoClick}
              title={isRtl ? 'ليرن ويب | Lern Web' : 'Lern Web'}
              className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-0.5 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-transform overflow-hidden cursor-pointer select-none border-0 shrink-0"
            >
              <img 
                src="/assets/aistudio/image_69117c9b__1__7fdc7aea.jpg" 
                alt="Lern Web Logo" 
                className="w-full h-full object-cover rounded-[14px] pointer-events-none"
              />
            </button>

            <div 
              onClick={() => scrollToSection('hero')}
              className="space-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-black text-lg md:text-xl tracking-tight text-white hover:text-blue-400 transition-colors">
                  {adminSettings?.centerName || 'ليرن ويب'}
                </span>
                <span className="text-[11px] font-bold text-blue-400 font-mono">
                  LERN WEB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {isRtl ? 'تطبيق ويب ديناميكي • نظام CMS • لوحة تحكم مخصصة' : 'Dynamic Web App & Dedicated CMS Panel'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5">
            {[
              { id: 'hero', label: isRtl ? 'الرئيسية' : 'Home', icon: Compass },
              { id: 'store', label: isRtl ? 'سوق المنظومات' : 'App Store', icon: Layers },
              { id: 'sandbox', label: isRtl ? 'المحاكي و AI' : 'Sandbox & AI', icon: Play },
              { id: 'articles', label: isRtl ? 'المقالات والـ CMS' : 'CMS & Articles', icon: FileText },
              { id: 'pricing', label: isRtl ? 'الأسعار والترخيص' : 'Pricing & Plans', icon: ShieldCheck },
              { id: 'faq', label: isRtl ? 'الأسئلة الشائعة' : 'FAQ', icon: HelpCircle },
              { id: 'about', label: isRtl ? 'من نحن' : 'About Us', icon: Sparkles },
              ...(isUserLoggedIn ? [{ id: 'client-portal', label: isRtl ? 'لوحة العميل' : 'My Account', icon: User }] : [])
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = viewMode === 'onepage' ? activeSection === nav.id : activeTab === (nav.id as any);
              return (
                <button
                  key={nav.id}
                  onClick={() => scrollToSection(nav.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Admin Dashboard Launch Button if Admin */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminDashboardOpen(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-sm cursor-pointer border border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 ring-2 ring-amber-500/20"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isRtl ? 'لوحة المشرف' : 'Admin Panel'}</span>
              </button>
            )}

            {/* View Mode Switcher */}
            <button
              onClick={() => setViewMode(viewMode === 'onepage' ? 'tabs' : 'onepage')}
              title={isRtl ? 'تبديل طريقة العرض بين صفحة واحدة وتبويبات' : 'Toggle between One-Page & Tabs'}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>{viewMode === 'onepage' ? (isRtl ? 'صفحة واحدة' : 'One-Page') : (isRtl ? 'تبويبات' : 'Tabs')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:border-slate-700 transition"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              {effectiveTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Client User Login / Profile Button */}
            {isUserLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollToSection('client-portal')}
                  className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs md:text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30 transition active:scale-95 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[100px] truncate">{currentUser?.name || (isRtl ? 'لوحة العميل' : 'Account')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClientLogout}
                  title={isRtl ? 'تسجيل الخروج' : 'Logout'}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsClientLoginOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs md:text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30 transition active:scale-95 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{isRtl ? 'دخول العميل' : 'Client Login'}</span>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3 animate-fadeIn">
            <div className="space-y-1.5">
              {[
                { id: 'hero', label: isRtl ? 'الرئيسية' : 'Home', icon: Compass },
                { id: 'store', label: isRtl ? 'سوق المنظومات' : 'App Store', icon: Layers },
                { id: 'sandbox', label: isRtl ? 'المحاكي و AI' : 'Sandbox & AI', icon: Play },
                { id: 'articles', label: isRtl ? 'المقالات والـ CMS' : 'CMS & Articles', icon: FileText },
                { id: 'pricing', label: isRtl ? 'الأسعار والترخيص' : 'Pricing & Plans', icon: ShieldCheck },
                { id: 'faq', label: isRtl ? 'الأسئلة الشائعة' : 'FAQ', icon: HelpCircle },
                { id: 'about', label: isRtl ? 'من نحن' : 'About Us', icon: Sparkles },
                ...(isUserLoggedIn ? [{ id: 'client-portal', label: isRtl ? 'لوحة العميل' : 'My Account', icon: User }] : []),
                { id: 'cms-dashboard', label: isRtl ? '👑 لوحة التحكم والـ CMS' : '👑 CMS & Admin Panel', icon: Crown, highlight: true }
              ].map((nav) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={nav.id}
                    onClick={() => {
                      scrollToSection(nav.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      nav.highlight 
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' 
                        : (activeSection === nav.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900')
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{nav.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Single-Page / Tabbed Flow */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {viewMode === 'onepage' ? (
          /* ============================================================ */
          /* ONE-PAGE ARCHITECTURE (عرض الصفحة الواحدة المتكاملة)           */
          /* ============================================================ */
          <div className="space-y-16">
            
            {/* SECTION 0: HERO & DYNAMIC PLATFORM METRICS */}
            <section id="hero" className="w-full space-y-8 scroll-mt-24">
              <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6 max-w-4xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-300">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span>
                      {isRtl 
                        ? (adminSettings?.heroBadgeAr || 'منصة ويب ديناميكية متكاملة • محرك CMS • لوحة تحكم مخصصة • تملك كامل للكود')
                        : (adminSettings?.heroBadgeEn || 'Unified Dynamic Web Platform, CMS & One-Page Suite')}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                    {isRtl 
                      ? (adminSettings?.heroTitleAr || 'منظومة ليرن ويب المتكاملة لإدارة المراكز، سوق الأدوات والـ CMS')
                      : (adminSettings?.heroTitleEn || 'Lern Web Unified Dynamic Platform & Dedicated CMS')}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                    {isRtl 
                      ? (adminSettings?.heroSubtitleAr || 'تطبيق ويب ديناميكي متكامل ذو صفحة واحدة يوفر سوقاً حياً لمنظومات السناتر والتعليم الذكي، محاكياً تفاعلياً مدعوماً بالذكاء الاصطناعي، ونظام إدارة محتوى (CMS) متقدم يمنحك لوحة تحكم مخصصة لإدارة المقالات، الإعلانات، المحافظ، ومسودات الـ AI لحظياً.')
                      : (adminSettings?.heroSubtitleEn || 'An integrated single-page dynamic web application offering a live educational software marketplace, interactive AI sandbox simulator, and dedicated CMS control panel for live content and system orchestration.')}
                  </p>

                  {/* Fast Action CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => scrollToSection('store')}
                      className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>{isRtl ? 'استعراض سوق المنظومات' : 'Explore Marketplace'}</span>
                    </button>

                    <button
                      onClick={() => scrollToSection('sandbox')}
                      className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-200 transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-4 h-4 text-emerald-400" />
                      <span>{isRtl ? 'تشغيل المحاكي التفاعلي و AI' : 'Launch Sandbox Simulator'}</span>
                    </button>

                    <button
                      onClick={() => scrollToSection('articles')}
                      className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-200 transition active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>{isRtl ? 'مقالات ودراسات الـ CMS' : 'CMS Knowledgebase'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isAdmin) {
                          scrollToSection('cms-dashboard');
                        } else {
                          setIsSecretLoginOpen(true);
                        }
                      }}
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition active:scale-95 cursor-pointer"
                    >
                      <Crown className="w-4 h-4" />
                      <span>{isRtl ? 'لوحة التحكم والـ CMS' : 'CMS Control Panel'}</span>
                    </button>
                  </div>

                  {/* Dynamic Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                      <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                        {projects.length}
                      </div>
                      <div className="text-xs text-slate-400 font-bold">
                        {isRtl ? 'منظومات ومشاريع جاهزة' : 'Deployable Systems'}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                      <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                        {articles.length}
                      </div>
                      <div className="text-xs text-slate-400 font-bold">
                        {isRtl ? 'مقالات ودراسات الـ CMS' : 'Live CMS Articles'}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                        {userDrafts.length}
                      </div>
                      <div className="text-xs text-slate-400 font-bold">
                        {isRtl ? 'مسودات وتخصيصات AI' : 'Staged AI Drafts'}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                        {plans.length}
                      </div>
                      <div className="text-xs text-slate-400 font-bold">
                        {isRtl ? 'باقات ترخيص وتملك' : 'Licensing Options'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 1: MARKETPLACE & APP STORE */}
            <section id="store" className="scroll-mt-24">
              <AppStore
                apps={projects as any}
                lang={lang}
                t={t}
                onLaunchSandbox={handleLaunchAppInSandbox}
                onSelectAppForDeploy={handleLaunchAppInSandbox}
                isAdmin={isAdmin}
                isUserLoggedIn={isUserLoggedIn}
                adminSettings={adminSettings}
                onOpenLogin={() => setIsClientLoginOpen(true)}
                onOpenAdminPortal={() => {
                  if (isAdmin) scrollToSection('cms-dashboard');
                  else setIsSecretLoginOpen(true);
                }}
                showToast={showToast}
              />
            </section>

            {/* SECTION 2: LIVE SANDBOX SIMULATOR & AI CUSTOMIZER */}
            <section id="sandbox" className="scroll-mt-24 space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Play className="w-4 h-4" />
                    <span>{isRtl ? 'محاكي السناتر والمراكز التعليمية المباشر' : 'Live Interactive Center Simulator'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {isRtl ? 'المحاكي التفاعلي واستوديو التخصيص بالذكاء الاصطناعي' : 'Live Interactive Sandbox & AI Studio'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {isRtl 
                      ? 'اختبر واجهات المركز التعليمي، الامتحانات الآلية، واطلب من الذكاء الاصطناعي تعديل الأكواد والألوان فورياً.'
                      : 'Test the live student portal, online proctored exams, and stage code modifications with AI.'}
                  </p>
                </div>
                <button
                  onClick={() => scrollToSection('store')}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition shrink-0"
                >
                  {isRtl ? 'اختيار مشروع آخر من المتجر ↑' : 'Pick another system ↑'}
                </button>
              </div>

              <SandboxPreview
                lang={lang}
                t={t}
                initialConfig={sandboxConfig}
                wallets={wallets.filter((w) => w.isActive)}
                mediaResources={mediaItems}
                onOpenBillingModal={() => scrollToSection('pricing')}
                targetWhatsAppNumber={adminSettings.targetWhatsAppNumber}
                isAdmin={isAdmin}
                isUserLoggedIn={isUserLoggedIn}
                onOpenLogin={() => setIsClientLoginOpen(true)}
                adminSettings={adminSettings}
                plans={plans}
              />
            </section>

            {/* SECTION 3: DYNAMIC CMS ARTICLES & KNOWLEDGEBASE */}
            <CmsArticlesSection
              lang={lang}
              isAdmin={isAdmin}
              onOpenAdminCms={() => {
                if (isAdmin) scrollToSection('cms-dashboard');
                else setIsSecretLoginOpen(true);
              }}
              showToast={showToast}
            />

            {/* SECTION 4: PRICING, LICENSING & PAYMENT WALLETS */}
            <PricingSection
              plans={plans}
              wallets={wallets}
              adminSettings={adminSettings}
              lang={lang}
              onLaunchSandbox={handleLaunchAppInSandbox}
              showToast={showToast}
              isAdmin={isAdmin}
              onOpenAdminWallets={() => {
                if (isAdmin) scrollToSection('cms-dashboard');
                else setIsSecretLoginOpen(true);
              }}
            />

            {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
            <section id="faq" className="scroll-mt-24">
              <FaqSection lang={lang} adminSettings={adminSettings} />
            </section>

            {/* SECTION 6: ABOUT US & UNIVERSAL ARCHITECTURE */}
            <section id="about" className="scroll-mt-24">
              <AboutUsSection lang={lang} onClose={() => scrollToSection('hero')} />
            </section>

            {/* SECTION 7: CLIENT PORTAL SECTION */}
            <section id="client-portal" className="scroll-mt-24 space-y-6">
              {isUserLoggedIn ? (
                <div className="space-y-8">
                  <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6 md:p-10 shadow-2xl space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
                          <User className="w-4 h-4" />
                          <span>{isRtl ? 'لوحة العميل الخاصة' : 'Client Account Portal'}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white">
                          {isRtl ? `مرحباً بك، ${currentUser?.name || 'عميلنا العزيز'}` : `Welcome back, ${currentUser?.name || 'Valued Client'}`}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => window.print()}
                          className="no-print flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
                        >
                          <Printer className="w-4 h-4" />
                          <span>{isRtl ? 'طباعة تقرير الحالة' : 'Print Status Report'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleClientLogout}
                          className="no-print flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <NotificationCenter 
                        notifications={notifications.filter(n => n.userId === currentUser?.id)} 
                        lang={lang} 
                        onRefresh={refreshStorageData} 
                      />

                      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 shadow-xl space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            {isRtl ? 'تحليل المصروفات التعليمية' : 'Educational Spending Analytics'}
                          </h3>
                        </div>
                        <ClientSpendingChart 
                          orders={userOrders.filter(o => o.userId === currentUser?.id)} 
                          lang={lang} 
                        />
                      </div>

                      {/* AI Drafts Table */}
                      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 shadow-xl space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Rocket className="w-5 h-5 text-blue-400" />
                          {isRtl ? 'سجل طلبات التعديل (AI Drafts)' : 'AI Customization History'}
                        </h3>

                        {userDrafts.length === 0 ? (
                          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center text-slate-500 space-y-2">
                            <p className="font-bold">{isRtl ? 'لا توجد طلبات مسجلة بعد' : 'No requests yet'}</p>
                            <p className="text-xs">{isRtl ? 'استخدم المحاكي التفاعلي لتخصيص منصتك وإرسالها للمراجعة.' : 'Use the Sandbox to stage and submit your first customization.'}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {userDrafts.map((draft) => (
                              <div key={draft.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-white">{draft.modifiedConfig?.centerName || 'المركز التعليمي'}</span>
                                  <span className="text-[10px] font-mono text-slate-500">{draft.forkedAt}</span>
                                </div>
                                <p className="text-xs text-slate-300 italic">"{draft.userPrompt}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <UserProfileSection
                        currentUser={currentUser}
                        userDraftsCount={userDrafts.length}
                        lang={lang}
                        onUserUpdated={(updated) => setCurrentUser(updated)}
                        onLogout={handleClientLogout}
                      />
                      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                        <PwaDiagnostics lang={lang} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-4">
                  <User className="w-12 h-12 text-blue-400 mx-auto opacity-80" />
                  <h3 className="text-xl font-bold text-white">
                    {isRtl ? 'بوابة حساب العميل ومتابعة الطلبات' : 'Client Account & Order Portal'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    {isRtl 
                      ? 'سجل دخولك أو أنشئ حساباً جديداً لمتابعة حالة التراخيص ومسودات الذكاء الاصطناعي والاستفادة من الدعم الفني المباشر.' 
                      : 'Sign in to access your staged AI requests, license records, and priority support.'}
                  </p>
                  <button
                    onClick={() => setIsClientLoginOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}</span>
                  </button>
                </div>
              )}
            </section>

            {/* SECTION 8: DEDICATED CONTROL PANEL & CMS SUITE */}
            <section id="cms-dashboard" className="scroll-mt-24 space-y-6">
              {isAdmin ? (
                <AdminDashboard
                  lang={lang}
                  onClose={() => scrollToSection('hero')}
                  onRefreshData={refreshStorageData}
                  onOpenSandboxWithConfig={handleLaunchAppInSandbox}
                  inline={true}
                />
              ) : (
                <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 sm:p-8 md:p-12 shadow-2xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-5 max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>{isRtl ? 'لوحة التحكم المخصصة ونظام إدارة المحتوى (CMS Master Control)' : 'Dedicated Control Panel & Dynamic CMS'}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                      {isRtl ? 'تحكم شامل وديناميكي في كامل محتوى ومقومات المنصة' : 'Total Authority Over Content, Projects & System State'}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {isRtl 
                        ? 'لوحة إدارة متكاملة ومخصصة تتيح لك نشر وحذف المقالات في الـ CMS، تحديث بنك الأسئلة الشائعة، إدارة الإعلانات العاجلة، تعديل أسعار باقات الترخيص، ربط محافظ الدفع (فودافون كاش، انستاباي)، واستعراض واعتماد مسودات الذكاء الاصطناعي لحظياً.'
                        : 'Dedicated administrative suite for CMS publishing, dynamic FAQs, instant announcements, payment wallets orchestration, and AI customization draft moderation.'}
                    </p>

                    <button
                      onClick={() => setIsSecretLoginOpen(true)}
                      className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-5 py-3 text-xs sm:text-sm font-bold text-slate-200 transition cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>{isRtl ? 'تسجيل الدخول برمز مخصص' : 'Custom Passcode Sign In'}</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

          </div>
        ) : (
          /* ============================================================ */
          /* TABBED MODE (عرض التبويبات الفردية المركزة)                   */
          /* ============================================================ */
          <div className="space-y-8 animate-fadeIn">
            {activeTab === 'store' && (
              <AppStore
                apps={projects as any}
                lang={lang}
                t={t}
                onLaunchSandbox={handleLaunchAppInSandbox}
                onSelectAppForDeploy={handleLaunchAppInSandbox}
                isAdmin={isAdmin}
                isUserLoggedIn={isUserLoggedIn}
                adminSettings={adminSettings}
                onOpenLogin={() => setIsClientLoginOpen(true)}
                onOpenAdminPortal={() => setIsAdminDashboardOpen(true)}
                showToast={showToast}
              />
            )}

            {activeTab === 'sandbox' && (
              <SandboxPreview
                lang={lang}
                t={t}
                initialConfig={sandboxConfig}
                wallets={wallets.filter((w) => w.isActive)}
                mediaResources={mediaItems}
                onOpenBillingModal={() => setActiveTab('pricing')}
                targetWhatsAppNumber={adminSettings.targetWhatsAppNumber}
                isAdmin={isAdmin}
                isUserLoggedIn={isUserLoggedIn}
                onOpenLogin={() => setIsClientLoginOpen(true)}
                adminSettings={adminSettings}
                plans={plans}
              />
            )}

            {activeTab === 'articles' && (
              <CmsArticlesSection
                lang={lang}
                isAdmin={isAdmin}
                onOpenAdminCms={() => setIsAdminDashboardOpen(true)}
                showToast={showToast}
              />
            )}

            {activeTab === 'pricing' && (
              <PricingSection
                plans={plans}
                wallets={wallets}
                adminSettings={adminSettings}
                lang={lang}
                onLaunchSandbox={handleLaunchAppInSandbox}
                showToast={showToast}
                isAdmin={isAdmin}
                onOpenAdminWallets={() => setIsAdminDashboardOpen(true)}
              />
            )}

            {activeTab === 'faq' && (
              <FaqSection lang={lang} adminSettings={adminSettings} />
            )}

            {activeTab === 'about' && (
              <AboutUsSection lang={lang} onClose={() => setActiveTab('store')} />
            )}

            {activeTab === 'media' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-xl space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{t.mediaTitle}</h2>
                  <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">{t.mediaSubtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mediaItems.filter(m => isAdmin || m.isPublished !== false).map((res) => (
                    <div key={res.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-lg flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400">
                            {isRtl ? res.categoryAr : res.categoryEn}
                          </span>
                          <span className="font-mono text-slate-400">
                            {isRtl ? res.durationOrReadTimeAr : res.durationOrReadTimeEn}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{isRtl ? res.titleAr : res.titleEn}</h3>
                        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{isRtl ? res.summaryAr : res.summaryEn}</p>
                      </div>

                      {res.type === 'video' ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                          <iframe 
                            src={res.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'} 
                            title={res.titleAr} 
                            className="w-full h-full border-0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen 
                          />
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {isRtl ? res.contentAr : res.contentEn}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <PricingSection
                plans={plans}
                wallets={wallets}
                adminSettings={adminSettings}
                lang={lang}
                onLaunchSandbox={handleLaunchAppInSandbox}
                showToast={showToast}
                isAdmin={isAdmin}
                onOpenAdminWallets={() => setIsAdminDashboardOpen(true)}
              />
            )}

            {activeTab === 'vscode' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-xl space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                    <Terminal className="w-4 h-4" />
                    <span>VS Code Environment & Vercel Edge Pipeline</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{t.vsCodeExplorerTitle}</h2>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">{t.vsCodeExplorerSubtitle}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Structure:</h4>
                    {Object.keys(VSCODE_CODE_CATALOG).map((fileName) => (
                      <button
                        key={fileName}
                        onClick={() => setActiveVsCodeFile(fileName)}
                        className={`w-full text-left font-mono text-xs px-3 py-2.5 rounded-xl transition flex items-center justify-between ${
                          activeVsCodeFile === fileName ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{fileName}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    ))}
                  </div>

                  <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono text-blue-400">{VSCODE_CODE_CATALOG[activeVsCodeFile]?.title}</span>
                        <h4 className="text-base font-mono font-bold text-white">{activeVsCodeFile}</h4>
                      </div>

                      <button
                        onClick={() => handleCopyCode(VSCODE_CODE_CATALOG[activeVsCodeFile]?.code || '')}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
                      >
                        {hasCopiedFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{hasCopiedFile ? t.fileCopied : t.copyFileCode}</span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px]" dir="ltr">
                      <pre className="text-left font-mono whitespace-pre">{VSCODE_CODE_CATALOG[activeVsCodeFile]?.code}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'client-dashboard' && (
              <div className="space-y-8 animate-fadeIn min-h-[500px]">
                {isUserLoggedIn ? (
                  <div className="space-y-8">
                    <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6 md:p-10 shadow-2xl space-y-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-3xl md:text-4xl font-black text-white">
                            {isRtl ? `مرحباً بك، ${currentUser?.name || 'عميلنا العزيز'}` : `Welcome back, ${currentUser?.name || 'Valued Client'}`}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={handleClientLogout}
                          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-400 inline ml-1" />
                          <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <NotificationCenter 
                          notifications={notifications.filter(n => n.userId === currentUser?.id)} 
                          lang={lang} 
                          onRefresh={refreshStorageData} 
                        />
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 shadow-xl">
                          <ClientSpendingChart 
                            orders={userOrders.filter(o => o.userId === currentUser?.id)} 
                            lang={lang} 
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <UserProfileSection
                          currentUser={currentUser}
                          userDraftsCount={userDrafts.length}
                          lang={lang}
                          onUserUpdated={(updated) => setCurrentUser(updated)}
                          onLogout={handleClientLogout}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-4">
                    <User className="w-12 h-12 text-blue-400 mx-auto opacity-80" />
                    <h3 className="text-xl font-bold text-white">
                      {isRtl ? 'تسجيل الدخول إلى حساب العميل' : 'Client Account Access'}
                    </h3>
                    <button
                      onClick={() => setIsClientLoginOpen(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg"
                    >
                      <span>{isRtl ? 'تسجيل الدخول الآن' : 'Sign In Now'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Floating Speed Dial / Quick Navigation Dock */}
      {viewMode === 'onepage' && (
        <aside aria-label="Quick navigation dock" className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800/90 bg-slate-950/90 backdrop-blur-xl p-1.5 shadow-2xl">
          {[
            { id: 'hero', label: isRtl ? 'الرئيسية' : 'Top', icon: Compass },
            { id: 'store', label: isRtl ? 'المتجر' : 'Store', icon: Layers },
            { id: 'sandbox', label: isRtl ? 'المحاكي' : 'Sandbox', icon: Play },
            { id: 'articles', label: isRtl ? 'المقالات' : 'CMS', icon: FileText },
            { id: 'pricing', label: isRtl ? 'الأسعار' : 'Pricing', icon: ShieldCheck },
            { id: 'faq', label: isRtl ? 'الأسئلة' : 'FAQ', icon: HelpCircle }
          ].map((item) => {
            const Icon = item.icon;
            const isCur = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                title={item.label}
                className={`flex items-center justify-center w-9 h-9 rounded-full text-xs transition cursor-pointer ${
                  isCur 
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
          <div className="w-px h-5 bg-slate-800 mx-0.5" />
          <button
            onClick={() => scrollToSection('hero')}
            title={isRtl ? 'للأعلى' : 'Back to top'}
            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* iOS Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">{t.iosInstallGuide}</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">1</span>
                <p>{t.iosStep1}</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">2</span>
                <p>{t.iosStep2}</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-2xl bg-slate-800 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="no-print mt-16 border-t border-slate-800/80 bg-slate-950 py-10 px-4 text-center text-xs text-slate-400 space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(adminSettings.socialLinks.whatsapp || adminSettings.targetWhatsAppNumber) && (
            <a 
              href={buildWhatsAppUrl(adminSettings.targetWhatsAppNumber || adminSettings.socialLinks.whatsapp)} 
              target="_blank" 
              rel="noreferrer" 
              className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition"
            >
              💬 {adminSettings.socialAppNames?.whatsapp || 'WhatsApp'}
            </a>
          )}
          {adminSettings.socialLinks.facebook && (
            <a href={adminSettings.socialLinks.facebook} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition">
              {adminSettings.socialAppNames?.facebook || 'Facebook'}
            </a>
          )}
          {adminSettings.socialLinks.youtube && (
            <a href={adminSettings.socialLinks.youtube} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:text-red-400 hover:border-red-500/40 transition">
              {adminSettings.socialAppNames?.youtube || 'YouTube'}
            </a>
          )}
          {adminSettings.socialLinks.tiktok && (
            <a href={adminSettings.socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:text-pink-400 hover:border-pink-500/40 transition">
              {adminSettings.socialAppNames?.tiktok || 'TikTok'}
            </a>
          )}
        </div>

        <p>
          {isRtl 
            ? 'منظومة ليرن ويب | Lern Web التعليمية المتكاملة • محرك PWA • نظام إدارة محتوى (CMS) • محاكي الذكاء الاصطناعي' 
            : 'Lern Web Cloud Educational Ecosystem • Dynamic Single Page Architecture • Full CMS & Dedicated Control Panel'}
        </p>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px]">
          <span>Next.js App Router • Tailwind CSS • Vercel Edge Architecture</span>
        </div>
      </footer>

      {/* Unified Login Modal for Clients and Staff/Admin */}
      <SecretLoginModal
        isOpen={isClientLoginOpen || isSecretLoginOpen}
        initialTab="login"
        onClose={() => {
          setIsClientLoginOpen(false);
          setIsSecretLoginOpen(false);
        }}
        onUserSuccess={(user: any) => {
          refreshStorageData();
          setIsUserLoggedIn(true);
          setCurrentUser(user);
          if (viewMode === 'onepage') {
            scrollToSection('client-portal');
          } else {
            setActiveTab('client-dashboard');
          }
          showToast(isRtl ? `مرحباً بك يا ${user?.name || 'عميلنا العزيز'}! تم تسجيل الدخول بنجاح.` : `Welcome ${user?.name || 'Client'}! Signed in successfully.`, 'success');
        }}
        onAdminSuccess={() => {
          refreshStorageData();
          setIsAdmin(true);
          setIsAdminDashboardOpen(true);
          showToast(isRtl ? 'تم تسجيل دخول المشرف بنجاح وفتح لوحة التحكم.' : 'Admin Dashboard unlocked.', 'success');
        }}
        lang={lang}
      />

      {/* Modal Admin Dashboard (when launched explicitly via modal) */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          lang={lang}
          onClose={() => setIsAdminDashboardOpen(false)}
          onRefreshData={refreshStorageData}
          onOpenSandboxWithConfig={(cfg: any) => {
            setSandboxConfig(cfg);
            if (viewMode === 'onepage') scrollToSection('sandbox');
            else setActiveTab('sandbox');
          }}
          inline={false}
        />
      )}

      {/* Floating AI Assistant Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-2xl hover:scale-105 transition"
        >
          {isAiChatOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
        </button>
      </div>

      {isAiChatOpen && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 z-[9999] w-auto md:w-96 max-w-[calc(100vw-2rem)] shadow-2xl">
          <AiSupportChat lang={lang} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
}
