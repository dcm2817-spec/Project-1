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
      '<div class="view-heading"><h2>Connect</h2><p>People from your school on uniVERSE.</p></div>' +
      '<div id="requests-section"></div>' +
      '<div id="connected-section"></div>' +
      '<h3 class="connect-subheading">Suggested</h3>' +
      '<div class="connect-list" id="suggested-list"><p class="empty-state">Loading...</p></div>';

    const requestsSection = wrap.querySelector("#requests-section");
    const connectedSection = wrap.querySelector("#connected-section");
    const suggestedList = wrap.querySelector("#suggested-list");

    let currentUser = null;

    function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str || "";
      return div.innerHTML;
    }

    function personCard(person, actionsHtml) {
      const card = document.createElement("div");
      card.className = "connect-card";
      card.innerHTML =
        '<div class="connect-avatar">' + (person.full_name || "?").charAt(0).toUpperCase() + '</div>' +
        '<div class="connect-info">' +
          '<p class="connect-name">' + escapeHtml(person.full_name) + '</p>' +
          '<p class="connect-school">' + escapeHtml(person.school_name || "") + '</p>' +
        '</div>' +
        '<div class="connect-actions">' + actionsHtml + '</div>';
      return card;
    }

    async function loadConnectData() {
      const { data: userRes } = await supabaseClient.auth.getUser();
      currentUser = userRes.user;
      if (!currentUser) return;

      const { data: myProfile } = await supabaseClient
        .from("profiles")
        .select("school_id")
        .eq("id", currentUser.id)
        .single();

      const mySchoolId = myProfile ? myProfile.school_id : null;

      const { data: myConnections } = await supabaseClient
        .from("connections")
        .select("id, requester_id, receiver_id, status")
        .or("requester_id.eq." + currentUser.id + ",receiver_id.eq." + currentUser.id);

      const rows = myConnections || [];

      // Anyone already involved in a connection row, regardless of
      // status, is excluded from "Suggested" — pending/accepted/declined
      // are all shown in their own section instead of being re-suggested.
      const excludeIds = new Set();
      const incomingRequests = []; // { connectionId, otherId }
      const connectedIds = [];

      rows.forEach(function (row) {
        const otherId = row.requester_id === currentUser.id ? row.receiver_id : row.requester_id;
        excludeIds.add(otherId);
        if (row.status === "accepted") {
          connectedIds.push(otherId);
        } else if (row.status === "pending" && row.receiver_id === currentUser.id) {
          incomingRequests.push({ connectionId: row.id, otherId: otherId });
        }
      });

      // Fetch profile details for anyone we need to display: incoming
      // requesters + accepted connections.
      const neededIds = incomingRequests.map(function (r) { return r.otherId; }).concat(connectedIds);
      let otherProfiles = {};
      if (neededIds.length > 0) {
        const { data: profilesData } = await supabaseClient
          .from("profiles")
          .select("id, full_name, school_name")
          .in("id", neededIds);
        (profilesData || []).forEach(function (p) { otherProfiles[p.id] = p; });
      }

      renderRequests(incomingRequests, otherProfiles);
      renderConnected(connectedIds, otherProfiles);
      loadSuggested(excludeIds, mySchoolId);
    }

    function renderRequests(incomingRequests, otherProfiles) {
      requestsSection.innerHTML = "";
      if (incomingRequests.length === 0) return;

      const heading = document.createElement("h3");
      heading.className = "connect-subheading";
      heading.textContent = "Requests";
      requestsSection.appendChild(heading);

      incomingRequests.forEach(function (req) {
        const person = otherProfiles[req.otherId];
        if (!person) return;
        const card = personCard(person,
          '<button class="btn btn-primary btn-sm accept-btn">Accept</button>' +
          '<button class="btn btn-ghost btn-sm decline-btn">Decline</button>'
        );
        card.querySelector(".accept-btn").addEventListener("click", function () {
          respondToRequest(req.connectionId, "accepted");
        });
        card.querySelector(".decline-btn").addEventListener("click", function () {
          respondToRequest(req.connectionId, "declined");
        });
        requestsSection.appendChild(card);
      });
    }

    function renderConnected(connectedIds, otherProfiles) {
      connectedSection.innerHTML = "";
      if (connectedIds.length === 0) return;

      const heading = document.createElement("h3");
      heading.className = "connect-subheading";
      heading.textContent = "Your connections";
      connectedSection.appendChild(heading);

      connectedIds.forEach(function (id) {
        const person = otherProfiles[id];
        if (!person) return;
        const card = personCard(person, '<span class="connected-badge">Connected</span>');
        connectedSection.appendChild(card);
      });
    }

    async function loadSuggested(excludeIds, mySchoolId) {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, full_name, school_id, school_name")
        .neq("id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        suggestedList.innerHTML = '<p class="empty-state">Couldn\u2019t load suggestions right now.</p>';
        return;
      }

      const filtered = (data || []).filter(function (p) { return !excludeIds.has(p.id); });

      // Same-school people surface first.
      filtered.sort(function (a, b) {
        const aMatch = a.school_id === mySchoolId ? 0 : 1;
        const bMatch = b.school_id === mySchoolId ? 0 : 1;
        return aMatch - bMatch;
      });

      suggestedList.innerHTML = "";

      if (filtered.length === 0) {
        suggestedList.innerHTML = '<p class="empty-state">No new suggestions right now — check back soon.</p>';
        return;
      }

      filtered.forEach(function (person) {
        const sameSchool = person.school_id === mySchoolId;
        const card = personCard(person,
          '<button class="btn btn-ghost btn-sm connect-btn">Connect</button>'
        );
        if (sameSchool) {
          const tag = document.createElement("span");
          tag.className = "same-school-tag";
          tag.textContent = "Same school";
          card.querySelector(".connect-info").appendChild(tag);
        }
        const btn = card.querySelector(".connect-btn");
        btn.addEventListener("click", function () {
          sendRequest(person.id, btn);
        });
        suggestedList.appendChild(card);
      });
    }

    async function sendRequest(receiverId, btn) {
      btn.disabled = true;
      btn.textContent = "Sending...";

      const { error } = await supabaseClient.from("connections").insert({
        requester_id: currentUser.id,
        receiver_id: receiverId,
        status: "pending",
      });

      if (error) {
        btn.disabled = false;
        btn.textContent = "Connect";
        return;
      }

      btn.textContent = "Requested";
    }

    async function respondToRequest(connectionId, status) {
      await supabaseClient
        .from("connections")
        .update({ status: status })
        .eq("id", connectionId);

      loadConnectData();
    }

    loadConnectData();

    return wrap;
  }

  // ---------- Profile ----------

  function renderProfile() {
    const wrap = document.createElement("div");
    wrap.className = "view-inner";

    wrap.innerHTML =
      '<div id="profile-main">' +
        '<div class="profile-card" id="profile-display">' +
          '<div class="profile-avatar" id="profile-avatar">U</div>' +
          '<p class="profile-name" id="profile-name">Loading...</p>' +
          '<p class="profile-school" id="profile-school-display"></p>' +
          '<button class="btn btn-ghost btn-sm" id="edit-profile-toggle">Edit profile</button>' +
        '</div>' +
        '<form class="upload-form" id="edit-profile-form" hidden>' +
          '<label class="field">' +
            '<span class="field-label">Full name</span>' +
            '<input type="text" id="edit-fullname" required>' +
            '<span class="field-error" id="edit-fullname-error"></span>' +
          '</label>' +
          '<label class="field">' +
            '<span class="field-label">Profile photo</span>' +
            '<input type="file" id="edit-avatar" accept="image/*">' +
            '<span class="field-error" id="edit-avatar-error"></span>' +
          '</label>' +
          '<label class="field">' +
            '<span class="field-label">Faculty <span class="optional-tag">(optional)</span></span>' +
            '<input type="text" id="edit-faculty" placeholder="e.g. Engineering">' +
          '</label>' +
          '<label class="field">' +
            '<span class="field-label">Department <span class="optional-tag">(optional)</span></span>' +
            '<input type="text" id="edit-department" placeholder="e.g. Geomatics Engineering">' +
          '</label>' +
          '<label class="field">' +
            '<span class="field-label">Level <span class="optional-tag">(optional)</span></span>' +
            '<input type="text" id="edit-level" placeholder="e.g. 200L">' +
          '</label>' +
          '<div class="field-label" style="margin-top: 6px;">Interests (up to 5)</div>' +
          '<div id="edit-interests-container"></div>' +
          '<div class="upload-actions">' +
            '<button type="button" class="btn btn-ghost btn-sm" id="edit-cancel">Cancel</button>' +
            '<button type="submit" class="btn btn-primary btn-sm" id="edit-submit">Save</button>' +
          '</div>' +
        '</form>' +
        '<div class="profile-links">' +
          '<a href="#" class="profile-link">Saved materials</a>' +
          '<a href="#" class="profile-link">My connections</a>' +
          '<a href="#" class="profile-link" id="my-groups-link">My groups</a>' +
          '<a href="#" class="profile-link">Settings</a>' +
          '<a href="login.html" id="logout-link" class="profile-link profile-link-danger">Log out</a>' +
        '</div>' +
      '</div>' +
      '<div id="groups-view" hidden></div>';

    const nameEl = wrap.querySelector("#profile-name");
    const schoolEl = wrap.querySelector("#profile-school-display");
    const avatarEl = wrap.querySelector("#profile-avatar");
    const editToggle = wrap.querySelector("#edit-profile-toggle");
    const editForm = wrap.querySelector("#edit-profile-form");
    const editNameInput = wrap.querySelector("#edit-fullname");
    const displayCard = wrap.querySelector("#profile-display");

    let currentUser = null;
    let currentProfile = null;
    let interestPicker = null;
    let savedInterestIds = [];

    function paintAvatar(url, name) {
      if (url) {
        avatarEl.innerHTML = '<img src="' + url + '" alt="Profile photo" class="profile-avatar-img">';
      } else {
        avatarEl.textContent = (name || "U").charAt(0).toUpperCase();
      }
    }

    async function loadProfile() {
      const { data: userRes } = await supabaseClient.auth.getUser();
      currentUser = userRes.user;
      if (!currentUser) return;

      const { data, error } = await supabaseClient
        .from("profiles")
        .select("full_name, school_name, avatar_url, faculty, department, level")
        .eq("id", currentUser.id)
        .single();

      if (error || !data) {
        nameEl.textContent = "Couldn\u2019t load profile";
        return;
      }

      currentProfile = data;
      nameEl.textContent = data.full_name;
      schoolEl.textContent = data.school_name || "";
      editNameInput.value = data.full_name;
      wrap.querySelector("#edit-faculty").value = data.faculty || "";
      wrap.querySelector("#edit-department").value = data.department || "";
      wrap.querySelector("#edit-level").value = data.level || "";
      paintAvatar(data.avatar_url, data.full_name);

      const { data: myInterests } = await supabaseClient
        .from("profile_interests")
        .select("interest_id")
        .eq("profile_id", currentUser.id);

      savedInterestIds = (myInterests || []).map(function (r) { return r.interest_id; });
    }

    loadProfile();

    editToggle.addEventListener("click", async function () {
      editForm.hidden = false;
      displayCard.hidden = true;
      const interestsContainer = wrap.querySelector("#edit-interests-container");
      interestPicker = await renderInterestPicker(interestsContainer, {
        max: 5,
        selectedIds: savedInterestIds,
      });
    });

    wrap.querySelector("#edit-cancel").addEventListener("click", function () {
      editForm.hidden = true;
      displayCard.hidden = false;
    });

    editForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nameError = wrap.querySelector("#edit-fullname-error");
      const avatarError = wrap.querySelector("#edit-avatar-error");
      nameError.textContent = "";
      avatarError.textContent = "";

      const newName = editNameInput.value.trim();
      if (!newName) {
        nameError.textContent = "Name can't be empty";
        return;
      }

      const submitBtn = wrap.querySelector("#edit-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      let newAvatarUrl = currentProfile ? currentProfile.avatar_url : null;
      const fileInput = wrap.querySelector("#edit-avatar");
      const file = fileInput.files[0];

      if (file) {
        if (!file.type.startsWith("image/")) {
          avatarError.textContent = "Choose an image file";
          submitBtn.disabled = false;
          submitBtn.textContent = "Save";
          return;
        }

        const ext = file.name.split(".").pop();
        const path = currentUser.id + "/avatar." + ext;

        const { error: uploadError } = await supabaseClient
          .storage
          .from("avatars")
          .upload(path, file, { upsert: true });

        if (uploadError) {
          avatarError.textContent = "Photo upload failed: " + uploadError.message;
          submitBtn.disabled = false;
          submitBtn.textContent = "Save";
          return;
        }

        const { data: publicUrlData } = supabaseClient
          .storage
          .from("avatars")
          .getPublicUrl(path);

        // Cache-bust so the new photo shows immediately instead of a
        // cached copy of the old one at the same path.
        newAvatarUrl = publicUrlData.publicUrl + "?t=" + Date.now();
      }

      const newFaculty = wrap.querySelector("#edit-faculty").value.trim();
      const newDepartment = wrap.querySelector("#edit-department").value.trim();
      const newLevel = wrap.querySelector("#edit-level").value.trim();

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          full_name: newName,
          avatar_url: newAvatarUrl,
          faculty: newFaculty || null,
          department: newDepartment || null,
          level: newLevel || null,
        })
        .eq("id", currentUser.id);

      // Save interest changes: insert newly picked ones, remove
      // unpicked ones. New picks trigger the auto-join-groups trigger
      // on the database side automatically.
      if (interestPicker) {
        const newSelection = interestPicker.getSelected();
        const toAdd = newSelection.filter(function (id) { return savedInterestIds.indexOf(id) === -1; });
        const toRemove = savedInterestIds.filter(function (id) { return newSelection.indexOf(id) === -1; });

        if (toAdd.length > 0) {
          await supabaseClient.from("profile_interests").insert(
            toAdd.map(function (interestId) {
              return { profile_id: currentUser.id, interest_id: interestId };
            })
          );
        }
        if (toRemove.length > 0) {
          await supabaseClient
            .from("profile_interests")
            .delete()
            .eq("profile_id", currentUser.id)
            .in("interest_id", toRemove);
        }
        savedInterestIds = newSelection;
      }

      submitBtn.disabled = false;
      submitBtn.textContent = "Save";

      if (updateError) {
        nameError.textContent = "Something went wrong saving. Try again.";
        return;
      }

      currentProfile = { full_name: newName, school_name: schoolEl.textContent, avatar_url: newAvatarUrl };
      nameEl.textContent = newName;
      paintAvatar(newAvatarUrl, newName);

      editForm.hidden = true;
      displayCard.hidden = false;
    });

    // ---------- My groups ----------

    const profileMain = wrap.querySelector("#profile-main");
    const groupsView = wrap.querySelector("#groups-view");

    wrap.querySelector("#my-groups-link").addEventListener("click", function (e) {
      e.preventDefault();
      profileMain.hidden = true;
      groupsView.hidden = false;
      renderGroupsList(groupsView);
    });

    function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str || "";
      return div.innerHTML;
    }

    async function renderGroupsList(container) {
      container.innerHTML =
        '<a href="#" class="back-link" id="groups-back">\u2190 Back to profile</a>' +
        '<div class="view-heading"><h2>My groups</h2><p>Auto-joined based on your interests.</p></div>' +
        '<div id="groups-list"><p class="empty-state">Loading...</p></div>';

      container.querySelector("#groups-back").addEventListener("click", function (e) {
        e.preventDefault();
        groupsView.hidden = true;
        profileMain.hidden = false;
      });

      const listEl = container.querySelector("#groups-list");
      const { data: userRes } = await supabaseClient.auth.getUser();
      const user = userRes.user;

      const { data, error } = await supabaseClient
        .from("group_members")
        .select("group_id, groups(id, name, description)")
        .eq("profile_id", user.id);

      if (error) {
        listEl.innerHTML = '<p class="empty-state">Couldn\u2019t load your groups right now.</p>';
        return;
      }

      const groups = (data || []).map(function (row) { return row.groups; }).filter(Boolean);

      if (groups.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No groups yet — pick some interests in Edit profile and you\u2019ll be added automatically.</p>';
        return;
      }

      listEl.innerHTML = "";
      groups.forEach(function (group) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "group-card";
        card.innerHTML =
          '<p class="group-name">' + escapeHtml(group.name) + '</p>' +
          '<p class="group-description">' + escapeHtml(group.description || "") + '</p>';
        card.addEventListener("click", function () {
          renderGroupDetail(groupsView, group);
        });
        listEl.appendChild(card);
      });
    }

    async function renderGroupDetail(container, group) {
      container.innerHTML =
        '<a href="#" class="back-link" id="group-detail-back">\u2190 Back to my groups</a>' +
        '<div class="view-heading"><h2>' + escapeHtml(group.name) + '</h2><p>' + escapeHtml(group.description || "") + '</p></div>' +
        '<form class="group-post-form" id="group-post-form">' +
          '<textarea id="group-post-text" placeholder="Post something to this group..." required></textarea>' +
          '<button type="submit" class="btn btn-primary btn-sm">Post</button>' +
        '</form>' +
        '<div id="group-posts-list"><p class="empty-state">Loading posts...</p></div>';

      container.querySelector("#group-detail-back").addEventListener("click", function (e) {
        e.preventDefault();
        renderGroupsList(groupsView);
      });

      const postsList = container.querySelector("#group-posts-list");

      async function loadGroupPosts() {
        const { data, error } = await supabaseClient
          .from("posts")
          .select("id, content, created_at, author_id, profiles(full_name)")
          .eq("group_id", group.id)
          .order("created_at", { ascending: false });

        if (error) {
          postsList.innerHTML = '<p class="empty-state">Couldn\u2019t load posts right now.</p>';
          return;
        }

        if (!data || data.length === 0) {
          postsList.innerHTML = '<p class="empty-state">No posts yet — be the first to post here.</p>';
          return;
        }

        postsList.innerHTML = "";
        data.forEach(function (post) {
          const card = document.createElement("div");
          card.className = "feed-card";
          const authorName = post.profiles ? post.profiles.full_name : "Member";
          card.innerHTML =
            '<p class="feed-author">' + escapeHtml(authorName) + '</p>' +
            '<p class="feed-text">' + escapeHtml(post.content) + '</p>';
          postsList.appendChild(card);
        });
      }

      loadGroupPosts();

      container.querySelector("#group-post-form").addEventListener("submit", async function (e) {
        e.preventDefault();

        const textarea = container.querySelector("#group-post-text");
        const content = textarea.value.trim();
        if (!content) return;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Posting...";

        const { data: userRes } = await supabaseClient.auth.getUser();

        const { error } = await supabaseClient.from("posts").insert({
          author_id: userRes.user.id,
          content: content,
          group_id: group.id,
          category: "general",
        });

        submitBtn.disabled = false;
        submitBtn.textContent = "Post";

        if (!error) {
          textarea.value = "";
          loadGroupPosts();
        }
      });
    }

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
