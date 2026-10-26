import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables from .env
dotenv.config();

const aiApiKey = process.env.GEMINI_API_KEY || '';
if (!aiApiKey) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not set in process.env. AI features will likely fail.');
}

const ai = new GoogleGenAI({
  apiKey: aiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));

// Initialize Firebase Admin
// In AI Studio Build, we can often initialize without explicit credentials if the environment provides them,
// but for robustness we'll use a placeholder or check for ADC.
try {
  initializeApp({
    projectId: firebaseConfig.projectId
  });
} catch (e) {
  console.warn('Firebase Admin already initialized or failed:', e);
}

const fdb = getFirestore(firebaseConfig.firestoreDatabaseId);

const dbFile = path.resolve(process.cwd(), 'lernweb_db.json');

interface DatabaseSchema {
  version: number;
  lastModified: number;
  projects: any[];
  settings: any;
  wallets: any[];
  plans: any[];
  ai_drafts: any[];
  users: any[];
  media_resources: any[];
  user_orders: any[];
  reviews: any[];
  activity_logs: any[];
  chat_messages: any[];
  support_tickets: any[];
  notifications: any[];
  articles: any[];
  faqs: any[];
  announcements: any[];
}


function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(dbFile)) {
      const content = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.version) parsed.version = 1;
      if (!parsed.lastModified) parsed.lastModified = Date.now();
      return parsed;
    }
  } catch (e) {
    console.error('Error loading DB file:', e);
  }

  // Default initial data
  const initialDb: DatabaseSchema = {
    version: 1,
    lastModified: Date.now(),
    projects: [
      {
        id: 'lms-core-hub',
        category: 'lms',
        titleAr: 'منظومة إدارة المراكز والسناتر التعليمية (LMS Core)',
        titleEn: 'LMS Core Educational Center Manager',
        badgeAr: 'النظام الأساسي المعتمد',
        badgeEn: 'Certified Flagship LMS',
        taglineAr: 'بوابة إلكترونية متكاملة لإدارة الحصص، مجموعات الطلاب، الجداول وسجلات الحضور والغياب للسناتر الكبرى والمدرسين.',
        taglineEn: 'Complete cloud platform for orchestrating classroom sessions, student cohorts, schedules, and fee ledgers.',
        descriptionAr: 'منظومة LMS Core صُممت خصيصاً لمواءمة المتطلبات التشغيلية الواقعية للمراكز التعليمية والسناتر.',
        descriptionEn: 'Engineered specifically for tutoring centers and academies.',
        version: 'v3.8.2',
        developer: 'Lern Web Systems & Lab',
        rating: 4.9,
        reviewsCount: 312,
        accentColor: '#3b82f6',
        isPublished: false, // Unpublished by default as requested
        featuresAr: [
          'لوحة قيادة تفاعلية للمعلمين والإداريين تدعم تعدد الفروع والقاعات',
          'توليد بطاقات QR ذكية لكل طالب لسرعة تسجيل الحضور عند بوابات السنتر',
          'بوابة دفع مدمجة تدعم فودافون كاش، انستاباي، والتحويلات المباشرة'
        ],
        featuresEn: [
          'Multi-branch administrative dashboard managing physical classrooms and online hubs',
          'Instant student smart QR badge generation for millisecond gate check-in',
          'Integrated payment gateway supporting mobile wallets'
        ],
        techStack: ['Next.js 14', 'Tailwind CSS', 'Vercel Edge', 'SQLite / Cloud SQL', 'PWA Engine'],
        priceMonthly: '950 ج.م / $29',
        priceAnnual: '8,500 ج.م / $249',
        priceFull: '27,000 ج.م / $799',
        sourceCode: `// LMS Core Knowledge Base\nexport const config = {\n  version: "3.8.2",\n  features: ["QR_GATE", "PAYMENTS", "ROLE_RBAC"],\n  theme: "blue-modern"\n};`,
        fileData: [],
        secretFiles: [
          {
            name: 'كود السورس كود الأصلي (Full Next.js Repo)',
            type: 'github',
            urlOrNotes: 'git@github.com:lernweb-private/lms-core-master.git (مستودع خاص - متاح للأدمن فقط)',
            updatedAt: '2026-10-24'
          }
        ],
        screenshots: [
          { titleAr: 'لوحة إدارة الفروع والطلاب', titleEn: 'Branch & Student Ledger', bgGradient: 'from-blue-900 to-indigo-950', mockupType: 'dashboard' },
          { titleAr: 'بوابة تسجيل الحضور بالباركود', titleEn: 'QR Gate Check-In Terminal', bgGradient: 'from-sky-900 to-slate-900', mockupType: 'qr' }
        ],
        sandboxConfig: {
          centerName: 'أكاديمية ليرن ويب المركزية',
          theme: 'ocean',
          activeCourse: 'كورس الرياضيات للثانوية العامة',
          hasQuiz: true,
          bannerText: 'تنبيه: بدأ التسجيل في المجموعات الجديدة للفصل الدراسي الثاني!',
          tutorName: 'أ. د. كريم المنشاوي'
        }
      },
      {
        id: 'ai-exam-proctor',
        category: 'ai',
        titleAr: 'منصة الاختبارات الذكية والمراقبة الآلية (Proctor AI)',
        titleEn: 'Proctor AI Smart Examination Suite',
        badgeAr: 'ذكاء اصطناعي فوري',
        badgeEn: 'Real-time AI Shield',
        taglineAr: 'محرك تقييم فوري يمنع تسريب الاختبارات ويكشف محاولات الغش مع تصحيح ذكي للأسئلة.',
        taglineEn: 'High-integrity testing engine featuring active anti-cheat safeguards and semantic open-ended grading.',
        descriptionAr: 'منظومة Proctor AI تقدم تجربة اختبارات آمنة تماماً تدعم بنوك الأسئلة المتدرجة الصعوبة.',
        descriptionEn: 'Resilient testing ecosystem equipped with algorithmic question randomization.',
        version: 'v2.4.0',
        developer: 'Cognitive Learner Inc.',
        rating: 4.8,
        reviewsCount: 184,
        accentColor: '#8b5cf6',
        isPublished: false, // Unpublished by default
        featuresAr: [
          'تأمين كامل للمتصفح مع منع النسخ وتصوير الشاشة وتبديل النوافذ',
          'بنوك أسئلة ديناميكية تعيد ترتيب الأسئلة والخيارات لكل طالب',
          'تصحيح فوري مدعوم بالذكاء الاصطناعي مع تقديم تحليل مفصل لكل إجابة'
        ],
        featuresEn: [
          'Lockdown browser environment preventing clipboard copying and tab jumps',
          'Dynamic question pools generating unique permutations per candidate',
          'Instant AI-assisted rubric evaluation with step-by-step diagnostic feedback'
        ],
        techStack: ['WebAssembly', 'Next.js App Router', 'TensorFlow.js', 'Tailwind CSS'],
        priceMonthly: '1,200 ج.م / $39',
        priceAnnual: '10,500 ج.م / $299',
        priceFull: '32,000 ج.م / $950',
        sourceCode: `// Proctor AI Exam Logic\nconst antiCheat = {\n  lockBrowser: true,\n  trackTabSwitch: true,\n  aiScoring: "semantic"\n};`,
        fileData: [],
        secretFiles: [
          {
            name: 'نماذج الكشف الذكي بالـ AI (TensorFlow Weights)',
            type: 'zip',
            urlOrNotes: 'https://storage.lernweb.internal/models/proctor-ai-weights.tar.gz',
            updatedAt: '2026-10-22'
          }
        ],
        screenshots: [
          { titleAr: 'واجهة الامتحان المقفل والمؤقت', titleEn: 'Lockdown Exam Container', bgGradient: 'from-purple-950 to-slate-900', mockupType: 'quiz' }
        ],
        sandboxConfig: {
          centerName: 'مركز التقييم والقياس الذكي',
          theme: 'midnight',
          activeCourse: 'اختبار تجريبي في الفيزياء والكيمياء',
          hasQuiz: true,
          bannerText: 'الاختبار التجريبي مفتوح الآن: ينتهي الوقت المتبقي تلقائياً بعد 15 دقيقة!',
          tutorName: 'أ. د. سمير عبد الرحمن'
        }
      }
    ],
    settings: {
      adminPasscode: '100100',
      targetWhatsAppNumber: '201024889921',
      centerName: 'ليرن ويب | Lern Web',
      contactEmail: 'contact@lernweb.com',
      socialLinks: {
        whatsapp: 'https://wa.me/201024889921',
        facebook: 'https://facebook.com/lernweb.official',
        youtube: 'https://youtube.com/@lernweb',
        tiktok: 'https://tiktok.com/@lernweb'
      },
      socialAppNames: {
        whatsapp: 'واتساب',
        facebook: 'فيسبوك',
        youtube: 'يوتيوب',
        tiktok: 'تيك توك'
      },
      paymentMethodLabels: { ar: 'طرق الدفع والاشتراك', en: 'Payment & Subscription Methods' },
      primaryColor: '#2563eb',
      accentColor: '#8b5cf6',
      themeMode: 'user',
      globalPrices: {
        monthlyAr: '950 ج.م / $29',
        monthlyEn: '$29 / 950 EGP',
        annualAr: '8,500 ج.م / $249',
        annualEn: '$249 / 8,500 EGP',
        fullAr: '27,000 ج.م / $799',
        fullEn: '$799 / 27,000 EGP'
      },
      seoSettings: {
        title: 'ليرن ويب | Lern Web - المنظومة التعليمية السحابية المتكاملة',
        description: 'سوق أدوات ومحاكي مراكز تعليمية متطورة مع محرك PWA وترخيص مرن وتملك كامل للكود المصدري.',
        ogImage: '/og-image.png',
        twitterImage: '/twitter-image.png'
      }
    },
    wallets: [
      {
        id: 'vodafone-cash',
        nameAr: 'فودافون كاش (Vodafone Cash)',
        nameEn: 'Vodafone Cash (Egypt)',
        number: '01024889921',
        badge: 'مصر - فودافون كاش فوري',
        instructionsAr: 'حول المبلغ المطلوب إلى رقم فودافون كاش الموضح، ثم احتفظ بكود العملية أو لقطة الشاشة.',
        instructionsEn: 'Transfer funds to the specified Vodafone Cash number, then submit reference ID.',
        color: '#e11d48',
        isActive: true
      },
      {
        id: 'orange-cash',
        nameAr: 'أورانج كاش (Orange Cash)',
        nameEn: 'Orange Cash (Egypt)',
        number: '01224889921',
        badge: 'محفظة أورانج كاش الفورية',
        instructionsAr: 'قم بإدخال رقم هاتفك المحمول ليصلك كود التحقق OTP لإتمام الدفع المباشر، أو حول إلى رقم المحفظة.',
        instructionsEn: 'Enter your registered mobile phone number to receive a one-time OTP verification code for instant checkout.',
        color: '#f97316',
        isActive: true
      },
      {
        id: 'instapay',
        nameAr: 'انستاباي الفوري (InstaPay)',
        nameEn: 'InstaPay Direct IPN (Egypt)',
        number: 'lernweb@instapay',
        badge: 'تحويل بنكي لحظي 0% عمولة',
        instructionsAr: 'افتح تطبيق انستاباي، اختر تحويل إلى عنوان دفع لحظي (IPA) واكتب lernweb@instapay ثم اضغط تأكيد.',
        instructionsEn: 'Transfer via InstaPay IPA to lernweb@instapay without fees.',
        color: '#6366f1',
        isActive: true
      }
    ],
    plans: [
      {
        id: 'plan-monthly',
        nameAr: 'الاشتراك الشهري المرن',
        nameEn: 'Flexible Monthly Rental',
        priceAr: '950 ج.م / $29',
        priceEn: '$29 / 950 EGP',
        periodAr: 'شهرياً',
        periodEn: 'per month',
        badgeAr: 'للمراكز الناشئة',
        badgeEn: 'Starter Centers',
        descriptionAr: 'مثالي للمدرسين والسناتر الصغيرة التي تبدأ رحلتها الرقمية.',
        descriptionEn: 'Ideal for individual tutors and growing tutoring centers.',
        isPopular: false,
        accentColor: '#3b82f6'
      },
      {
        id: 'plan-annual',
        nameAr: 'الترخيص السنوي المتقدم',
        nameEn: 'Advanced Annual License',
        priceAr: '8,500 ج.م / $249',
        priceEn: '$249 / 8,500 EGP',
        periodAr: 'سنوياً',
        periodEn: 'per year',
        badgeAr: 'الأكثر طلباً',
        badgeEn: 'Most Popular',
        descriptionAr: 'يشمل اسم نطاق خاص بالمركز، دعم فني فوري، وسعة غير محدودة.',
        descriptionEn: 'Includes Custom Domain, VIP priority SLA, and unlimited quotas.',
        isPopular: true,
        accentColor: '#3b82f6'
      },
      {
        id: 'plan-full',
        nameAr: 'التملك الكامل للكود المصدر',
        nameEn: 'Full Outright Source Buyout',
        priceAr: '27,000 ج.م / $799',
        priceEn: '$799 / 27,000 EGP',
        periodAr: 'دفعة واحدة',
        periodEn: 'one-time payment',
        badgeAr: 'ملكية مدى الحياة',
        badgeEn: 'White-Label Ownership',
        descriptionAr: 'احصل على كامل الكود المصدري بدون أي اشتراكات شهرية.',
        descriptionEn: 'Receive complete uncompressed source code. Zero recurring fees.',
        isPopular: false,
        accentColor: '#8b5cf6'
      }
    ],
    ai_drafts: [],
    users: [],
    media_resources: [],
    user_orders: [],
    reviews: [],
    activity_logs: [
      {
        id: 'log-1',
        actionType: 'settings_updated',
        titleAr: 'تحديث تفضيلات مظهر المنصة',
        titleEn: 'Site-wide Theme Preferences Updated',
        detailsAr: 'تم ضبط وضع الثيم الشامل وتأكيد حفظ إعدادات النظام.',
        detailsEn: 'Configured global theme preference and saved settings.',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      }
    ],
    chat_messages: [],
    support_tickets: [],
    notifications: [],
    articles: [
      {
        id: 'article-pwa-revolution',
        titleAr: 'دليل التحول الرقمي للمراكز التعليمية: كيف توفر تقنية PWA بديلاً فائقاً للتطبيقات التقليدية؟',
        titleEn: 'Digital Transformation for Academies: How PWAs Outperform Traditional Apps',
        categoryAr: 'تقنية وتطوير',
        categoryEn: 'Tech & Dev',
        author: 'م. أحمد الشناوي',
        readTime: '4 دقائق',
        excerptAr: 'تعرف على كيفية عمل تطبيقات الويب التقدمية (PWA) دون الحاجة لمتاجر التطبيقات ومع دعم كامل للعمل بدون إنترنت.',
        excerptEn: 'Discover how Progressive Web Apps eliminate app store friction while providing 100% offline functionality.',
        contentAr: 'تُعد تطبيقات الويب التقدمية (Progressive Web Apps) النقلة النوعية الأكبر في بناء المنظومات التعليمية السحابية. من خلال ميزات التخزين المؤقت المتقدمة عبر Service Workers، يستطيع الطلاب وأولياء الأمور تصفح المحاضرات والجداول وتسجيل الحضور بالـ QR code حتى في حال انقطاع اتصال الإنترنت تماماً داخل قاعات السنتر.',
        contentEn: 'Progressive Web Apps represent a major leap forward for cloud educational systems. Utilizing Service Workers for intelligent caching, students can access lecture recordings and attendance passes even when connectivity is offline.',
        imageUrl: '/homepage_view.png',
        tags: ['PWA', 'التعليم الذكي', 'التطوير السحابي'],
        isPublished: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'article-ai-proctoring',
        titleAr: 'مستقبل الاختبارات الإلكترونية: كيف تمنع خوارزميات المراقبة الذكية تسريب الامتحانات؟',
        titleEn: 'The Future of E-Exams: Algorithmic Anti-Cheat Integrity Systems',
        categoryAr: 'ذكاء اصطناعي',
        categoryEn: 'Artificial Intelligence',
        author: 'د. ياسمين فؤاد',
        readTime: '6 دقائق',
        excerptAr: 'استعراض لأحدث تقنيات تأمين بيئة الاختبارات، إغلاق المتصفح الآمن، وتوليد أسئلة فريدة لكل طالب.',
        excerptEn: 'Deep dive into browser lockdown systems, randomized question permutation, and instant AI assessment.',
        contentAr: 'أصبحت نزاهة الامتحانات التحدي الأكبر للمراكز والسناتر التعليمية. توفر منظومة المراقبة الذكية تقنيات متطورة مثل قفل المتصفح التام (Lockdown Browser) وكشف محاولات تبديل النوافذ والتقاط الشاشات، فضلاً عن التصحيح الدلالي للأسئلة المقالية في أجزاء من الثانية.',
        contentEn: 'Assessment integrity is paramount for high-stakes test prep. Modern proctoring suites employ automated lockdown sandboxes preventing screen capture and multi-tab switching, with sub-second semantic answer evaluation.',
        imageUrl: '/public/admin_dashboard_view.png',
        tags: ['AI', 'الاختبارات', 'الحماية'],
        isPublished: true,
        createdAt: new Date().toISOString()
      }
    ],
    faqs: [
      {
        id: 'faq-1',
        categoryAr: 'عن المنصة',
        categoryEn: 'About Platform',
        questionAr: 'ما هي منصة ليرن ويب (Lern Web) وكيف تفيد المركز التعليمي؟',
        questionEn: 'What is Lern Web and how does it empower educational centers?',
        answerAr: 'منظومة ليرن ويب هي بيئة سحابية متكاملة تتيح للمدرسين والمراكز والسناتر التعليمية إطلاق منصاتهم الخاصة بهوية بصرية مستقلة، وتتضمن بوابات إدارة الطلاب، نظام الحضور الذكي بالـ QR، بنوك الأسئلة والاختبارات التفاعلية، وبيئات البرمجة السحابية مع تطبيق PWA يعمل بدون إنترنت.',
        answerEn: 'Lern Web is a unified cloud ecosystem enabling educators and academies to deploy custom branded portals featuring student hubs, sub-200ms QR check-in gates, AI-proctored exam suites, and PWA offline support.',
        order: 1,
        isPublished: true
      },
      {
        id: 'faq-2',
        categoryAr: 'نظام الاشتراكات',
        categoryEn: 'Pricing Models',
        questionAr: 'ما هي باقات الاشتراك والترخيص المتاحة (شهرى، سنوى، تمليك)؟',
        questionEn: 'What pricing and licensing tiers are available?',
        answerAr: 'تقدم المنصة 3 باقات مرنة تناسب جميع الاحتياجات:\n1. الإيجار الشهري (Monthly): اشتراك مرن وتكلفة منخفضة لتجربة التشغيل.\n2. السنوي المعتمد (Annual): الباقة الأكثر شيوعاً وتشمل استضافة Edge فائقة السرعة، الدعم الفني المباشر، والتحديثات الدورية.\n3. التملك الكامل (Full Buyout): التسليم الكامل للكود المصدري الأصلي غير المضغوط مع ترخيص استخدام دائم دون أي اشتراكات مستقبلياً.',
        answerEn: 'We offer 3 flexible tiers:\n1. Monthly Rental: Low commitment operational tier.\n2. Annual Suite: High-performance Vercel Edge hosting with SLA updates.\n3. Full Source Code Buyout: Perpetual license with uncompressed Next.js source repository ownership.',
        order: 2,
        isPublished: true
      },
      {
        id: 'faq-3',
        categoryAr: 'تطبيق PWA',
        categoryEn: 'PWA & Offline',
        questionAr: 'كيف أقوم بتثبيت واستخدام تطبيق الـ PWA على الهاتف والحاسوب؟',
        questionEn: 'How do I install and run the Progressive Web App (PWA)?',
        answerAr: 'يمكنك تثبيت المنصة بنقرة واحدة بالضغط على زر "تثبيت التطبيق الآن" في الشريط العلوي، أو خيار "Add to Home Screen" من قائمة المتصفح. يتميز التطبيق بالعمل كأنه تطبيق محلي سريع جداً، مع التخزين المحلي المؤقت (Service Worker) للعمل حتى عند ضعف أو انقطاع الإنترنت.',
        answerEn: 'Click the "Install App" prompt in the header or "Add to Home Screen" in your browser. The PWA behaves like a native mobile app with Service Worker caching for seamless offline usage.',
        order: 3,
        isPublished: true
      },
      {
        id: 'faq-4',
        categoryAr: 'التخصيص بالذكاء الاصطناعي',
        categoryEn: 'AI Studio',
        questionAr: 'كيف أستخدم استوديو التخصيص بالذكاء الاصطناعي والمحاكي التفاعلي؟',
        questionEn: 'How do I use the AI Customizer Studio & Live Sandbox Simulator?',
        answerAr: 'في تبويب "المحاكي والذكاء الاصطناعي"، يمكنك كتابة أوامرك باللغة الطبيعية وسيقوم المساعد الذكي بتوليد التعديلات فورياً في المحاكي أمامك مع إمكانية إرسال المسودة للأدمن للاعتماد ومتابعة حالتها من لوحة العميل.',
        answerEn: 'In the Sandbox tab, enter natural language prompts to instantaneously re-render the simulator. Submit your staged draft to the Admin and track approval inside your Client Dashboard.',
        order: 4,
        isPublished: true
      }
    ],
    announcements: [
      {
        id: 'ann-1',
        titleAr: 'تحديث النسخة v3.8.5',
        titleEn: 'Release v3.8.5 Live',
        messageAr: '🚀 تم إطلاق محرك CMS المتكامل ولوحة التحكم المخصصة لإدارة المحتوى والمقالات والمشاريع مباشرة!',
        messageEn: '🚀 Full-featured CMS and Dedicated Control Panel now live for seamless dynamic content management!',
        badgeAr: 'جديد المنصة',
        badgeEn: 'New Update',
        type: 'success',
        isActive: true,
        targetUrl: '#dashboard'
      }
    ]
  };

  try {
    fs.writeFileSync(dbFile, JSON.stringify(initialDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to initialize lernweb_db.json on disk:', err);
  }

  return initialDb;
}

function saveDb(data: DatabaseSchema) {
  try {
    data.version = (data.version || 0) + 1;
    data.lastModified = Date.now();
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving DB file:', e);
  }
}

let firestoreAvailable: boolean | null = null;

async function safeFdbGet(col: string): Promise<any[] | null> {
  if (firestoreAvailable === false) return null;
  try {
    const snap = await fdb.collection(col).get();
    firestoreAvailable = true;
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch {
    firestoreAvailable = false;
    return null;
  }
}

async function safeFdbGetDoc(col: string, docId: string): Promise<any | null> {
  if (firestoreAvailable === false) return null;
  try {
    const doc = await fdb.collection(col).doc(docId).get();
    firestoreAvailable = true;
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch {
    firestoreAvailable = false;
    return null;
  }
}

async function safeFdbSet(col: string, docId: string, data: any): Promise<boolean> {
  if (firestoreAvailable === false) return false;
  try {
    await fdb.collection(col).doc(docId).set(data, { merge: true });
    firestoreAvailable = true;
    return true;
  } catch {
    firestoreAvailable = false;
    return false;
  }
}

async function safeFdbDelete(col: string, docId: string): Promise<boolean> {
  if (firestoreAvailable === false) return false;
  try {
    await fdb.collection(col).doc(docId).delete();
    firestoreAvailable = true;
    return true;
  } catch {
    firestoreAvailable = false;
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  let db = loadDb();

  // Full cross-device sync endpoint - robust fallback to local JSON database
  app.get('/api/sync', async (req, res) => {
    try {
      const collections = [
        'projects', 'settings', 'wallets', 'plans', 'drafts', 
        'users', 'media_resources', 'user_orders', 'reviews', 
        'activity_logs', 'chat_messages', 'support_tickets', 'notifications',
        'articles', 'faqs', 'announcements'
      ];
      
      const results: any = {};
      
      await Promise.all(collections.map(async (col) => {
        const docs = await safeFdbGet(col);
        if (docs && docs.length > 0) {
          results[col] = docs;
        }
      }));

      res.json({
        version: db.version || Date.now(),
        lastModified: db.lastModified || Date.now(),
        projects: (results.projects && results.projects.length > 0) ? results.projects : (db.projects || []),
        settings: (results.settings?.find((s: any) => s.id === 'global')) || (results.settings?.[0]) || db.settings || {},
        wallets: (results.wallets && results.wallets.length > 0) ? results.wallets : (db.wallets || []),
        plans: (results.plans && results.plans.length > 0) ? results.plans : (db.plans || []),
        drafts: results.drafts || db.ai_drafts || [],
        users: results.users || db.users || [],
        media: (results.media_resources && results.media_resources.length > 0) ? results.media_resources : (db.media_resources || []),
        orders: results.user_orders || db.user_orders || [],
        reviews: results.reviews || db.reviews || [],
        logs: results.activity_logs || db.activity_logs || [],
        chats: results.chat_messages || db.chat_messages || [],
        tickets: results.support_tickets || db.support_tickets || [],
        notifications: results.notifications || db.notifications || [],
        articles: (results.articles && results.articles.length > 0) ? results.articles : (db.articles || []),
        faqs: (results.faqs && results.faqs.length > 0) ? results.faqs : (db.faqs || []),
        announcements: (results.announcements && results.announcements.length > 0) ? results.announcements : (db.announcements || [])
      });
    } catch (err) {
      console.error('Critical sync error:', err);
      res.status(500).json({ error: 'Sync failed' });
    }
  });

  // Projects
  app.get('/api/projects', async (req, res) => {
    try {
      const includeUnpublished = req.query.includeUnpublished === 'true';
      let all = await safeFdbGet('projects');
      if (!all || all.length === 0) {
        all = db.projects || [];
      }
      if (includeUnpublished) {
        res.json(all);
      } else {
        res.json(all.filter((p: any) => p.isPublished));
      }
    } catch (e) {
      res.json(db.projects || []);
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const p = req.body;
      if (!p || !p.id) return res.status(400).json({ error: 'Invalid project' });
      db.projects = [p, ...(db.projects || []).filter((x: any) => x.id !== p.id)];
      saveDb(db);
      safeFdbSet('projects', p.id, p);
      res.json({ success: true, project: p });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save project' });
    }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const id = req.params.id;
      db.projects = (db.projects || []).filter((x: any) => x.id !== id);
      saveDb(db);
      safeFdbDelete('projects', id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  app.patch('/api/projects/:id/publish', async (req, res) => {
    try {
      const id = req.params.id;
      let newState = true;
      db.projects = (db.projects || []).map((p: any) => {
        if (p.id === id) {
          newState = !p.isPublished;
          return { ...p, isPublished: newState };
        }
        return p;
      });
      saveDb(db);
      const updated = db.projects.find((p: any) => p.id === id);
      if (updated) {
        safeFdbSet('projects', id, updated);
      }
      res.json({ success: true, isPublished: newState });
    } catch (e) {
      res.status(500).json({ error: 'Failed to patch project' });
    }
  });

  // Settings
  app.get('/api/settings', async (req, res) => {
    try {
      const fdbDoc = await safeFdbGetDoc('settings', 'global');
      res.json(fdbDoc || db.settings || {});
    } catch (e) {
      res.json(db.settings || {});
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      db.settings = { ...db.settings, ...req.body };
      saveDb(db);
      safeFdbSet('settings', 'global', req.body);
      res.json({ success: true, settings: db.settings });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  // Wallets
  app.get('/api/wallets', async (req, res) => {
    try {
      const wallets = await safeFdbGet('wallets');
      res.json(wallets && wallets.length > 0 ? wallets : (db.wallets || []));
    } catch (e) {
      res.json(db.wallets || []);
    }
  });

  app.post('/api/wallets', async (req, res) => {
    try {
      const wallets = req.body;
      if (Array.isArray(wallets)) {
        db.wallets = wallets;
        saveDb(db);
        wallets.forEach(w => safeFdbSet('wallets', w.id, w));
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save wallets' });
    }
  });

  // AI Drafts
  app.get('/api/drafts', async (req, res) => {
    try {
      const drafts = await safeFdbGet('drafts');
      res.json(drafts && drafts.length > 0 ? drafts : (db.ai_drafts || []));
    } catch (e) {
      res.json(db.ai_drafts || []);
    }
  });

  app.post('/api/drafts', async (req, res) => {
    try {
      const d = req.body;
      if (!d || !d.id) return res.status(400).json({ error: 'Invalid draft' });
      db.ai_drafts = [d, ...(db.ai_drafts || []).filter((x: any) => x.id !== d.id)];
      saveDb(db);
      safeFdbSet('drafts', d.id, d);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save draft' });
    }
  });

  app.patch('/api/drafts/:id', async (req, res) => {
    try {
      const { status, notes } = req.body;
      db.ai_drafts = (db.ai_drafts || []).map((d: any) => {
        if (d.id === req.params.id) {
          return { ...d, status, ...(notes !== undefined ? { notes } : {}) };
        }
        return d;
      });
      saveDb(db);
      const updated = db.ai_drafts.find((d: any) => d.id === req.params.id);
      if (updated) {
        safeFdbSet('drafts', req.params.id, updated);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update draft' });
    }
  });

  // Users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await safeFdbGet('users');
      res.json(users && users.length > 0 ? users : (db.users || []));
    } catch (e) {
      res.json(db.users || []);
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const u = req.body;
      if (!u || !u.id) return res.status(400).json({ error: 'Invalid user' });
      db.users = [u, ...(db.users || []).filter((x: any) => x.id !== u.id)];
      saveDb(db);
      safeFdbSet('users', u.id, u);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save user' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      db.users = (db.users || []).filter((x: any) => x.id !== userId);
      saveDb(db);
      safeFdbDelete('users', userId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Plans
  app.get('/api/plans', async (req, res) => {
    try {
      const plans = await safeFdbGet('plans');
      res.json(plans && plans.length > 0 ? plans : (db.plans || []));
    } catch (e) {
      res.json(db.plans || []);
    }
  });

  app.post('/api/plans', async (req, res) => {
    try {
      const plans = req.body;
      if (Array.isArray(plans)) {
        db.plans = plans;
        saveDb(db);
        plans.forEach(p => safeFdbSet('plans', p.id, p));
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save plans' });
    }
  });

  // Media
  app.get('/api/media', async (req, res) => {
    try {
      const media = await safeFdbGet('media_resources');
      res.json(media && media.length > 0 ? media : (db.media_resources || []));
    } catch (e) {
      res.json(db.media_resources || []);
    }
  });

  app.post('/api/media', async (req, res) => {
    try {
      const m = req.body;
      if (!m || !m.id) return res.status(400).json({ error: 'Invalid media' });
      db.media_resources = [m, ...(db.media_resources || []).filter((x: any) => x.id !== m.id)];
      saveDb(db);
      safeFdbSet('media_resources', m.id, m);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save media' });
    }
  });

  app.delete('/api/media/:id', async (req, res) => {
    try {
      const id = req.params.id;
      db.media_resources = (db.media_resources || []).filter((x: any) => x.id !== id);
      saveDb(db);
      safeFdbDelete('media_resources', id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete media' });
    }
  });

  // Orders
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await safeFdbGet('user_orders');
      res.json(orders && orders.length > 0 ? orders : (db.user_orders || []));
    } catch (e) {
      res.json(db.user_orders || []);
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const o = req.body;
      if (!o || !o.id) return res.status(400).json({ error: 'Invalid order' });
      db.user_orders = [o, ...(db.user_orders || []).filter((x: any) => x.id !== o.id)];
      saveDb(db);
      safeFdbSet('user_orders', o.id, o);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save order' });
    }
  });

  // Reviews
  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await safeFdbGet('reviews');
      res.json(reviews && reviews.length > 0 ? reviews : (db.reviews || []));
    } catch (e) {
      res.json(db.reviews || []);
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const r = req.body;
      if (!r || !r.id) return res.status(400).json({ error: 'Invalid review' });
      db.reviews = [r, ...(db.reviews || []).filter((x: any) => x.id !== r.id)];
      saveDb(db);
      safeFdbSet('reviews', r.id, r);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save review' });
    }
  });

  app.delete('/api/reviews/:id', async (req, res) => {
    try {
      const id = req.params.id;
      db.reviews = (db.reviews || []).filter((x: any) => x.id !== id);
      saveDb(db);
      safeFdbDelete('reviews', id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  // Activity Logs
  app.get('/api/logs', async (req, res) => {
    try {
      const logs = await safeFdbGet('activity_logs');
      res.json(logs && logs.length > 0 ? logs : (db.activity_logs || []));
    } catch (e) {
      res.json(db.activity_logs || []);
    }
  });

  app.post('/api/logs', async (req, res) => {
    try {
      const log = req.body;
      if (!log || !log.id) return res.status(400).json({ error: 'Invalid log' });
      db.activity_logs = [log, ...(db.activity_logs || []).filter((x: any) => x.id !== log.id)];
      saveDb(db);
      safeFdbSet('activity_logs', log.id, log);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save log' });
    }
  });

  // Chat Messages
  app.get('/api/chats', async (req, res) => {
    try {
      const chats = await safeFdbGet('chat_messages');
      res.json(chats && chats.length > 0 ? chats : (db.chat_messages || []));
    } catch (e) {
      res.json(db.chat_messages || []);
    }
  });

  app.post('/api/chats', async (req, res) => {
    try {
      const chat = req.body;
      if (!chat || !chat.id) return res.status(400).json({ error: 'Invalid chat' });
      db.chat_messages = [chat, ...(db.chat_messages || []).filter((x: any) => x.id !== chat.id)];
      saveDb(db);
      safeFdbSet('chat_messages', chat.id, chat);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save chat' });
    }
  });

  app.delete('/api/chats/:id', async (req, res) => {
    try {
      const id = req.params.id;
      db.chat_messages = (db.chat_messages || []).filter((x: any) => x.id !== id);
      saveDb(db);
      safeFdbDelete('chat_messages', id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete chat' });
    }
  });

  // Support Tickets API
  app.get('/api/tickets', async (req, res) => {
    try {
      const tickets = await safeFdbGet('support_tickets');
      res.json(tickets && tickets.length > 0 ? tickets : (db.support_tickets || []));
    } catch (e) {
      res.json(db.support_tickets || []);
    }
  });

  app.post('/api/tickets', async (req, res) => {
    try {
      const ticket = req.body;
      if (!ticket || !ticket.id) return res.status(400).json({ error: 'Invalid ticket' });
      db.support_tickets = [ticket, ...(db.support_tickets || []).filter((x: any) => x.id !== ticket.id)];
      saveDb(db);
      safeFdbSet('support_tickets', ticket.id, ticket);
      res.json({ success: true, ticket });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save ticket' });
    }
  });

  app.delete('/api/tickets/:id', async (req, res) => {
    try {
      const id = req.params.id;
      db.support_tickets = (db.support_tickets || []).filter((x: any) => x.id !== id);
      saveDb(db);
      safeFdbDelete('support_tickets', id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  });

  // CMS Articles API
  app.get('/api/articles', async (req, res) => {
    try {
      const includeDrafts = req.query.includeDrafts === 'true';
      let all = await safeFdbGet('articles');
      if (!all || all.length === 0) {
        all = db.articles || [];
      }
      if (includeDrafts) {
        res.json(all);
      } else {
        res.json(all.filter((a: any) => a.isPublished !== false));
      }
    } catch (e) {
      res.json(db.articles || []);
    }
  });

  app.post('/api/articles', async (req, res) => {
    try {
      const article = req.body;
      if (!article || !article.id) return res.status(400).json({ error: 'Invalid article' });
      db.articles = [article, ...(db.articles || []).filter((a: any) => a.id !== article.id)];
      saveDb(db);
      safeFdbSet('articles', article.id, article);
      res.json({ success: true, article });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save article' });
    }
  });

  app.delete('/api/articles/:id', async (req, res) => {
    try {
      const id = req.params.id;
      db.articles = (db.articles || []).filter((a: any) => a.id !== id);
      saveDb(db);
      safeFdbDelete('articles', id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete article' });
    }
  });

  // CMS FAQs API
  app.get('/api/faqs', async (req, res) => {
    try {
      let all = await safeFdbGet('faqs');
      if (!all || all.length === 0) {
        all = db.faqs || [];
      }
      res.json(all);
    } catch (e) {
      res.json(db.faqs || []);
    }
  });

  app.post('/api/faqs', async (req, res) => {
    try {
      const faq = req.body;
      if (!faq || !faq.id) return res.status(400).json({ error: 'Invalid faq' });
      db.faqs = [faq, ...(db.faqs || []).filter((f: any) => f.id !== faq.id)];
      saveDb(db);
      safeFdbSet('faqs', faq.id, faq);
      res.json({ success: true, faq });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save faq' });
    }
  });

  app.delete('/api/faqs/:id', async (req, res) => {
    try {
      const id = req.params.id;
      db.faqs = (db.faqs || []).filter((f: any) => f.id !== id);
      saveDb(db);
      safeFdbDelete('faqs', id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete faq' });
    }
  });

  // CMS Announcements API
  app.get('/api/announcements', async (req, res) => {
    try {
      let all = await safeFdbGet('announcements');
      if (!all || all.length === 0) {
        all = db.announcements || [];
      }
      res.json(all);
    } catch (e) {
      res.json(db.announcements || []);
    }
  });

  app.post('/api/announcements', async (req, res) => {
    try {
      const ann = req.body;
      if (!ann || !ann.id) return res.status(400).json({ error: 'Invalid announcement' });
      db.announcements = [ann, ...(db.announcements || []).filter((a: any) => a.id !== ann.id)];
      saveDb(db);
      safeFdbSet('announcements', ann.id, ann);
      res.json({ success: true, announcement: ann });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save announcement' });
    }
  });

  app.delete('/api/announcements/:id', async (req, res) => {
    try {
      const id = req.params.id;
      db.announcements = (db.announcements || []).filter((a: any) => a.id !== id);
      saveDb(db);
      safeFdbDelete('announcements', id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete announcement' });
    }
  });



  // Robust Multi-Model AI Generator with Exponential Backoff and Attempt Timeout
  async function generateAiContentWithRetry(params: any, retries = 1) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;

    const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms));

    for (const model of candidateModels) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const apiCall = ai.models.generateContent({
            ...params,
            model
          });

          const response: any = await Promise.race([apiCall, timeoutPromise(8000)]);
          if (response && response.text) {
            return response;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[AI] Model ${model} attempt ${attempt + 1} encountered:`, err?.message || err);
          if (attempt < retries) {
            const delay = Math.min(500 * Math.pow(2, attempt) + Math.random() * 200, 2000);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
    }
    throw lastError || new Error('All AI models failed to respond');
  }

  // AI Chat Route
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history, systemInstruction, aiContext } = req.body;
      if (!message) return res.status(400).json({ error: 'Message is required' });

      if (!aiApiKey) {
        throw new Error('GEMINI_API_KEY is missing from environment');
      }

      // Fetch data for real-time awareness with clean fallback
      let liveProjects = [];
      let liveSettings: any = db.settings;
      let liveMedia = [];
      let livePlans = [];

      if (firestoreAvailable !== false) {
        try {
          const projectsSnap = await fdb.collection('projects').where('isPublished', '==', true).get();
          liveProjects = projectsSnap.docs.map(doc => doc.data());
          
          const settingsSnap = await fdb.collection('settings').doc('global').get();
          if (settingsSnap.exists) {
            liveSettings = settingsSnap.data();
          }
          
          const mediaSnap = await fdb.collection('media_resources').where('isPublished', '==', true).get();
          liveMedia = mediaSnap.docs.map(doc => doc.data());

          const plansSnap = await fdb.collection('plans').get();
          livePlans = plansSnap.docs.map(doc => doc.data());
          firestoreAvailable = true;
        } catch {
          firestoreAvailable = false;
          liveProjects = (db.projects || []).filter((p: any) => p.isPublished);
          liveMedia = db.media_resources || [];
          livePlans = db.plans || [];
        }
      } else {
        liveProjects = (db.projects || []).filter((p: any) => p.isPublished);
        liveMedia = db.media_resources || [];
        livePlans = db.plans || [];
      }

      // Fast-Path for programmer / developer identity queries
      const cleanMsg = (message || '').trim().toLowerCase();
      const programmerQueryPatterns = [
        'من برمجك', 'مين برمجك', 'من طورك', 'مين طورك', 'من صنعك', 'مين صنعك',
        'من المطور', 'مين المطور', 'مين عملك', 'من عملك', 'من برمجتك', 'مين برمجتك',
        'من انشأك', 'مين انشاك', 'مين صممك', 'من صممك',
        'who programmed you', 'who developed you', 'who made you', 'who created you'
      ];
      if (programmerQueryPatterns.some(pattern => cleanMsg.includes(pattern))) {
        return res.json({
          text: 'تمت برمجتي وتطويري بالكامل بواسطة فريق ومهندسي شركة ليرن ويب (Lern Web) المتخصصة في الحلول التعليمية السحابية وأنظمة إدارة المراكز المتقدمة.',
          _v: '3.8.0',
          fastPath: true
        });
      }

      // Live real-time context directly from latest updated database state
      const liveWallets = db.wallets || [];
      const liveArticles = db.articles || [];
      const liveFaqs = db.faqs || [];
      const liveAnnouncements = db.announcements || [];
      const liveDrafts = db.ai_drafts || [];
      const liveStaff = db.users?.filter((u: any) => u.role && u.role !== 'user') || [];
      const liveAchievements = (db as any).achievements || [];
      const liveTickets = db.support_tickets || [];

      const contents = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          if (msg.text && msg.sender) {
            contents.push({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            });
          }
        });
      }
      
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const defaultSystemInstruction = `
أنت "المساعد الذكي الرسمي والمهندس التقني الشامل لمنصة ليرن ويب (Lern Web AI Architect & Platform Monitor)".

هويتك وتطويرك:
- تمت برمجتك وتطويرك بالكامل بواسطة "شركة ليرن ويب (Lern Web)". إذا سُئلت في أي وقت "من برمجك؟" أو "مين طورك؟" أو عن الشركة المطورة، أجب فوراً وبشكل قاطع: "تمت برمجتي وتطويري بواسطة شركة ليرن ويب (Lern Web)".
- إجاباتك سريعة، احترافية، ودقيقة ومباشرة دون مقدمات طويلة.

صلاحياتك ومراقبة المنصة:
لديك صلاحية ورؤية كاملة لمراقبة كل حدث وتعديل بالمنصة (تقرير مباشر ومحدث لحالة الطلبات والمشاريع والتعديلات) لإجابة وتوجيه العميل بدقة فائقة:

تقرير سياق منصة ليرن ويب المحدث لحظياً:
1. المشاريع المتاحة: ${JSON.stringify(liveProjects.map(p => ({ id: p.id, titleAr: p.titleAr, category: p.category, price: p.priceMonthly, isPublished: p.isPublished })))}
2. تقرير طلبات التعديل والمسودات الحالية للعملاء (Drafts Monitor):
${liveDrafts.length > 0 ? liveDrafts.map((d: any) => `  - طلب [${d.id}] للعميل (${d.visitorName || 'زائر'}) | المركز: ${d.modifiedConfig?.centerName || 'بدون اسم'} | الحالة الحالية: [${d.status || 'pending_review'}] | ملاحظات الإدارة: ${d.notes || 'لا يوجد'}`).join('\n') : '  - لا توجد طلبات تعديل جارية حالياً.'}
3. طرق الدفع وروابط التحويل المعتمدة:
${liveWallets.filter((w: any) => w.isActive !== false).map((w: any) => `  - ${w.nameAr || w.nameEn}: ${w.number || w.url || ''} ${w.instructions ? `(${w.instructions})` : ''}`).join('\n')}
4. فريق العمل والمشرفين المعتمدين بطلب الدعم:
${liveStaff.map((s: any) => `  - ${s.name} (${s.role}): هاتف ${s.phone || 'غير محدد'}`).join('\n')}
5. الإعلانات والبانر الإخباري النشط: ${liveAnnouncements.filter((a: any) => a.isActive).map((a: any) => a.messageAr || a.messageEn).join(' | ')}
6. باقات الاشتراك والتراخيص:
${livePlans.map(p => `  - ${p.nameAr}: ${p.priceAr} (${p.periodAr})`).join('\n')}
7. الإعدادات العامة للهوية: ${JSON.stringify({ centerName: liveSettings?.centerName, contactWhatsApp: liveSettings?.targetWhatsAppNumber, contactEmail: liveSettings?.contactEmail })}
8. قسم إنجازاتنا وسابقة الأعمال: ${liveAchievements.slice(0, 5).map((ach: any) => ach.titleAr).join(' · ')}
9. أحدث مقالات الـ CMS: ${liveArticles.slice(0, 3).map((a: any) => a.titleAr).join(', ')}
10. الأسئلة الشائعة: ${liveFaqs.slice(0, 4).map((f: any) => f.questionAr).join(', ')}

قواعد الاستجابة للعملاء:
- إذا استفسر العميل عن حالة طلبه أو مسودته، ابحث في تقرير المسودات أعلاه وأخبره فوراً بالحالة الدقيقة وبملاحظات الإدارة.
- إذا استفسر عن أرقام الدفع، قدم المحافظ النشطة مباشرة.
${aiContext ? `\n[CLIENT SUBMITTED REAL-TIME STATE CONTEXT]\n${aiContext}\n` : ''}
`;

      const response = await generateAiContentWithRetry({
        contents: contents,
        config: {
          systemInstruction: systemInstruction || defaultSystemInstruction,
          temperature: 0.5,
        }
      });

      if (!response.text) {
        throw new Error('Model returned an empty response');
      }

      res.json({ text: response.text, _v: '3.8.0' });
    } catch (err: any) {
      console.error('AI Chat Error:', err.message || err);
      const errorMsg = err.message || JSON.stringify(err);
      res.status(500).json({ 
        error: 'AI generation failed', 
        details: errorMsg,
        checkApiKey: !aiApiKey,
        _v: '3.8.0'
      });
    }
  });

  // Dedicated Admin AI Copilot Route (Assists Admin inside the Control Panel)
  app.post('/api/ai/admin-copilot', async (req, res) => {
    try {
      const { action, prompt, topic } = req.body;
      const userPrompt = prompt || topic || 'اقتراح تحسينات عامة للمنصة';

      // Fast path for developer query
      const cleanPrompt = (userPrompt || '').toLowerCase();
      if (cleanPrompt.includes('من برمجك') || cleanPrompt.includes('مين برمجك') || cleanPrompt.includes('who programmed you')) {
        return res.json({
          success: true,
          result: 'تمت برمجتي وتطويري بالكامل بواسطة فريق ومهندسي شركة ليرن ويب (Lern Web).'
        });
      }

      if (!aiApiKey) {
        // High quality offline fallback for quick admin actions
        if (action === 'draft_article') {
          return res.json({
            success: true,
            article: {
              id: 'art-' + Date.now(),
              titleAr: `دليل شامل: ${userPrompt}`,
              titleEn: `Comprehensive Guide: ${userPrompt}`,
              categoryAr: 'حلول تعليمية',
              categoryEn: 'Educational Solutions',
              author: 'فريق ليرن ويب التقني',
              readTime: '3 دقائق',
              excerptAr: `استكشف أهم الاستراتيجيات والمزايا التقنية حول ${userPrompt} لتطوير سنترك التعليمي.`,
              excerptEn: `Explore modern strategies regarding ${userPrompt} to accelerate your academy.`,
              contentAr: `تعتبر تقنيات التعليم الرقمي ركيزة أساسية لنجاح السناتر والمراكز الحديثة. نناقش في هذا المقال كيفية تطبيق ${userPrompt} عملياً بأفضل المعايير.`,
              contentEn: `Digital educational tools represent the cornerstone of modern academies. Here is how to apply ${userPrompt} efficiently.`,
              imageUrl: '/homepage_view.png',
              tags: ['تطوير', 'تعليم ذكي', 'ليرن ويب'],
              isPublished: true,
              createdAt: new Date().toISOString()
            }
          });
        }
        if (action === 'draft_announcement') {
          return res.json({
            success: true,
            announcement: {
              id: 'ann-' + Date.now(),
              titleAr: 'تحديث جديد',
              titleEn: 'New Update',
              messageAr: `📢 ${userPrompt} - متوفر الآن لكافة المراكز والطلاب!`,
              messageEn: `📢 ${userPrompt} - Now live for all academies and students!`,
              badgeAr: 'جديد',
              badgeEn: 'New',
              type: 'success',
              isActive: true,
              targetUrl: '#store'
            }
          });
        }
        if (action === 'draft_faq') {
          return res.json({
            success: true,
            faq: {
              id: 'faq-' + Date.now(),
              categoryAr: 'استفسارات عامة',
              categoryEn: 'General FAQs',
              questionAr: `كيف يمكن الاستفادة من ${userPrompt} في السنتر؟`,
              questionEn: `How does ${userPrompt} benefit the tutoring center?`,
              answerAr: `تتيح المنصة إمكانية تخصيص وتشغيل ${userPrompt} بسهولة تامة وبأعلى سرعة مع التوافق التام مع الهواتف والحواسب بدون إنترنت عبر تقنية PWA.`,
              answerEn: `The platform allows effortless deployment of ${userPrompt} with 100% PWA offline support across mobile and desktop.`,
              order: (db.faqs?.length || 0) + 1,
              isPublished: true
            }
          });
        }
      }

      const copilotInstruction = `
أنت "المساعد الذكي الخاص بمدير ومشرف منصة ليرن ويب (Admin AI Copilot)".
تمت برمجتك وتطويرك بواسطة شركة ليرن ويب (Lern Web).
مهمتك: مساعدة الأدمن داخل لوحة التحكم في صياغة مقالات CMS، إعلانات، أسئلة شائعة، اقتراح هويات بصرية، ومراجعة أداء المنصة.
إجاباتك سريعة جداً واحترافية وبصيغة JSON عندما يُطلب ذلك أو بنص عربي منسق.
`;

      let promptText = '';
      if (action === 'draft_article') {
        promptText = `أنت في وضع صياغة مقال CMS للمدونة. الموضوع هو: "${userPrompt}".
أرجع كائن JSON صالح فقط بالشكل التالي دون أي markdown إضافي:
{
  "titleAr": "عنوان جذاب بالعربية",
  "titleEn": "Catchy English Title",
  "categoryAr": "تقنية وتطوير أو ذكاء اصطناعي أو إدارة مراكز",
  "categoryEn": "Tech or AI or Management",
  "readTime": "4 دقائق",
  "excerptAr": "مقدمة ملخصة في سطرين",
  "excerptEn": "Short two-line excerpt",
  "contentAr": "نص المقال الكامل (3-4 فقرات غنية)",
  "contentEn": "Full article in English",
  "tags": ["PWA", "تعليم", "سنتر"]
}`;
      } else if (action === 'draft_announcement') {
        promptText = `أنت في وضع صياغة إعلان شريطي (Announcement Banner). الموضوع هو: "${userPrompt}".
أرجع كائن JSON صالح فقط:
{
  "titleAr": "عنوان قصير للإعلان",
  "titleEn": "Short Title",
  "messageAr": "نص الإعلان مع إيموجي مميز",
  "messageEn": "Announcement message with emoji",
  "badgeAr": "هام أو جديد أو خصم",
  "badgeEn": "Important or New",
  "type": "success"
}`;
      } else if (action === 'draft_faq') {
        promptText = `أنت في وضع صياغة سؤال شائع وإجابته للمنصة التعليمية. الموضوع: "${userPrompt}".
أرجع كائن JSON صالح فقط:
{
  "categoryAr": "عن المنصة أو الاشتراكات أو PWA",
  "categoryEn": "General or Pricing or PWA",
  "questionAr": "السؤال بالعربية بشكل واضح",
  "questionEn": "English Question",
  "answerAr": "إجابة وافية ومطمئنة للعميل",
  "answerEn": "Clear professional answer"
}`;
      } else {
        promptText = userPrompt;
      }

      const response = await generateAiContentWithRetry({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          systemInstruction: copilotInstruction,
          temperature: 0.4
        }
      });

      const raw = response.text?.trim() || '';
      let jsonResult = null;
      try {
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        jsonResult = JSON.parse(cleaned);
      } catch {
        jsonResult = null;
      }

      res.json({
        success: true,
        text: raw,
        data: jsonResult,
        _v: '3.8.0'
      });
    } catch (err: any) {
      console.warn('Admin Copilot error:', err);
      res.status(500).json({ error: 'Copilot request failed', details: err?.message });
    }
  });

  // AI Project Customization Route (For Sandbox)
  app.post('/api/ai/customize', async (req, res) => {
    try {
      const { prompt, baseConfig } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

      if (!aiApiKey) throw new Error('GEMINI_API_KEY missing');

      const systemInstruction = `
You are an expert software architect and full-stack developer for "Lern Web". 
Your task is to analyze the user's request and suggest modifications to the educational platform configuration and its source code.

You MUST return strictly valid JSON in this format:
{
  "explanationAr": "شرح التعديلات باللغة العربية...",
  "explanationEn": "Explanation of changes in English...",
  "theme": "ocean" | "midnight" | "emerald" | "amber",
  "centerName": "...",
  "activeCourse": "...",
  "bannerText": "...",
  "tutorName": "...",
  "hasQuiz": true | false,
  "modifiedCode": "The primary modified JSX/React code block if applicable...",
  "modifiedFiles": [
    {
      "name": "filename.extension",
      "content": "Full content of the modified or new file...",
      "type": "text/javascript" | "text/css" | "text/html" | "application/json"
    }
  ]
}

Context:
- The user is working on a sandbox version of a project.
- You should provide high-quality, production-ready code in the 'modifiedCode' or 'modifiedFiles' fields if the user asks for design or logic changes.
- If the user wants to change colors, suggest a matching 'theme'.
- Keep explanations professional and helpful.
`;

      const response = await generateAiContentWithRetry({
        contents: [
          {
            role: 'user',
            parts: [{ text: `Current Config & Source Context: ${JSON.stringify(baseConfig)}\n\nUser Customization Request: "${prompt}"` }]
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });


      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      res.json({
        success: true,
        explanationAr: parsed.explanationAr || 'تم تحليل طلبك.',
        explanationEn: parsed.explanationEn || 'Analyzed.',
        suggestedConfig: {
          centerName: parsed.centerName || baseConfig.centerName,
          theme: ['ocean', 'midnight', 'emerald', 'amber'].includes(parsed.theme) ? parsed.theme : baseConfig.theme,
          activeCourse: parsed.activeCourse || baseConfig.activeCourse,
          hasQuiz: typeof parsed.hasQuiz === 'boolean' ? parsed.hasQuiz : baseConfig.hasQuiz,
          bannerText: parsed.bannerText || baseConfig.bannerText,
          tutorName: parsed.tutorName || baseConfig.tutorName
        },
        modifiedCode: parsed.modifiedCode || '',
        modifiedFiles: parsed.modifiedFiles || []
      });

    } catch (err: any) {
      console.error('AI Customize Critical Failure:', err);
      res.status(500).json({ error: 'Customization failed', details: err.message });
    }
  });

  // Backup
  app.get('/api/backup', (req, res) => {
    db = loadDb();
    res.json({ version: '3.8', exportedAt: new Date().toISOString(), data: db });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
  }

  const port = 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
