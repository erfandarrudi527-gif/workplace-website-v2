/* ============================================================
   ورود به حساب کاربری
   ============================================================ */
(function () {
  "use strict";

  const S = window.Store;

  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");
  if (!form || !message) return;

  const EYE =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target || "");
      if (!input) return;
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      btn.innerHTML = hidden ? EYE_OFF : EYE;
      btn.setAttribute("aria-label", hidden ? "مخفی کردن رمز عبور" : "نمایش رمز عبور");
    });
  });

  function showMessage(text, type) {
    message.className = "message " + type;
    message.textContent = text;
  }

  function flagError(input) {
    if (!input) return;
    input.classList.add("input-error");
    setTimeout(() => input.classList.remove("input-error"), 1200);
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  [form.email, form.password].forEach((inp) => {
    if (inp) inp.addEventListener("input", () => inp.classList.remove("input-error"));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    message.className = "message";

    if (!email) {
      showMessage("لطفاً ایمیل خود را وارد کنید.", "error");
      flagError(form.email);
      form.email.focus();
      return;
    }
    if (!isValidEmail(email)) {
      showMessage("فرمت ایمیل معتبر نیست.", "error");
      flagError(form.email);
      form.email.focus();
      return;
    }
    if (!password) {
      showMessage("لطفاً رمز عبور را وارد کنید.", "error");
      flagError(form.password);
      form.password.focus();
      return;
    }

    const users = S.getUsers();
    const user = users.find(
      (u) =>
        u.email &&
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      showMessage("ایمیل یا رمز عبور اشتباه است.", "error");
      flagError(form.email);
      flagError(form.password);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const params = new URLSearchParams(window.location.search);

    /* پارامتر promote=1 کاربر را به سوپر ادمین ارتقا می‌دهد
       (برای نمایش پنل سوپر ادمین در این نمونه کار) */
    if (params.get("promote") === "1") {
      const index = users.findIndex((u) => u.email === user.email);
      if (index > -1) {
        users[index].role = "super_admin";
        S.saveUsers(users);
        user.role = "super_admin";
      }
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    showMessage("ورود موفقیت‌آمیز بود. در حال انتقال...", "success");

    /* پارامتر redirect نسبی است و همیشه داخل پوشه سایت می‌ماند */
    const redirect = params.get("redirect");
    let target = S.dashboardPath(user.role);
    if (redirect && !/^[a-z]+:|^\/\//i.test(redirect) && redirect.indexOf("..") === -1) {
      target = S.BASE + redirect.replace(/^\.?\//, "");
    }

    setTimeout(() => window.location.replace(target), 700);
  });
})();
