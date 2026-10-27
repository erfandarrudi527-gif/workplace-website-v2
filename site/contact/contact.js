/* ============================================================
   صفحه تماس با ما
   ============================================================ */
(function () {
  "use strict";

  const S = window.Store;
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");
      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const text = messageInput ? messageInput.value.trim() : "";

      if (!name || !email || !text) {
        if (formMessage) {
          formMessage.hidden = false;
          formMessage.textContent = "لطفاً همه فیلدها را کامل کنید.";
          formMessage.className = "form-message error";
        }
        return;
      }

      /* پیام‌ها ذخیره می‌شوند تا در پنل ادمین دیده شوند */
      let list = [];
      try {
        const stored = JSON.parse(localStorage.getItem("comments") || "[]");
        if (Array.isArray(stored)) list = stored;
      } catch (_) {
        list = [];
      }
      list.push({
        id: "m" + Date.now().toString(36),
        name,
        email,
        text,
        date: S.faDate(Date.now()),
      });
      localStorage.setItem("comments", JSON.stringify(list));

      if (formMessage) {
        formMessage.hidden = false;
        formMessage.textContent = `${name} عزیز، پیام شما با موفقیت ثبت شد!`;
        formMessage.className = "form-message success";
      }
      contactForm.reset();
    });
  }

  document.body.classList.add("dark");
})();
