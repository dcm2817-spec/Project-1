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
      '<button class="add-material-card" id="add-material-toggle" type="button">' +
        '<span class="add-material-plus">+</span>' +
        '<span>Add material</span>' +
      '</button>' +
      '<form class="upload-form" id="upload-form" hidden>' +
        '<label class="field">' +
          '<span class="field-label">Title</span>' +
          '<input type="text" id="upload-title" placeholder="e.g. GEE 202 — Complete Notes" required>' +
          '<span class="field-error" id="upload-title-error"></span>' +
        '</label>' +
        '<label class="field">' +
          '<span class="field-label">Course code</span>' +
          '<input type="text" id="upload-course" placeholder="e.g. GEE 202">' +
        '</label>' +
        '<label class="field">' +
          '<span class="field-label">School</span>' +
          '<input type="text" id="upload-school" placeholder="Loading your school...">' +
        '</label>' +
        '<label class="field">' +
          '<span class="field-label">PDF file</span>' +
          '<input type="file" id="upload-file" accept="application/pdf" required>' +
          '<span class="field-error" id="upload-file-error"></span>' +
        '</label>' +
        '<div class="upload-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm" id="upload-cancel">Cancel</button>' +
          '<button type="submit" class="btn btn-primary btn-sm" id="upload-submit">Upload</button>' +
        '</div>' +
      '</form>' +
      '<input type="text" class="materials-search" placeholder="Search by course or title...">' +
      '<div class="materials-list"><p class="empty-state">Loading materials...</p></div>';

    const list = wrap.querySelector(".materials-list");
    const searchInput = wrap.querySelector(".materials-search");
    const toggleBtn = wrap.querySelector("#add-material-toggle");
    const uploadForm = wrap.querySelector("#upload-form");
    const schoolField = wrap.querySelector("#upload-school");

    let allMaterials = [];
    let currentUser = null;
    let currentSchoolId = null;

    // Prefill the school field from the logged-in user's own profile.
    supabaseClient.auth.getUser().then(function (res) {
      currentUser = res.data.user;
      if (!currentUser) return;
      return supabaseClient
        .from("profiles")
        .select("school_id, school_name")
        .eq("id", currentUser.id)
        .single();
    }).then(function (result) {
      if (result && result.data) {
        currentSchoolId = result.data.school_id;
        schoolField.value = result.data.school_name || "";
        schoolField.placeholder = "e.g. University of Benin";
      }
    });

    function renderList(items) {
      list.innerHTML = "";
      if (items.length === 0) {
        list.innerHTML = '<p class="empty-state">No materials match that search yet.</p>';
        return;
      }
      items.forEach(function (m) {
        const card = document.createElement("div");
        card.className = "material-card";
        card.dataset.path = m.file_path;
        card.dataset.id = m.id;
        card.innerHTML =
          '<div>' +
            '<p class="material-title">' + escapeHtml(m.title) + '</p>' +
            '<p class="material-meta">' + escapeHtml(m.course_code || "General") + ' \u00B7 ' + escapeHtml(m.school_name || "") + '</p>' +
          '</div>' +
          '<span class="material-downloads">Download</span>';
        card.addEventListener("click", function () {
          downloadMaterial(m);
        });
        list.appendChild(card);
      });
    }

    async function loadMaterials() {
      const { data, error } = await supabaseClient
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        list.innerHTML = '<p class="empty-state">Couldn\u2019t load materials right now.</p>';
        return;
      }

      allMaterials = data || [];
      renderList(allMaterials);
    }

    async function downloadMaterial(m) {
      const { data, error } = await supabaseClient
        .storage
        .from("materials")
        .createSignedUrl(m.file_path, 60); // link valid for 60 seconds

      if (error || !data) return;

      window.open(data.signedUrl, "_blank");

      if (currentUser) {
        supabaseClient.from("material_downloads").insert({
          material_id: m.id,
          profile_id: currentUser.id,
        });
      }
    }

    function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    loadMaterials();

    searchInput.addEventListener("input", function () {
      const q = searchInput.value.trim().toLowerCase();
      const filtered = allMaterials.filter(function (m) {
        return (
          m.title.toLowerCase().includes(q) ||
          (m.course_code || "").toLowerCase().includes(q) ||
          (m.school_name || "").toLowerCase().includes(q)
        );
      });
      renderList(filtered);
    });

    // ---------- Inline upload form ----------

    toggleBtn.addEventListener("click", function () {
      uploadForm.hidden = !uploadForm.hidden;
      toggleBtn.hidden = !uploadForm.hidden;
    });

    wrap.querySelector("#upload-cancel").addEventListener("click", function () {
      uploadForm.hidden = true;
      toggleBtn.hidden = false;
      uploadForm.reset();
    });

    uploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const titleInput = wrap.querySelector("#upload-title");
      const fileInput = wrap.querySelector("#upload-file");
      const courseInput = wrap.querySelector("#upload-course");
      const titleError = wrap.querySelector("#upload-title-error");
      const fileError = wrap.querySelector("#upload-file-error");

      titleError.textContent = "";
      fileError.textContent = "";

      const title = titleInput.value.trim();
      const file = fileInput.files[0];

      let hasError = false;
      if (!title) {
        titleError.textContent = "Give it a title";
        hasError = true;
      }
      if (!file) {
        fileError.textContent = "Choose a PDF file";
        hasError = true;
      } else if (file.type !== "application/pdf") {
        fileError.textContent = "Only PDF files are supported";
        hasError = true;
      }
      if (hasError || !currentUser) return;

      const submitBtn = wrap.querySelector("#upload-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Uploading...";

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const uniqueId = (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random());
      const path = (currentSchoolId || "general") + "/" + uniqueId + "-" + safeName;

      const { error: uploadError } = await supabaseClient
        .storage
        .from("materials")
        .upload(path, file);

      if (uploadError) {
        fileError.textContent = "Upload failed: " + uploadError.message;
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload";
        return;
      }

      const { error: insertError } = await supabaseClient
        .from("materials")
        .insert({
          uploader_id: currentUser.id,
          title: title,
          course_code: courseInput.value.trim() || null,
          school_id: currentSchoolId,
          school_name: schoolField.value.trim() || null,
          file_path: path,
        });

      submitBtn.disabled = false;
      submitBtn.textContent = "Upload";

      if (insertError) {
        fileError.textContent = "Something went wrong saving it. Try again.";
        return;
      }

      uploadForm.reset();
      uploadForm.hidden = true;
      toggleBtn.hidden = false;
      loadMaterials();
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
        '<a href="login.html" id="logout-link" class="profile-link profile-link-danger">Log out</a>' +
      '</div>';

    return wrap;
  }

  // Wire logout after render, since the link is created dynamically above.
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "logout-link") {
      e.preventDefault();
      supabaseClient.auth.signOut().finally(function () {
        window.location.href = "login.html";
      });
    }
  });

  // Initial view
  showView("feed");
})();
