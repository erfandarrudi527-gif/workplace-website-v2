/* ============================================================
   آریا استور — لایه داده مشترک
   همه صفحه‌ها از همین توابع استفاده می‌کنند تا کلیدهای
   localStorage و نام فیلدها یکسان بمانند.
   ============================================================ */
(function () {
  "use strict";

  /* مسیر ریشه سایت، از روی src همین اسکریپت حساب می‌شود
     تا تصاویر از هر عمقی درست بارگذاری شوند. */
  const scriptEl = document.querySelector('script[src$="data.js"]');
  const BASE = scriptEl ? scriptEl.getAttribute("src").replace(/data\.js$/, "") : "";

  const img = (name) => BASE + "assets/img/" + name + ".svg";

  /* ---------- گرادیان‌های SVG ----------
     استایل‌ها رنگ آیکون‌ها را با url(#g1) تا url(#g12) تعریف می‌کنند
     و به این تعریف‌ها نیاز دارند. قبلاً این اسپریت داخل هر صفحه تکرار
     می‌شد؛ حالا یک‌جا از همین فایل تزریق می‌شود تا هر صفحه‌ای که
     data.js را لود می‌کند آیکون‌هایش رنگ بگیرد. */
  const GRADIENTS = [
    ["g1", ["#4338ca", "#312e81"]],
    ["g2", ["#4f46e5", "#3730a3"]],
    ["g3", ["#4338ca", "#4f46e5", "#312e81"]],
    ["g4", ["#6366f1", "#312e81"]],
    ["g5", ["#0d9488", "#0f766e"]],
    ["g6", ["#4f46e5", "#3730a3"]],
    ["g7", ["#2dd4bf", "#0f766e"]],
    ["g8", ["#4f46e5", "#4338ca"]],
    ["g9", ["#ffffff", "#fde68a"]],
    ["g10", ["#ffffff", "#c7d2fe"]],
    ["g11", ["#a5b4fc", "#4f46e5"]],
    ["g12", ["#6366f1", "#4338ca"]],
  ];

  function injectGradients() {
    if (document.getElementById("aria-svg-defs")) return;
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("id", "aria-svg-defs");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    const defs = document.createElementNS(NS, "defs");
    GRADIENTS.forEach(([id, stops]) => {
      const grad = document.createElementNS(NS, "linearGradient");
      grad.setAttribute("id", id);
      grad.setAttribute("x1", "0%");
      grad.setAttribute("y1", "0%");
      grad.setAttribute("x2", "100%");
      grad.setAttribute("y2", "100%");
      stops.forEach((color, i) => {
        const stop = document.createElementNS(NS, "stop");
        stop.setAttribute("offset", stops.length === 2 ? (i === 0 ? "0%" : "100%") : i === 0 ? "0%" : i === 1 ? "50%" : "100%");
        stop.setAttribute("stop-color", color);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
    });
    svg.appendChild(defs);
    const mount = () => document.body.insertBefore(svg, document.body.firstChild);
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
  }
  injectGradients();


  /* تصاویر به شکل «کلید» ذخیره می‌شوند (مثلاً "phone-a55") و
     فقط هنگام نمایش به مسیر کامل تبدیل می‌شوند؛ این‌طور داده‌ای که
     در localStorage ذخیره شده از یک صفحه به صفحه دیگر خراب نمی‌شود. */
  function resolveImage(value) {
    if (!value || typeof value !== "string") return "";
    if (/^(data:|https?:|\/\/)/i.test(value)) return value;
    const file = value.split(/[\\/]/).pop() || "";
    const key = file.replace(/\.(svg|png|jpe?g|webp|gif)$/i, "");
    return key ? img(key) : "";
  }

  /* ---------- ابزارهای نمایش ---------- */

  const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

  function toFa(value) {
    return String(value).replace(/\d/g, (d) => FA_DIGITS[d]);
  }

  function faNum(n) {
    const num = Number(n) || 0;
    return toFa(num.toLocaleString("en-US"));
  }

  function faPrice(n) {
    return faNum(n) + " تومان";
  }

  function faDate(date) {
    try {
      return new Date(date).toLocaleDateString("fa-IR");
    } catch (_) {
      return "";
    }
  }

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- خواندن/نوشتن امن ---------- */

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      /* حافظه پر یا حالت خصوصی مرورگر */
    }
  }

  /* ---------- دسته‌بندی محصولات (کاتالوگ پیش‌فرض) ---------- */

  const CATEGORIES = ["هدفون و صدا", "ساعت هوشمند", "پاوربانک و شارژر", "کیس و محافظ", "هولدر و پایه"];

  const DEFAULT_PRODUCTS = [
    { id: 1, name: "هدفون بی‌سیم اپل AirPods Pro 2", category: "هدفون و صدا", image: "earbuds", icon: "🎧", priceValue: 11900000, oldPrice: 13500000, amazing: true, desc: "ایرپاد پرو نسل دوم با حذف نویز فعال، حالت شفافیت و کیس شارژ MagSafe." },
    { id: 2, name: "اسپیکر بلوتوثی JBL Charge 5", category: "هدفون و صدا", image: "speaker", icon: "🔊", priceValue: 8300000, oldPrice: 9200000, amazing: true, desc: "اسپیکر قابل حمل JBL با قدرت ۴۰ وات، ضد آب IP67 و باتری ۲۰ ساعت." },
    { id: 3, name: "ایرباد بی‌سیم شیائومی Redmi Buds 5", category: "هدفون و صدا", image: "earbuds", icon: "🎧", priceValue: 2450000, oldPrice: 2900000, amazing: false, desc: "هدفون بلوتوثی شیائومی با حذف نویز، تأخیر کم و عمر باتری بالا." },
    { id: 4, name: "هدفون گیمینگ Razer BlackShark V2", category: "هدفون و صدا", image: "cat-audio", icon: "🎧", priceValue: 4600000, oldPrice: 5200000, amazing: false, desc: "هدفون سیم‌دار گیمینگ با صدای فراگیر ۷.۱ و میکروفون قابل جدا شدن." },
    { id: 5, name: "ساعت هوشمند شیائومی Watch S3", category: "ساعت هوشمند", image: "smartwatch", icon: "⌚", priceValue: 5450000, oldPrice: 6100000, amazing: true, desc: "ساعت هوشمند با GPS، پایش ضربان قلب و اکسیژن خون و بدنه قابل تنظیم." },
    { id: 6, name: "بند ساعت اپل سیلیکونی اصل", category: "ساعت هوشمند", image: "watch-analog", icon: "⌚", priceValue: 950000, oldPrice: 1200000, amazing: false, desc: "بند سیلیکونی نرم و ضد تعریق برای Apple Watch در رنگ‌های مختلف." },
    { id: 7, name: "پاوربانک انکر ۲۰۰۰۰ میلی‌آمپر", category: "پاوربانک و شارژر", image: "powerbank", icon: "🔋", priceValue: 1850000, oldPrice: 2200000, amazing: true, desc: "پاوربانک Anker با ظرفیت ۲۰۰۰۰، شارژ سریع ۲۲.۵ وات و دو پورت خروجی." },
    { id: 8, name: "شارژر دیواری سریع ۳۰ وات Type-C", category: "پاوربانک و شارژر", image: "cat-accessory", icon: "🔌", priceValue: 780000, oldPrice: 950000, amazing: false, desc: "آداپتور شارژ سریع ۳۰ وات با پورت USB-C و محافظ در برابر نوسان." },
    { id: 9, name: "کابل شارژ سریع Type-C بافته‌شده", category: "پاوربانک و شارژر", image: "cat-accessory", icon: "🔌", priceValue: 350000, oldPrice: 500000, amazing: true, desc: "کابل ۱ متری با پوشش نایلونی بافته، مقاوم در برابر پارگی و انتقال داده." },
    { id: 10, name: "پد شارژ وایرلس ۱۵ وات", category: "پاوربانک و شارژر", image: "powerbank", icon: "🔋", priceValue: 1250000, oldPrice: 1500000, amazing: false, desc: "شارژر بی‌سیم با توان ۱۵ وات، سازگار با Qi و نشانگر LED وضعیت." },
    { id: 11, name: "کیس سیلیکونی ضدضربه موبایل", category: "کیس و محافظ", image: "cat-accessory", icon: "🛡️", priceValue: 420000, oldPrice: 600000, amazing: false, desc: "قاب سیلیکونی مات با لبه‌های بلند، محافظت در برابر ضربه و خط‌وخش." },
    { id: 12, name: "گلس محافظ صفحه نانو ۹H", category: "کیس و محافظ", image: "cat-accessory", icon: "🛡️", priceValue: 280000, oldPrice: 400000, amazing: true, desc: "محافظ صفحه شیشه‌ای با سختی ۹H، پوشش اولفوبیفیچ و نصب بدون حباب." },
    { id: 13, name: "هولدر مگنتی موبایل خودرو", category: "هولدر و پایه", image: "cat-mobile", icon: "🧲", priceValue: 650000, oldPrice: 820000, amazing: false, desc: "پایه مغناطیسی داشبورد با چرخش ۳۶۰ درجه و نگه‌دارنده قوی برای موبایل." },
    { id: 14, name: "پایه نگهدارنده موبایل رومیزی", category: "هولدر و پایه", image: "cat-mobile", icon: "📱", priceValue: 380000, oldPrice: 520000, amazing: false, desc: "استند آلومینیومی قابل تنظیم برای میز، مخصوص تماشای ویدیو و کلاس آنلاین." },
  ];

  /* ---------- مطالب وبلاگ (پیش‌فرض) ---------- */

  const DEFAULT_POSTS = [
    {
      id: 1,
      title: "چرا وبسایت واکنش‌گرا ضروری است؟",
      date: "۱۴ تیر ۱۴۰۵",
      image: "blog-responsive",
      excerpt: "با افزایش کاربران موبایل، طراحی واکنش‌گرا به استانداردی غیرقابل‌حذف تبدیل شده است.",
      body: [
        "در سال‌های اخیر سهم بازدیدکنندگان موبایل از کل ترافیک وب از دسکتاپ پیشی گرفته است. به همین دلیل سایتی که فقط در نمایشگر بزرگ خوب به نظر برسد، بخش بزرگی از مخاطبان خود را از دست می‌دهد.",
        "طراحی واکنش‌گرا یعنی چیدمان، اندازه فونت و فاصله‌گذاری با اندازه صفحه سازگار شود؛ بدون نیاز به ساخت نسخه جداگانه برای موبایل یا تبلت.",
        "رویکرد موبایل‌اول پایه طراحی واکنش‌گراست: ابتدا برای نمایشگر کوچک طراحی می‌کنیم و سپس با کوئری‌های رسانه‌ای صفحه را برای نمایشگر بزرگ‌تر توسعه می‌دهیم.",
        "ابزارهایی مانند Grid و Flexbox و واحدهای نسبی مثل rem و vw کار را ساده‌تر کرده‌اند و نیاز به محاسبات پیکسلی پیچیده را از بین برده‌اند.",
        "نتیجه نهایی تجربه‌ای یکپارچه است که نرخ بازگشت را کاهش و احتمال تبدیل بازدیدکننده به مشتری را افزایش می‌دهد.",
      ],
    },
    {
      id: 2,
      title: "اصول یک رابط کاربری تمیز",
      date: "۱۰ تیر ۱۴۰۵",
      image: "blog-clean-ui",
      excerpt: "سادگی، تضاد رنگ مناسب و فاصله‌گذاری درست کلید تجربه کاربری خوب هستند.",
      body: [
        "یک رابط تمیز لزوماً خالی نیست؛ فقط آن چیزی را نشان می‌دهد که کاربر در لحظه به آن نیاز دارد. حذف عناصر اضافی تمرکز را بالا می‌برد.",
        "تضاد رنگ کافی بین متن و زمینه خوانایی را تضمین می‌کند و فاصله‌گذاری متوازن باعث می‌شود صفحه خسته‌کننده به نظر نرسد.",
        "سلسله‌مراتب بصری به کاربر می‌گوید ابتدا به کجا نگاه کند: عنوان‌های بزرگ‌تر، دکمه‌های رنگی و کارت‌های برجسته همگی در این هدایت نقش دارند.",
        "ثبات بصری در دکمه‌ها، فاصله‌ها و تایپوگرافی اعتماد کاربر را جلب می‌کند. وقتی همه‌چیز سر جای عادت‌کرده خود باشد، کاربر با اطمینان بیشتری عمل می‌کند.",
        "بهترین راه سنجش یک رابط تمیز این است که از کاربر تازه‌وارد بخواهید بدون راهنمایی یک کار مشخص را انجام دهد؛ اگر مسیر روشن بود، طراحی موفق بوده است.",
      ],
    },
    {
      id: 3,
      title: "داستان شکل‌گیری آریا استور",
      date: "۵ تیر ۱۴۰۵",
      image: "blog-story",
      excerpt: "از یک ایده ساده تا فروشگاهی که به صدها کسب‌وکار ایرانی خدمت می‌کند.",
      body: [
        "آریا استور با یک ایده ساده متولد شد: خرید محصولات دیجیتال باید به سادگی خرید یک کتاب باشد.",
        "امروز بیش از ۵۰۰ فروشگاه و کسب‌وکار ایرانی با قالب‌ها، پنل‌ها و بات‌های ما کار می‌کنند.",
        "تم محصولات ما نشان‌دهنده هویت ماست: رز لوکس، شیک و متفاوت — همان چیزی که در همین سایت می‌بینید.",
        "هر محصول قبل از انتشار چند هفته روی پروژه‌های واقعی تست می‌شود تا از کیفیت آن مطمئن شویم.",
        "اگر تازه شروع کرده‌اید، بخش محصولات را ببینید؛ ما از نصب تا توسعه کنار شما هستیم.",
      ],
    },
    {
      id: 4,
      title: "تفاوت تم روشن و تاریک",
      date: "۱ تیر ۱۴۰۵",
      image: "blog-theme",
      excerpt: "تم تاریک فشار نوری کمتری دارد و در محیط‌های کم‌نور راحت‌تر است.",
      body: [
        "تم روشن برای محیط‌های پرنور و مطالعه طولانی متن مناسب‌تر است، در حالی که تم تاریک در شب چشم را کمتر خسته می‌کند.",
        "در دستگاه‌های نمایشگر OLED تم تاریک مصرف انرژی را هم کاهش می‌دهد، زیرا پیکسل‌های سیاه کاملاً خاموش می‌شوند.",
        "در طراحی تم تاریک، انتخاب خاکستری تیره به جای سیاه مطلق و متن خاکستری روشن به جای سفید کامل، خوانایی را بهتر می‌کند.",
        "نکته مهم دیگر تضاد کافی بین لایه‌هاست: کارت‌ها، دکمه‌ها و نوارها باید به اندازه‌ای از زمینه متمایز باشند که ساختار صفحه فوراً درک شود.",
        "بهترین رویکرد ارائه هر دو گزینه و ذخیره انتخاب کاربر است تا در بازدید بعدی همان حالت اعمال شود.",
      ],
    },
    {
      id: 5,
      title: "بهینه‌سازی سرعت بارگذاری",
      date: "۲۸ خرداد ۱۴۰۵",
      image: "blog-speed",
      excerpt: "فشرده‌سازی تصاویر، بارگذاری تنبل و کاهش کد اضافه بر نرخ تبدیل اثر می‌گذارند.",
      body: [
        "سرعت بارگذاری یکی از مهم‌ترین عوامل رتبه‌بندی در موتورهای جستجو و همچنین رضایت کاربر است. هر ثانیه تأخیر می‌تواند درصد قابل توجهی از بازدیدکنندگان را دور کند.",
        "تصاویر را با فرمت‌های مدرن مانند WebP فشرده کنید، از بارگذاری تنبل برای محتوای پایین صفحه استفاده کنید و کدهای CSS و JS را کوچک‌سازی کنید.",
        "زمان پاسخ سرور را با بهینه‌سازی سمت سرور، استفاده از کش و پایگاه‌داده سریع بهبود بخشید.",
        "استفاده از حافظه نهان مرورگر و شبکه توزیع محتوا تفاوت چشمگیری در سرعت ایجاد می‌کند، به‌ویژه برای کاربران دور از مرکز سرور.",
        "پایش مداوم با ابزارهایی مانند Lighthouse نشان می‌دهد کدام بخش صفحه بیشترین زمان را می‌گیرد و از کجا باید شروع کرد.",
      ],
    },
    {
      id: 6,
      title: "چطور یک فرم خوب بسازیم؟",
      date: "۲۴ خرداد ۱۴۰۵",
      image: "blog-form",
      excerpt: "برچسب‌های واضح، پیام خطای دقیق و دکمه‌های بزرگ، یک فرم کاربرپسند می‌سازند.",
      body: [
        "فرم‌ها پل ارتباطی شما با کاربر هستند. برچسب‌های واضح و جای‌گذاری منطقی فیلدها باعث می‌شود کاربر سردرگم نشود.",
        "پیام‌های خطا باید دقیق، مؤدبانه و در محل مناسب نمایش داده شوند؛ به جای «خطا!» بنویسید «ایمیل واردشده معتبر نیست».",
        "دکمه ارسال باید به اندازه‌ای بزرگ باشد که راحت لمس شود و هنگام ارسال وضعیت بارگذاری را نشان دهد تا کاربر دوباره کلیک نکند.",
        "کاهش تعداد فیلدهای اجباری، افزودن نشانگر پیشرفت و پر کردن خودکار موارد شناخته‌شده، نرخ تکمیل فرم را بالا می‌برد.",
        "در نهایت تست فرم با کاربران واقعی و بررسی آن روی موبایل، ضعف‌هایی را آشکار می‌کند که در دسکتاپ هرگز دیده نمی‌شوند.",
      ],
    },
  ];

  /* ---------- نرمال‌سازی ---------- */

  /* قیمت‌ها ممکن است رشته با ارقام فارسی/عربی، ویرگول یا «تومان» باشند */
  function parsePrice(v) {
    if (typeof v === "number" && isFinite(v)) return Math.max(0, Math.round(v));
    if (typeof v !== "string") return 0;
    const digits = v
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[^\d]/g, "");
    return digits ? parseInt(digits, 10) : 0;
  }

  /* رکوردهای قدیمی/فروشنده ممکن است title و price داشته باشند.
     همه را به یک شکل واحد تبدیل می‌کنیم. */
  function normalizeProduct(p, index) {
    if (!p || typeof p !== "object") return null;
    const name = p.name || p.title;
    if (!name) return null;

    const priceValue = parsePrice(
      p.priceValue != null ? p.priceValue : p.price
    );

    /* تخفیف: یا oldPrice مستقیم، یا درصد تخفیف در off/discount */
    let oldPrice = parsePrice(p.oldPrice);
    if (!oldPrice) {
      const off = parsePrice(p.off != null ? p.off : p.discount);
      if (off > 0 && off < 100 && priceValue > 0) {
        oldPrice = Math.round(priceValue / (1 - off / 100));
      }
    }
    if (oldPrice <= priceValue) oldPrice = 0;

    let image = p.image || "";
    const icon = typeof p.icon === "string" ? p.icon : "📦";
    /* آیکون‌های SVG قدیمی (متن خام) به تصویر قابل نمایش تبدیل می‌شوند */
    const iconIsMarkup = icon.trim().startsWith("<");
    if (!image && iconIsMarkup) image = "";
    /* نام فایل تصویر یا مسیر کامل — همیشه به کلید نسبی تبدیل می‌شود */
    image = image ? String(image).split(/[\\/]/).pop().replace(/\.(svg|png|jpe?g|webp|gif)$/i, "") : "";

    return {
      id: p.id != null ? p.id : "p" + index,
      name,
      category: p.category || "عمومی",
      image,
      icon: iconIsMarkup ? "📦" : icon,
      priceValue,
      oldPrice,
      amazing: !!p.amazing,
      desc: p.desc || "",
      seller: p.seller || "",
    };
  }

  function normalizePost(p, index) {
    if (!p || typeof p !== "object") return null;
    const title = p.title || p.name;
    if (!title) return null;
    const body = Array.isArray(p.body)
      ? p.body.filter(Boolean)
      : p.body
      ? [String(p.body)]
      : p.text
      ? [String(p.text)]
      : [];
    return {
      id: p.id != null ? p.id : "post" + index,
      title,
      date: p.date || faDate(Date.now()),
      image: p.image || "",
      excerpt: p.excerpt || p.text || (body[0] || ""),
      body,
    };
  }

  /* ---------- محصولات ---------- */

  const PRODUCTS_KEY = "products_v2";

  /* تصویر ذخیره‌شده یک «کلید» است؛ هنگام نمایش به مسیر کامل تبدیل می‌شود */
  function withImage(item) {
    return Object.assign({}, item, { image: resolveImage(item.image) });
  }

  function getProducts() {
    const stored = read(PRODUCTS_KEY, null);
    if (!Array.isArray(stored) || stored.length === 0) {
      write(PRODUCTS_KEY, DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS.map(withImage);
    }
    const valid = stored.map(normalizeProduct).filter(Boolean);
    if (valid.length === 0) {
      write(PRODUCTS_KEY, DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS.map(withImage);
    }
    return valid.map(withImage);
  }

  function saveProducts(products) {
    write(PRODUCTS_KEY, products.map(normalizeProduct).filter(Boolean));
  }

  function getProduct(id) {
    return getProducts().find((p) => String(p.id) === String(id)) || null;
  }

  function getCategories() {
    const fromCatalog = getProducts().map((p) => p.category);
    const all = CATEGORIES.concat(fromCatalog);
    return all.filter((c, i) => c && all.indexOf(c) === i);
  }

  function offPercent(p) {
    if (!p || !p.oldPrice || p.oldPrice <= p.priceValue) return 0;
    return Math.round(((p.oldPrice - p.priceValue) / p.oldPrice) * 100);
  }

  /* ---------- وبلاگ ---------- */

  const POSTS_KEY = "posts";
  const BLOGS_KEY = "blogs";

  /* هم مطلب پیش‌فرض، هم مطلب نوشته‌شده در پنل فروشنده،
     در یک لیست واحد ادغام می‌شوند تا صفحه وبلاگ هر دو را نشان دهد. */
  function getPosts() {
    const own = read(POSTS_KEY, null);
    const seller = read(BLOGS_KEY, null);

    let list = [];
    if (Array.isArray(own) && own.length) {
      list = own;
    } else if (Array.isArray(seller) && seller.length) {
      list = seller;
    } else {
      write(POSTS_KEY, DEFAULT_POSTS);
      return DEFAULT_POSTS.map(withImage);
    }

    if (Array.isArray(seller) && seller.length) {
      const seen = new Set(list.map((p) => String(p && p.id)));
      seller.forEach((p) => {
        if (p && !seen.has(String(p.id))) list = list.concat([p]);
      });
    }

    const valid = list.map(normalizePost).filter(Boolean);
    return (valid.length ? valid : DEFAULT_POSTS.slice()).map(withImage);
  }

  function savePosts(posts) {
    write(POSTS_KEY, posts.map(normalizePost).filter(Boolean));
  }

  function getPost(id) {
    return getPosts().find((p) => String(p.id) === String(id)) || null;
  }

  /* ---------- سبد خرید ---------- */

  const CART_KEY = "cart";

  /* سبد همیشه یک عکس فوری از محصول را نگه می‌دارد
     (نام، قیمت، تصویر) تا اگر محصول از کاتالوگ حذف شد،
     سبد و مبلغ کل خراب نشوند. */
  function getCart() {
    const raw = read(CART_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (!item || item.id == null) return null;
        const product = getProduct(item.id);
        const qty = Math.max(1, parseInt(item.qty, 10) || 1);
        const name = item.name || (product && product.name) || "محصول حذف‌شده";
        const priceValue =
          typeof item.priceValue === "number"
            ? item.priceValue
            : product
            ? product.priceValue
            : 0;
        const image = item.image || (product && product.image) || "";
        const icon = item.icon || (product && product.icon) || "📦";
        return { id: item.id, qty, name, priceValue, image, icon };
      })
      .filter(Boolean);
  }

  function saveCart(cart) {
    write(CART_KEY, cart);
  }

  function addToCart(id, qty) {
    const product = getProduct(id);
    if (!product) return false;
    const cart = getCart();
    const amount = Math.max(1, parseInt(qty, 10) || 1);
    const existing = cart.find((item) => String(item.id) === String(id));
    if (existing) {
      existing.qty += amount;
    } else {
      cart.push({
        id: product.id,
        qty: amount,
        name: product.name,
        priceValue: product.priceValue,
        image: product.image,
        icon: product.icon,
      });
    }
    saveCart(cart);
    updateCartCount();
    return true;
  }

  function setCartQty(id, qty) {
    let cart = getCart();
    const item = cart.find((i) => String(i.id) === String(id));
    if (!item) return;
    item.qty = qty;
    if (item.qty <= 0) cart = cart.filter((i) => String(i.id) !== String(id));
    saveCart(cart);
    updateCartCount();
  }

  function removeFromCart(id) {
    saveCart(getCart().filter((i) => String(i.id) !== String(id)));
    updateCartCount();
  }

  function clearCart() {
    saveCart([]);
    updateCartCount();
  }

  function cartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function cartTotal() {
    return getCart().reduce((sum, item) => sum + item.priceValue * item.qty, 0);
  }

  /* نشانگر تعداد روی سبد؛ برای هر صفحه‌ای که id="cartCount" داشته باشد */
  let lastCartCount = -1;
  function updateCartCount() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    const count = cartCount();
    badge.textContent = toFa(count);
    badge.classList.toggle("hidden", count === 0);
    if (lastCartCount > -1 && count > lastCartCount) {
      badge.classList.remove("bump");
      void badge.offsetWidth;
      badge.classList.add("bump");
    }
    lastCartCount = count;
  }

  /* ---------- علاقه‌مندی‌ها ---------- */

  const WISHLIST_KEY = "wishlist";

  function currentUser() {
    return read("currentUser", null);
  }

  function userKey() {
    const u = currentUser();
    return u && u.email ? u.email : "guest";
  }

  function getWishlist() {
    const raw = read(WISHLIST_KEY, []);
    return Array.isArray(raw) ? raw : [];
  }

  function saveWishlist(list) {
    write(WISHLIST_KEY, list);
  }

  function isWished(type, itemId) {
    return getWishlist().some(
      (w) =>
        w &&
        w.type === type &&
        String(w.itemId) === String(itemId) &&
        w.userEmail === userKey()
    );
  }

  function toggleWishlist(type, itemId) {
    const list = getWishlist();
    const index = list.findIndex(
      (w) =>
        w &&
        w.type === type &&
        String(w.itemId) === String(itemId) &&
        w.userEmail === userKey()
    );
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push({
        userEmail: userKey(),
        type,
        itemId,
        date: faDate(Date.now()),
      });
    }
    saveWishlist(list);
    return index === -1;
  }

  /* ---------- سفارش‌ها ---------- */

  const ORDERS_KEY = "orders";

  function getOrders() {
    const raw = read(ORDERS_KEY, []);
    return Array.isArray(raw) ? raw : [];
  }

  function saveOrders(orders) {
    write(ORDERS_KEY, orders);
  }

  function createOrder(discountRate) {
    const cart = getCart();
    if (cart.length === 0) return null;
    const rate = Number(discountRate) || 0;
    const total = cart.reduce((sum, item) => sum + item.priceValue * item.qty, 0);
    const payable = Math.round(total * (1 - rate));
    const user = currentUser();
    const order = {
      id: "ORD" + Date.now().toString(36).toUpperCase(),
      userEmail: user ? user.email : "guest",
      userName: user ? user.name : "مهمان",
      date: faDate(Date.now()),
      total,
      payable,
      discount: total - payable,
      status: "paid",
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        priceValue: item.priceValue,
        qty: item.qty,
      })),
    };
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
    clearCart();
    return order;
  }

  /* ---------- کاربران ---------- */

  function getUsers() {
    const raw = read("users", []);
    return Array.isArray(raw) ? raw : [];
  }

  function saveUsers(users) {
    write("users", users);
  }

  function dashboardPath(role) {
    const map = {
      super_admin: BASE + "super_admin/dashboard.html",
      admin: BASE + "admin/dashboard.html",
      seller: BASE + "seller/dashboard.html",
      user: BASE + "user/dashboard.html",
    };
    return map[role] || BASE + "index.html";
  }

  /* ---------- پیام کوتاه (توست) ---------- */

  function toast(message, type) {
    let el = document.getElementById("appToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "appToast";
      el.className = "app-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.remove("show", "error", "success");
    el.classList.add(type === "error" ? "error" : "success");
    void el.offsetWidth;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* ---------- آیکون دسته‌بندی (SVG درون‌خطی؛ رنگ با currentColor) ---------- */
  const CAT_ICONS = {
    audio:  '<svg class="hp-tab-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
    watch:  '<svg class="hp-tab-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1"/><path d="M9 3.5 9.5 6M15 3.5 14.5 6M9 20.5 9.5 18M15 20.5 14.5 18"/></svg>',
    power:  '<svg class="hp-tab-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="8" width="17" height="9" rx="2"/><path d="M22 11v3"/><path d="M11 10l-2 3h3l-2 3"/></svg>',
    shield: '<svg class="hp-tab-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg>',
    holder: '<svg class="hp-tab-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="14" rx="2"/><path d="M12 17v4M8 21h8"/></svg>',
    grid:   '<svg class="hp-tab-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    box:    '<svg class="hp-tab-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  };
  function catIcon(name) {
    const n = String(name || "");
    if (n === "همه") return CAT_ICONS.grid;
    if (/هدفون|صدا|اسپیکر|ایرباد|نوازنده|audio/i.test(n)) return CAT_ICONS.audio;
    if (/ساعت|پوشیدنی|بند|watch/i.test(n)) return CAT_ICONS.watch;
    if (/پاوربانک|شارژر|کابل|باتری|برق|پورت|power|charg/i.test(n)) return CAT_ICONS.power;
    if (/کیس|محافظ|گلس|قاب|cover|shield|case/i.test(n)) return CAT_ICONS.shield;
    if (/هولدر|پایه|استند|نگهدار|mount|holder|stand/i.test(n)) return CAT_ICONS.holder;
    if (/موبایل|تبلت|گوشی|phone|tablet/i.test(n)) return CAT_ICONS.holder;
    return CAT_ICONS.box;
  }

  window.Store = {
    BASE,
    img,
    toFa,
    faNum,
    faPrice,
    faDate,
    esc,
    CATEGORIES,
    DEFAULT_PRODUCTS,
    DEFAULT_POSTS,
    getProducts,
    saveProducts,
    resolveImage,
    getProduct,
    getCategories,
    offPercent,
    getPosts,
    savePosts,
    getPost,
    getCart,
    saveCart,
    addToCart,
    setCartQty,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    updateCartCount,
    currentUser,
    userKey,
    getWishlist,
    saveWishlist,
    isWished,
    toggleWishlist,
    getOrders,
    saveOrders,
    createOrder,
    getUsers,
    saveUsers,
    dashboardPath,
    toast,
    catIcon,
  };
})();
