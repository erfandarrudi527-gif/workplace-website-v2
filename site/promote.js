/* ============================================================
   ارتقا به سوپر ادمین (ابزار نمونه کار)
   ============================================================ */
(function () {
  "use strict";

  const S = window.Store;
  const promoteBtn = document.getElementById("promoteBtn");
  const promoteMsg = document.getElementById("promoteMsg");
  if (!promoteBtn || !promoteMsg) return;

  function setMessage(text, type) {
    promoteMsg.textContent = text;
    promoteMsg.className = "message " + type;
  }

  promoteBtn.addEventListener("click", () => {
    const user = S.currentUser();

    if (!user) {
      setMessage("لطفاً ابتدا وارد شوید. در حال انتقال به صفحه ورود...", "error");
      setTimeout(() => {
        window.location.replace(
          S.BASE + "login/login.html?promote=1&redirect=" + encodeURIComponent("promote.html")
        );
      }, 900);
      return;
    }

    const users = S.getUsers();
    const index = users.findIndex((u) => u.email === user.email);

    if (index === -1) {
      setMessage("کاربر یافت نشد. لطفاً دوباره وارد شوید.", "error");
      return;
    }

    users[index].role = "super_admin";
    S.saveUsers(users);
    user.role = "super_admin";
    localStorage.setItem("currentUser", JSON.stringify(user));

    setMessage("با موفقیت به سوپر ادمین ارتقا یافتید. در حال انتقال...", "success");
    setTimeout(() => window.location.replace(S.BASE + "super_admin/dashboard.html"), 900);
  });
})();
