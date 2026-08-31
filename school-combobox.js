// uniVERSE — searchable school picker
// Filters the UNIVERSITIES dataset (universities.js) as the user types,
// matching against name, short form, and state. Falls back to "Other".

(function () {
  const wrap = document.getElementById("school-combobox");
  if (!wrap || typeof UNIVERSITIES === "undefined") return;

  const input = document.getElementById("school-search");
  const hidden = document.getElementById("school-value");
  const list = document.getElementById("school-listbox");

  const MAX_RESULTS = 8;

  function renderOptions(query) {
    const q = query.trim().toLowerCase();
    let matches;

    if (!q) {
      matches = UNIVERSITIES.slice(0, MAX_RESULTS);
    } else {
      matches = UNIVERSITIES.filter(function (u) {
        return (
          u.name.toLowerCase().includes(q) ||
          u.short.toLowerCase().includes(q) ||
          u.state.toLowerCase().includes(q)
        );
      }).slice(0, MAX_RESULTS);
    }

    list.innerHTML = "";

    if (matches.length === 0) {
      const li = document.createElement("li");
      li.className = "combobox-empty";
      li.textContent = "No match — select \u201cOther\u201d below";
      list.appendChild(li);
    } else {
      matches.forEach(function (u) {
        const li = document.createElement("li");
        li.className = "combobox-option";
        li.setAttribute("role", "option");
        li.dataset.id = u.id;
        li.dataset.name = u.name;
        li.innerHTML =
          '<span class="opt-name">' + u.name + "</span>" +
          '<span class="opt-meta">' + u.short + " \u00B7 " + u.state + "</span>";
        list.appendChild(li);
      });
    }

    const otherLi = document.createElement("li");
    otherLi.className = "combobox-option combobox-other";
    otherLi.setAttribute("role", "option");
    otherLi.dataset.id = "other";
    otherLi.dataset.name = "Other / not listed";
    otherLi.innerHTML = '<span class="opt-name">Other / not listed</span>';
    list.appendChild(otherLi);

    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function selectOption(li) {
    input.value = li.dataset.name;
    hidden.value = li.dataset.id;
    closeList();
  }

  function closeList() {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }

  input.addEventListener("focus", function () {
    renderOptions(input.value);
  });

  input.addEventListener("input", function () {
    hidden.value = "";
    renderOptions(input.value);
  });

  list.addEventListener("click", function (e) {
    const li = e.target.closest(".combobox-option");
    if (li) selectOption(li);
  });

  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) closeList();
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeList();
  });
})();
