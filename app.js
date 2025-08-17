"use strict";

const AFTER_LOGIN_PAGE = "main.html";

/* ========== أدوات مساعدة بسيطة ========== */
function getFileName() {
  const path = location.pathname.split("/").pop();
  return path || "index.html";
}
function isIndexPage() {
  const f = getFileName();
  return f.toLowerCase() === "index.html";
}
function isProtectedPage() {
  return !isIndexPage();
}
function qs(id) {
  return document.getElementById(id);
}

/* ========== حماية الصفحات + مزامنة الثيم ========== */
document.addEventListener("DOMContentLoaded", () => {
  // حماية الصفحات المحمية
  if (isProtectedPage() && !localStorage.getItem("loggedIn")) {
    window.location.replace("index.html");
    return;
  }

  // مزامنة الثيم
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("theme-dark");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("theme-dark");
      document.body.classList.remove("dark-mode");
    }
  } catch (_) {}

  // إذا كنا في index.html وكان المستخدم مسجلاً الدخول بالفعل، ودّه مباشرة للرئيسية
  if (isIndexPage() && localStorage.getItem("loggedIn")) {
    window.location.replace(AFTER_LOGIN_PAGE);
    return;
  }

  /* ========== عناصر صفحة الدخول (index.html) إن وجدت ========== */
  const tabLoginBtn    = qs("tab-login");
  const tabRegisterBtn = qs("tab-register");
  const loginForm      = qs("loginForm");
  const registerForm   = qs("registerForm");
  const forgotLink     = qs("forgotLink");

  if (tabLoginBtn && tabRegisterBtn && loginForm && registerForm) {
    tabLoginBtn.addEventListener("click", () => {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    });
    tabRegisterBtn.addEventListener("click", () => {
      loginForm.style.display = "none";
      registerForm.style.display = "block";
    });
  }

  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      const box = qs("forgotBox");
      if (box) {
        const hidden = box.style.display === "none" || !box.style.display;
        box.style.display = hidden ? "block" : "none";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id   = qs("loginId")?.value.trim();
      const pass = qs("loginPass")?.value.trim();
      if (!id || !pass) {
        alert("يرجى ملء جميع الحقول");
        return;
      }
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        alert("لا توجد بيانات مستخدم مسجلة. الرجاء إنشاء حساب جديد.");
        return;
      }
      if (user.idNumber === id && user.password === pass) {
        localStorage.setItem("loggedIn", "true");
        const params = new URLSearchParams(location.search);
        const go = params.get("redirect") || AFTER_LOGIN_PAGE;
        window.location.replace(go);
      } else {
        alert("بيانات الدخول غير صحيحة");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName        = qs("fullName")?.value.trim();
      const birthDate       = qs("birthDate")?.value.trim();
      const idNumber        = qs("idNumber")?.value.trim();
      const phone           = qs("phone")?.value.trim();
      const email           = qs("email")?.value.trim();
      const password        = qs("password")?.value.trim();
      const confirmPassword = qs("confirmPassword")?.value.trim();

      if (!fullName || !birthDate || !idNumber || !phone || !email || !password || !confirmPassword) {
        alert("يرجى ملء جميع الحقول");
        return;
      }
      if (password !== confirmPassword) {
        alert("كلمة المرور وتأكيدها غير متطابقين");
        return;
      }

      const user = { fullName, birthDate, idNumber, phone, email, password };
      localStorage.setItem("user", JSON.stringify(user));

      alert("✅ تم إنشاء حسابك بنجاح، يمكنك الآن تسجيل الدخول");
      // أظهر تبويب تسجيل الدخول
      if (tabLoginBtn) tabLoginBtn.click();
      if (qs("loginForm")) qs("loginForm").style.display = "block";
      if (qs("registerForm")) qs("registerForm").style.display = "none";
    });
  }

  /* ========== تحميل الملف الشخصي تلقائياً إن وُجدت عناصره ========== */
  if (qs("fullName") || qs("idNumber") || qs("birthDate") || qs("phone") || qs("email")) {
    loadProfile();
  }
});

/* ========== الوضع الليلي ========== */
function toggleDarkMode() {
  const willBeDark = !document.body.classList.contains("dark-mode");
  if (willBeDark) {
    document.documentElement.classList.add("theme-dark");
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("theme-dark");
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
}

/* ========== تسجيل الخروج ========== */
function logout() {
  localStorage.removeItem("loggedIn");
  // لا نحذف user لكي تبقى بياناته تظهر في الملف الشخصي مستقبلاً
  window.location.replace("index.html");
}

/* ========== الملف الشخصي ========== */
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return;

  const fullNameEl  = qs("fullName");
  const idNumberEl  = qs("idNumber");
  const birthDateEl = qs("birthDate");
  const phoneEl     = qs("phone");
  const emailEl     = qs("email");

  if (fullNameEl)  { fullNameEl.value  = user.fullName || "";  fullNameEl.readOnly  = true; fullNameEl.classList.add("readonly"); }
  if (idNumberEl)  { idNumberEl.value  = user.idNumber || "";  idNumberEl.readOnly  = true; idNumberEl.classList.add("readonly"); }
  if (birthDateEl) { birthDateEl.value = user.birthDate || ""; birthDateEl.readOnly = true; birthDateEl.classList.add("readonly"); }
  if (phoneEl)     { phoneEl.value     = user.phone || ""; }
  if (emailEl)     { emailEl.value     = user.email || ""; }
}

function saveProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) { alert("لا توجد بيانات محفوظة."); return; }

  const phoneEl = qs("phone");
  const emailEl = qs("email");

  user.phone = phoneEl ? phoneEl.value.trim() : user.phone;
  user.email = emailEl ? emailEl.value.trim() : user.email;

  localStorage.setItem("user", JSON.stringify(user));
  alert("تم حفظ التعديلات بنجاح");
}

/* ========== الطلبات ========== */
/* توليد رقم طلب تسلسلي (لا يعتمد فقط على Date.now) */
function getNextRequestNumber() {
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  if (!requests.length) return "000001";
  const last = requests[requests.length - 1].requestNumber;
  const next = (parseInt(last, 10) + 1).toString().padStart(6, "0");
  return next;
}

function submitRequest() {
  const title = qs("reqTitle")?.value.trim();
  const desc  = qs("reqDesc")?.value.trim();
  if (!title || !desc) {
    alert("يرجى تعبئة عنوان الطلب ووصف المشكلة");
    return;
  }

  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  const requestNumber = getNextRequestNumber();

  // حقول اختيارية لو أضفتها لاحقاً (نوع، مكان)
  const type  = qs("reqType")?.value?.trim()  || ""; 
  const place = qs("reqPlace")?.value?.trim() || "";

  requests.push({
    requestNumber,
    requestTitle: title,
    requestDesc: desc,
    requestType: type,
    requestPlace: place,
    status: "قيد المعالجة",
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("requests", JSON.stringify(requests));
  alert("✅ تم إرسال الطلب. رقم الطلب: " + requestNumber);

  // تفريغ الحقول بعد الإرسال (اختياري)
  if (qs("reqTitle")) qs("reqTitle").value = "";
  if (qs("reqDesc"))  qs("reqDesc").value  = "";
  if (qs("reqType"))  qs("reqType").value  = "";
  if (qs("reqPlace")) qs("reqPlace").value = "";

  // بإمكانك توجيه المستخدم لمتابعة الطلبات:
  // window.location.href = "track.html";
}

/* اجعل الدوال متاحة عالمياً عند الحاجة من الـ HTML */
window.toggleDarkMode = toggleDarkMode;
window.logout         = logout;
window.loadProfile    = loadProfile;
window.saveProfile    = saveProfile;
window.submitRequest  = submitRequest;
