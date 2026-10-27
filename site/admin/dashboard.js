/* ============================================================
   داشبورد مشترک (کاربر / فروشنده / ادمین / سوپر ادمین)
   همین فایل در هر چهار پوشه کپی می‌شود و هر بخش را
   فقط در صورتی اجرا می‌کند که عنصرش در صفحه وجود داشته باشد.
   ============================================================ */
(function () {
  "use strict";

  const S = window.Store;

  const USER_SVG =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const FILE_SVG =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const BOX_SVG = "📦";

  /* ---------- احراز هویت و کنترل دسترسی ---------- */

  const user = S.currentUser();
  if (!user) {
    window.location.replace(S.BASE + "login/login.html");
    return;
  }

  const path = window.location.pathname.replace(/\\/g, "/");
  const REQUIRED = [
    { part: "/super_admin/", roles: ["super_admin"] },
    { part: "/admin/", roles: ["admin", "super_admin"] },
    { part: "/seller/", roles: ["seller", "admin", "super_admin"] },
    { part: "/user/", roles: ["user", "seller", "admin", "super_admin"] },
  ].find((r) => path.indexOf(r.part) > -1);

  if (REQUIRED && REQUIRED.roles.indexOf(user.role) === -1) {
    window.location.replace(S.BASE + "index.html");
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.replace(S.BASE + "index.html");
    });
  }

  /* ---------- تب‌ها ---------- */

  function switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.toggle("active", content.id === tabId);
    });
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  /* ---------- داده‌های نمونه ---------- */

  if (!localStorage.getItem("comments")) {
    localStorage.setItem(
      "comments",
      JSON.stringify([
        { id: "c1", name: "علی", text: "طراحی سایت خیلی خوب است.", date: "۱۴۰۵/۰۶/۱۰" },
        { id: "c2", name: "مریم", text: "پشتیبانی سریع و حرفه‌ای.", date: "۱۴۰۵/۰۶/۰۸" },
      ])
    );
  }
  if (!localStorage.getItem("tickets")) {
    localStorage.setItem(
      "tickets",
      JSON.stringify([
        { id: "t1", subject: "مشکل در پرداخت", status: "open", priority: "high" },
        { id: "t2", subject: "درخواست بازگشت وجه", status: "closed", priority: "medium" },
      ])
    );
  }

  const comments = () => JSON.parse(localStorage.getItem("comments") || "[]");
  const tickets = () => JSON.parse(localStorage.getItem("tickets") || "[]");
  const uploads = () => {
    const raw = JSON.parse(localStorage.getItem("sellerUploads") || "[]");
    return Array.isArray(raw) ? raw : [];
  };
  const saveUploads = (list) => localStorage.setItem("sellerUploads", JSON.stringify(list));

  function emptyState(listEl, emptyEl) {
    if (emptyEl) emptyEl.hidden = listEl.children.length > 0;
  }

  /* ---------- پروفایل کاربر ---------- */

  const userNameEl = document.getElementById("userName");
  if (userNameEl) {
    userNameEl.textContent = user.name || "کاربر";
    const emailEl = document.getElementById("userEmail");
    if (emailEl) emailEl.textContent = user.email || "";
  }

  /* ---------- سفارش‌ها ---------- */

  function orderRow(order) {
    const paid = order.status === "paid";
    const count = Array.isArray(order.items)
      ? order.items.reduce((sum, i) => sum + (i.qty || 1), 0)
      : 0;
    const items = Array.isArray(order.items)
      ? order.items.map((i) => `${S.esc(i.name)} × ${S.toFa(i.qty || 1)}`).join(" ، ")
      : "";
    return `
      <div class="order-item">
        <div>
          <div class="order-title">سفارش ${S.esc(order.id)}</div>
          <div class="order-meta">${S.esc(order.date || "")} — ${S.faPrice(
      order.payable || order.total || 0
    )}${count ? ` — ${S.toFa(count)} کالا` : ""}</div>
          ${items ? `<div class="order-meta">${items}</div>` : ""}
        </div>
        <span class="status-badge ${paid ? "success" : "warning"}">${
      paid ? "پرداخت شده" : "در انتظار"
    }</span>
      </div>`;
  }

  function renderOrders(listEl, emptyEl, filter) {
    const orders = S.getOrders().filter(filter || (() => true));
    listEl.innerHTML = orders.map(orderRow).join("");
    emptyState(listEl, emptyEl);
  }

  const ordersList = document.getElementById("ordersList");
  if (ordersList) {
    renderOrders(
      ordersList,
      document.getElementById("noOrders"),
      (o) => o.userEmail === user.email
    );
  }

  const sellerOrders = document.getElementById("sellerOrders");
  if (sellerOrders) renderOrders(sellerOrders, document.getElementById("noSellerOrders"));

  /* ---------- علاقه‌مندی‌ها ---------- */

  const wishlistProducts = document.getElementById("wishlistProducts");
  if (wishlistProducts) {
    const wished = S.getWishlist().filter(
      (w) => w && w.type === "product" && w.userEmail === user.email
    );
    const items = wished
      .map((w) => S.getProduct(w.itemId))
      .filter(Boolean);
    wishlistProducts.innerHTML = items
      .map((p) => {
        const media = p.image
          ? `<img class="wish-img" src="${p.image}" alt="${S.esc(p.name)}" loading="lazy">`
          : `<span aria-hidden="true">${p.icon}</span>`;
        return `
        <div class="wishlist-item">
          <div class="wish-head">${media}</div>
          <div class="order-title">${S.esc(p.name)}</div>
          <div class="order-meta">${S.faPrice(p.priceValue)}</div>
          <div class="wish-actions">
            <a href="${S.BASE}products/products.html" class="hero-btn secondary">مشاهده</a>
            <button type="button" class="remove-wish" data-id="${S.esc(p.id)}">حذف</button>
          </div>
        </div>`;
      })
      .join("");
    emptyState(wishlistProducts, document.getElementById("noProductWish"));

    wishlistProducts.querySelectorAll(".remove-wish").forEach((btn) => {
      btn.addEventListener("click", () => {
        S.toggleWishlist("product", btn.dataset.id);
        window.location.reload();
      });
    });
  }

  const wishlistBlogs = document.getElementById("wishlistBlogs");
  if (wishlistBlogs) {
    const wished = S.getWishlist().filter(
      (w) => w && w.type === "blog" && w.userEmail === user.email
    );
    const items = wished.map((w) => S.getPost(w.itemId)).filter(Boolean);
    wishlistBlogs.innerHTML = items
      .map((post) => {
        const media = post.image
          ? `<img class="wish-img" src="${post.image}" alt="${S.esc(post.title)}" loading="lazy">`
          : `<span aria-hidden="true">📝</span>`;
        return `
        <div class="wishlist-item">
          <div class="wish-head">${media}</div>
          <div class="order-title">${S.esc(post.title)}</div>
          <div class="order-meta">${S.esc(post.excerpt)}</div>
          <div class="order-meta">${S.esc(post.date)}</div>
          <div class="wish-actions">
            <a href="${S.BASE}blog/post.html?id=${encodeURIComponent(post.id)}" class="hero-btn secondary">مشاهده</a>
            <button type="button" class="remove-wish" data-id="${S.esc(post.id)}">حذف</button>
          </div>
        </div>`;
      })
      .join("");
    emptyState(wishlistBlogs, document.getElementById("noBlogWish"));

    wishlistBlogs.querySelectorAll(".remove-wish").forEach((btn) => {
      btn.addEventListener("click", () => {
        S.toggleWishlist("blog", btn.dataset.id);
        window.location.reload();
      });
    });
  }

  /* ---------- سبد خرید در داشبورد ---------- */

  const dashCartList = document.getElementById("dashCartList");
  if (dashCartList) {
    const cart = S.getCart();
    const summary = document.getElementById("dashCartSummary");
    const totalEl = document.getElementById("dashCartTotal");
    dashCartList.innerHTML = cart
      .map((item) => {
        const media = item.image
          ? `<img class="wish-img" src="${item.image}" alt="${S.esc(item.name)}" loading="lazy">`
          : `<span aria-hidden="true">${item.icon}</span>`;
        return `
        <div class="dash-cart-item">
          <div class="wish-head">${media}</div>
          <div>
            <div class="order-title">${S.esc(item.name)}</div>
            <div class="order-meta">${S.faPrice(item.priceValue)} × ${S.toFa(item.qty)}</div>
          </div>
        </div>`;
      })
      .join("");
    if (summary) summary.classList.toggle("hidden", cart.length === 0);
    if (totalEl) totalEl.textContent = S.faPrice(S.cartTotal());
    emptyState(dashCartList, document.getElementById("noCartItems"));
  }

  /* ---------- مدیریت محصولات (فروشنده) ---------- */

  const sellerProducts = document.getElementById("sellerProducts");
  if (sellerProducts) {
    const list = S.getProducts();
    sellerProducts.innerHTML = list
      .map((p) => {
        const media = p.image
          ? `<img class="order-thumb" src="${p.image}" alt="${S.esc(p.name)}" loading="lazy">`
          : `<span aria-hidden="true">${p.icon}</span>`;
        return `
        <div class="order-item">
          <div class="order-row">
            ${media}
            <div>
              <div class="order-title">${S.esc(p.name)}</div>
              <div class="order-meta">${S.faPrice(p.priceValue)} — ${S.esc(p.category)}</div>
              ${p.desc ? `<div class="order-meta">${S.esc(p.desc)}</div>` : ""}
            </div>
          </div>
          <button type="button" class="remove-btn" data-id="${S.esc(p.id)}">حذف</button>
        </div>`;
      })
      .join("");
    emptyState(sellerProducts, document.getElementById("noSellerProducts"));

    sellerProducts.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        S.saveProducts(
          S.getProducts().filter((p) => String(p.id) !== String(btn.dataset.id))
        );
        window.location.reload();
      });
    });

    const approvalMsg = document.getElementById("sellerApprovalMsg");
    const myUploads = uploads().filter((u) => u.sellerEmail === user.email);
    if (approvalMsg) {
      approvalMsg.style.display = myUploads.some((u) => u.status === "approved")
        ? "none"
        : "block";
    }
  }

  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleEl = document.getElementById("productTitle");
      const priceEl = document.getElementById("productPrice");
      const catEl = document.getElementById("productCategory");
      const descEl = document.getElementById("productDesc");
      const imageEl = document.getElementById("productImage");

      const name = titleEl.value.trim();
      const priceValue = parseInt(priceEl.value.replace(/[^\d]/g, ""), 10);
      if (!name || !priceValue) {
        S.toast("نام و قیمت محصول را درست وارد کنید.", "error");
        return;
      }

      let image = "";
      if (imageEl.files && imageEl.files[0]) {
        image = await toBase64(imageEl.files[0]);
      }

      const list = S.getProducts();
      list.push({
        id: "s" + Date.now().toString(36),
        name,
        category: catEl.value.trim() || "عمومی",
        image,
        icon: BOX_SVG,
        priceValue,
        oldPrice: 0,
        amazing: false,
        desc: descEl.value.trim(),
        seller: user.email,
      });
      S.saveProducts(list);
      addProductForm.reset();
      S.toast("محصول با موفقیت افزوده شد.");
      setTimeout(() => window.location.reload(), 700);
    });
  }

  /* ---------- مدیریت بلاگ (فروشنده) ---------- */

  const sellerBlogs = document.getElementById("sellerBlogs");
  if (sellerBlogs) {
    const posts = S.getPosts();
    sellerBlogs.innerHTML = posts
      .map(
        (post) => `
        <div class="order-item">
          <div class="order-row">
            ${
              post.image
                ? `<img class="order-thumb" src="${post.image}" alt="${S.esc(
                    post.title
                  )}" loading="lazy">`
                : ""
            }
            <div>
              <div class="order-title">${S.esc(post.title)}</div>
              <div class="order-meta">${S.esc(post.excerpt)}</div>
              <div class="order-meta">${S.esc(post.date)}</div>
            </div>
          </div>
        </div>`
      )
      .join("");
    emptyState(sellerBlogs, document.getElementById("noSellerBlogs"));
  }

  const addBlogForm = document.getElementById("addBlogForm");
  if (addBlogForm) {
    addBlogForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleEl = document.getElementById("blogTitle");
      const excerptEl = document.getElementById("blogExcerpt");
      const contentEl = document.getElementById("blogContent");
      const imageEl = document.getElementById("blogImage");

      const title = titleEl.value.trim();
      const excerpt = excerptEl.value.trim();
      const content = contentEl.value.trim();
      if (!title || !excerpt || !content) {
        S.toast("عنوان، خلاصه و متن بلاگ را کامل کنید.", "error");
        return;
      }

      let image = "";
      if (imageEl.files && imageEl.files[0]) {
        image = await toBase64(imageEl.files[0]);
      }

      const posts = S.getPosts();
      posts.push({
        id: "b" + Date.now().toString(36),
        title,
        excerpt,
        body: [content],
        image,
        date: S.faDate(Date.now()),
      });
      S.savePosts(posts);
      addBlogForm.reset();
      S.toast("بلاگ با موفقیت افزوده شد.");
      setTimeout(() => window.location.reload(), 700);
    });
  }

  /* ---------- آپلود مدارک (فروشنده) ---------- */

  const uploadForm = document.getElementById("uploadForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("uploadFile");
      const file = fileInput.files[0];
      if (!file) return;
      const list = uploads();
      list.push({
        id: "u" + Date.now().toString(36),
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " کیلوبایت",
        fileType: file.type || "نامشخص",
        uploadedAt: S.faDate(Date.now()),
        status: "pending",
        sellerEmail: user.email,
      });
      saveUploads(list);
      uploadForm.reset();
      S.toast("فایل آپلود شد و پس از تایید نمایش داده می‌شود.");
      setTimeout(() => window.location.reload(), 700);
    });
  }

  const sellerUploads = document.getElementById("sellerUploads");
  if (sellerUploads) {
    const list = uploads().filter((u) => u.sellerEmail === user.email);
    sellerUploads.innerHTML = list.map((u) => uploadRow(u, true)).join("");
    emptyState(sellerUploads, document.getElementById("noSellerUploads"));
  }

  function uploadRow(upload, isSeller) {
    const label =
      upload.status === "approved"
        ? "تایید شده"
        : upload.status === "rejected"
        ? "رد شده"
        : "در انتظار تایید";
    const cls =
      upload.status === "approved"
        ? "success"
        : upload.status === "rejected"
        ? "danger"
        : "warning";
    return `
      <div class="order-item">
        <div>
          <div class="order-title">${FILE_SVG} ${S.esc(upload.fileName)}</div>
          <div class="order-meta">${S.esc(upload.fileType)} — ${S.esc(
      upload.fileSize
    )} — ${S.esc(upload.uploadedAt)}</div>
        </div>
        <span class="status-badge ${cls}">${label}</span>
        ${
          !isSeller && upload.status === "pending"
            ? `<div class="upload-actions">
                 <button class="approve-btn" data-id="${S.esc(upload.id)}">تایید</button>
                 <button class="reject-btn" data-id="${S.esc(upload.id)}">رد</button>
               </div>`
            : ""
        }
      </div>`;
  }

  /* ---------- پنل تایید مدارک (سوپر ادمین) ---------- */

  const approvalPanel = document.getElementById("approvalPanel");
  if (approvalPanel) {
    const pending = uploads().filter((u) => u.status === "pending");
    approvalPanel.innerHTML = pending.length
      ? pending.map((u) => uploadRow(u, false)).join("")
      : '<p class="empty-msg">هنوز فایلی برای تایید وجود ندارد.</p>';

    approvalPanel.querySelectorAll(".approve-btn, .reject-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const list = uploads();
        const index = list.findIndex((u) => u.id === btn.dataset.id);
        if (index === -1) return;
        list[index].status = btn.classList.contains("approve-btn") ? "approved" : "rejected";
        saveUploads(list);
        window.location.reload();
      });
    });
  }

  /* ---------- مدیریت نقش‌ها (سوپر ادمین) ---------- */

  const rolesPanel = document.getElementById("rolesPanel");
  if (rolesPanel) {
    const ROLE_LABELS = {
      user: "کاربر عادی",
      seller: "فروشنده",
      admin: "ادمین",
      super_admin: "سوپر ادمین",
    };
    const users = S.getUsers();
    rolesPanel.innerHTML = users
      .map(
        (u) => `
        <div class="order-item">
          <div>
            <div class="order-title">${USER_SVG} ${S.esc(u.name || "")}</div>
            <div class="order-meta">${S.esc(u.email || "")} — نقش فعلی: ${
          ROLE_LABELS[u.role] || u.role || "کاربر عادی"
        }</div>
          </div>
          <select class="role-select" data-email="${S.esc(u.email)}">
            ${Object.keys(ROLE_LABELS)
              .map(
                (role) =>
                  `<option value="${role}" ${
                    u.role === role ? "selected" : ""
                  }>${ROLE_LABELS[role]}</option>`
              )
              .join("")}
          </select>
        </div>`
      )
      .join("");

    rolesPanel.querySelectorAll(".role-select").forEach((select) => {
      select.addEventListener("change", () => {
        const list = S.getUsers();
        const index = list.findIndex((u) => u.email === select.dataset.email);
        if (index === -1) return;
        list[index].role = select.value;
        S.saveUsers(list);
        const current = S.currentUser();
        if (current && current.email === list[index].email) {
          current.role = select.value;
          localStorage.setItem("currentUser", JSON.stringify(current));
        }
        S.toast("نقش کاربر تغییر کرد.");
        setTimeout(() => window.location.reload(), 700);
      });
    });
  }

  /* ---------- مدیریت کاربران (ادمین) ---------- */

  const usersList = document.getElementById("usersList");
  if (usersList) {
    usersList.innerHTML = S.getUsers()
      .map(
        (u) => `
        <div class="order-item">
          <div>
            <div class="order-title">${USER_SVG} ${S.esc(u.name || "")}</div>
            <div class="order-meta">${S.esc(u.email || "")} — ${S.esc(u.role || "")}</div>
          </div>
        </div>`
      )
      .join("");
    emptyState(usersList, document.getElementById("noUsers"));
  }

  const allUsersList = document.getElementById("allUsersList");
  if (allUsersList) {
    allUsersList.innerHTML = S.getUsers()
      .map(
        (u) => `
        <div class="order-item">
          <div>
            <div class="order-title">${USER_SVG} ${S.esc(u.name || "")}</div>
            <div class="order-meta">${S.esc(u.email || "")} — ${S.esc(u.role || "")}</div>
          </div>
        </div>`
      )
      .join("");
    emptyState(allUsersList, document.getElementById("noAllUsers"));
  }

  /* ---------- نظرات و پیام‌ها ---------- */

  const commentsList = document.getElementById("commentsList");
  if (commentsList) {
    commentsList.innerHTML = comments()
      .map(
        (c) => `
        <div class="order-item">
          <div>
            <div class="order-title">💬 ${S.esc(c.name || "")}</div>
            <div class="order-meta">${S.esc(c.text || "")}</div>
          </div>
          <span class="meta">${S.esc(c.date || "")}</span>
        </div>`
      )
      .join("");
    emptyState(commentsList, document.getElementById("noComments"));
  }

  /* ---------- تیکت‌ها ---------- */

  const ticketsList = document.getElementById("ticketsList");
  if (ticketsList) {
    ticketsList.innerHTML = tickets()
      .map(
        (t) => `
        <div class="order-item">
          <div>
            <div class="order-title">🎫 ${S.esc(t.subject || "")}</div>
            <div class="order-meta">اولویت: ${S.esc(t.priority || "")}</div>
          </div>
          <span class="status-badge ${
            t.status === "open" ? "warning" : "success"
          }">${t.status === "open" ? "باز" : "بسته"}</span>
        </div>`
      )
      .join("");
    emptyState(ticketsList, document.getElementById("noTickets"));
  }

  /* ---------- تنظیمات سایت ---------- */

  const siteSettingsForm = document.getElementById("siteSettingsForm");
  if (siteSettingsForm) {
    const settings = JSON.parse(localStorage.getItem("siteSettings") || "null") || {};
    const titleEl = document.getElementById("siteTitle");
    const descEl = document.getElementById("siteDesc");
    if (titleEl) titleEl.value = settings.siteTitle || "";
    if (descEl) descEl.value = settings.description || "";

    siteSettingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem(
        "siteSettings",
        JSON.stringify({
          siteTitle: titleEl.value.trim(),
          description: descEl.value.trim(),
        })
      );
      S.toast("تنظیمات ذخیره شد.");
    });
  }

  /* ---------- کمکی ---------- */

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }

  /* بازکردن تب درخواستی از طریق هش (مثلاً از صفحه وبلاگ) */
  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(hash)) {
    switchTab(hash);
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  document.body.classList.add("dark");
  S.updateCartCount();
})();
