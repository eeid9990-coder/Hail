const AFTER_LOGIN_PAGE = "main.html";

/* ========= أدوات مساعدة ========= */
function isIndexPage() {
  // صفحة تسجيل الدخول/التسجيل هي index.html
  const path = location.pathname.split("/").pop() || "index.html";
  return path === "" || path === "index.html";
}
function isProtectedPage() {
  // أي صفحة غير index.html تعتبر محمية
  return !isIndexPage();
}

/* ========= حماية الصفحات ========= */
document.addEventListener("DOMContentLoaded", function () {
  if (isProtectedPage() && !localStorage.getItem("loggedIn")) {
    window.location.href = "index.html";
    return;
  }

  // مزامنة الثيم عند التحميل (في كل الصفحات)
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("theme-dark");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("theme-dark");
      document.body.classList.remove("dark-mode");
    }
  } catch (e) {}

  // ربط أزرار/نماذج الدخول فقط إن كانت موجودة (في index.html)
  const tabLoginBtn    = document.getElementById("tab-login");
  const tabRegisterBtn = document.getElementById("tab-register");
  const loginForm      = document.getElementById("loginForm");
  const registerForm   = document.getElementById("registerForm");
  const forgotLink     = document.getElementById("forgotLink");

  if (tabLoginBtn && tabRegisterBtn && loginForm && registerForm) {
    tabLoginBtn.addEventListener("click", function () {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    });
    tabRegisterBtn.addEventListener("click", function () {
      loginForm.style.display = "none";
      registerForm.style.display = "block";
    });
  }

  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      const box = document.getElementById("forgotBox");
      if (box) {
        box.style.display = (box.style.display === "none" || box.style.display === "") ? "block" : "none";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const id   = document.getElementById("loginId").value.trim();
      const pass = document.getElementById("loginPass").value.trim();
      if (!id || !pass) {
        alert("يرجى ملء جميع الحقول");
        return;
      }
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user && user.idNumber === id && user.password === pass) {
        localStorage.setItem("loggedIn", "true");
        // توجيه نظيف
        const params = new URLSearchParams(location.search);
        const go = params.get("redirect") || AFTER_LOGIN_PAGE;
        window.location.replace(go);
      } else {
        alert("بيانات الدخول غير صحيحة");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const fullName        = document.getElementById("fullName").value.trim();
      const birthDate       = document.getElementById("birthDate").value.trim();
      const idNumber        = document.getElementById("idNumber").value.trim();
      const phone           = document.getElementById("phone").value.trim();
      const email           = document.getElementById("email").value.trim();
      const password        = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();

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
      // رجوع لتبويب الدخول
      const loginTab = document.getElementById("tab-login");
      if (loginTab) loginTab.click();
      if (document.getElementById("loginForm")) {
        document.getElementById("loginForm").style.display = "block";
      }
      if (document.getElementById("registerForm")) {
        document.getElementById("registerForm").style.display = "none";
      }
    });
  }
});

/* ========= الوضع الليلي ========= */
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

/* ========= تسجيل الخروج ========= */
function logout() {
  localStorage.removeItem("loggedIn");
  // لا نحذف بيانات user حتى تبقى محفوظة للعرض في الملف الشخصي بالجلسات القادمة
  window.location.replace("index.html");
}

/* ========= تحميل/حفظ الملف الشخصي ========= */
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return;

  const fullNameEl  = document.getElementById("fullName");
  const idNumberEl  = document.getElementById("idNumber");
  const birthDateEl = document.getElementById("birthDate");
  const phoneEl     = document.getElementById("phone");
  const emailEl     = document.getElementById("email");

  if (fullNameEl)  { fullNameEl.value  = user.fullName || ""; fullNameEl.readOnly = true; }
  if (idNumberEl)  { idNumberEl.value  = user.idNumber || ""; idNumberEl.readOnly = true; }
  if (birthDateEl) { birthDateEl.value = user.birthDate || ""; birthDateEl.readOnly = true; }
  if (phoneEl)     phoneEl.value = user.phone || "";
  if (emailEl)     emailEl.value = user.email || "";
}

function saveProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) { alert("لا توجد بيانات محفوظة."); return; }

  const phoneEl = document.getElementById("phone");
  const emailEl = document.getElementById("email");

  user.phone = phoneEl ? phoneEl.value.trim() : user.phone;
  user.email = emailEl ? emailEl.value.trim() : user.email;

  localStorage.setItem("user", JSON.stringify(user));
  alert("تم حفظ التعديلات بنجاح");
}

/* ========= الطلبات ========= */
function submitRequest() {
  const title = document.getElementById("reqTitle")?.value.trim();
  const desc  = document.getElementById("reqDesc")?.value.trim();
  if (!title || !desc) { alert("يرجى تعبئة عنوان الطلب ووصف المشكلة"); return; }

  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  const requestNumber = Date.now().toString().slice(-6); // رقم بسيط

  requests.push({
    requestNumber,
    requestTitle: title,
    requestDesc: desc,
    status: "قيد المعالجة",
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("requests", JSON.stringify(requests));
  alert("✅ تم إرسال الطلب. رقم الطلب: " + requestNumber);
  // بإمكانك إعادة التوجيه:
  // window.location.href = "track.html";
}