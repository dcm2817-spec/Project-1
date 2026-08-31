// uniVERSE — app shell
// Swaps content inside #app-view based on the bottom nav, no page reload.

(function () {
  const view = document.getElementById("app-view");
  const navItems = document.querySelectorAll(".nav-item");

  const renderers = {
    feed: renderFeed,
    materials: renderMaterials,
    connect: renderConnect,
    profile: renderProfile,
  };

  function setActive(name) {
    navItems.forEach(function (btn) {
      const isActive = btn.dataset.view === name;
      btn.classList.toggle("is-active", isActive);
      if (isActive) {
        btn.setAttribute("aria-current", "page");
      } else {
        btn.removeAttribute("aria-current");
      }
    });
  }

  function showView(name) {
    const renderer = renderers[name];
    if (!renderer) return;
    view.innerHTML = "";
    view.appendChild(renderer());
    view.scrollTop = 0;
    setActive(name);
  }

  navItems.forEach(function (btn) {
    btn.addEventListener("click", function () {
      showView(btn.dataset.view);
    });
  });

  // ---------- Feed ----------

  function renderFeed() {
    const wrap = document.createElement("div");
    wrap.className = "view-inner";

    const banner = document.createElement("div");
    banner.className = "join-banner";
    banner.textContent = "Join 3,000+ students already on uniVERSE";
    wrap.appendChild(banner);

    SEED_FEED.forEach(function (post) {
      const card = document.createElement("article");
      card.className = "feed-card";
      card.innerHTML =
        '<div class="feed-card-top">' +
          '<span class="feed-tag feed-tag-' + post.type + '">' + labelForType(post.type) + '</span>' +
          '<span class="feed-school">' + post.school + '</span>' +
        '</div>' +
        '<p class="feed-author">' + post.author + ' <span class="feed-time">· ' + post.time + '</span></p>' +
        '<p class="feed-text">' + post.text + '</p>' +
        '<p class="feed-meta">' + post.meta + '</p>' +
        '<div class="feed-actions">' +
          '<span>&#9825; ' + post.likes + '</span>' +
          '<span>&#128172; ' + post.comments + '</span>' +
        '</div>';
      wrap.appendChild(card);
    });

    return wrap;
  }

  function labelForType(type) {
    return {
      material: "New material",
      discussion: "Discussion",
      event: "Event",
      group: "Group",
    }[type] || "Update";
  }

  // ---------- Materials ----------

  function renderMaterials() {
    const wrap = document.createElement("div");
    wrap.className = "view-inner";

    wrap.innerHTML =
      '<div class="view-heading"><h2>Materials</h2><p>Search past questions, notes, and handouts.</p></div>' +
      '<input type="text" class="materials-search" placeholder="Search by course or title...">' +
      '<div class="materials-list"></div>';

    const list = wrap.querySelector(".materials-list");
    const searchInput = wrap.querySelector(".materials-search");

    function renderList(items) {
      list.innerHTML = "";
      if (items.length === 0) {
        list.innerHTML = '<p class="empty-state">No materials match that search yet.</p>';
        return;
      }
      items.forEach(function (m) {
        const card = document.createElement("div");
        card.className = "material-card";
        card.innerHTML =
          '<div>' +
            '<p class="material-title">' + m.title + '</p>' +
            '<p class="material-meta">' + m.course + ' \u00B7 ' + m.school + '</p>' +
          '</div>' +
          '<span class="material-downloads">' + m.downloads + ' downloads</span>';
        list.appendChild(card);
      });
    }

    renderList(SEED_MATERIALS);

    searchInput.addEventListener("input", function () {
      const q = searchInput.value.trim().toLowerCase();
      const filtered = SEED_MATERIALS.filter(function (m) {
        return (
          m.title.toLowerCase().includes(q) ||
          m.course.toLowerCase().includes(q) ||
          m.school.toLowerCase().includes(q)
        );
      });
      renderList(filtered);
    });

    return wrap;
  }

  // ---------- Connect ----------

  function renderConnect() {
    const wrap = document.createElement("div");
    wrap.className = "view-inner";

    wrap.innerHTML =
      '<div class="view-heading"><h2>Connect</h2><p>Suggested based on your interests and school.</p></div>' +
      '<div class="connect-list"></div>';

    const list = wrap.querySelector(".connect-list");

    SEED_CONNECTIONS.forEach(function (c) {
      const card = document.createElement("div");
      card.className = "connect-card";
      card.innerHTML =
        '<div class="connect-avatar">' + c.name.charAt(0) + '</div>' +
        '<div class="connect-info">' +
          '<p class="connect-name">' + c.name + '</p>' +
          '<p class="connect-school">' + c.school + '</p>' +
          '<p class="connect-shared">Shared: ' + c.shared + '</p>' +
        '</div>' +
        '<button class="btn btn-ghost btn-sm">Connect</button>';
      list.appendChild(card);
    });

    return wrap;
  }

  // ---------- Profile ----------

  function renderProfile() {
    const wrap = document.createElement("div");
    wrap.className = "view-inner";

    wrap.innerHTML =
      '<div class="profile-card">' +
        '<div class="profile-avatar">U</div>' +
        '<p class="profile-name">Your name</p>' +
        '<p class="profile-school">Your school</p>' +
        '<button class="btn btn-ghost btn-sm">Edit profile</button>' +
      '</div>' +
      '<div class="profile-links">' +
        '<a href="#" class="profile-link">Saved materials</a>' +
        '<a href="#" class="profile-link">My connections</a>' +
        '<a href="#" class="profile-link">Settings</a>' +
        '<a href="index.html" class="profile-link profile-link-danger">Log out</a>' +
      '</div>';

    return wrap;
  }

  // Initial view
  showView("feed");
})();
