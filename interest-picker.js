// uniVERSE — interest picker
// Reusable across onboarding and Profile edit. Fetches the categorized
// interest list live from Supabase (single source of truth — no
// hardcoded copy to keep in sync with the database).
//
// Usage:
//   const picker = await renderInterestPicker(containerEl, {
//     selectedIds: ['uuid1', 'uuid2'],   // pre-checked, e.g. when editing
//     max: 5,
//   });
//   picker.getSelected() -> array of currently selected interest ids

async function renderInterestPicker(container, options) {
  const max = (options && options.max) || 5;
  const selected = new Set((options && options.selectedIds) || []);

  container.innerHTML = '<p class="empty-state">Loading interests...</p>';

  const { data, error } = await supabaseClient
    .from("interests")
    .select("id, name, category")
    .order("category")
    .order("name");

  if (error || !data) {
    container.innerHTML = '<p class="empty-state">Couldn\u2019t load interests right now.</p>';
    return { getSelected: function () { return Array.from(selected); } };
  }

  const byCategory = {};
  data.forEach(function (item) {
    const cat = item.category || "Other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });

  container.innerHTML = "";

  const counter = document.createElement("p");
  counter.className = "interest-counter";
  container.appendChild(counter);

  function updateCounter() {
    counter.textContent = selected.size + " / " + max + " selected";
  }

  function updateChipStates() {
    container.querySelectorAll(".interest-chip").forEach(function (chip) {
      const id = chip.dataset.id;
      const isSelected = selected.has(id);
      chip.classList.toggle("is-selected", isSelected);
      if (!isSelected && selected.size >= max) {
        chip.classList.add("is-disabled");
      } else {
        chip.classList.remove("is-disabled");
      }
    });
  }

  Object.keys(byCategory).forEach(function (category) {
    const heading = document.createElement("p");
    heading.className = "interest-category";
    heading.textContent = category;
    container.appendChild(heading);

    const chipWrap = document.createElement("div");
    chipWrap.className = "interest-chips";

    byCategory[category].forEach(function (item) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "interest-chip";
      chip.dataset.id = item.id;
      chip.textContent = item.name;

      chip.addEventListener("click", function () {
        if (selected.has(item.id)) {
          selected.delete(item.id);
        } else {
          if (selected.size >= max) return;
          selected.add(item.id);
        }
        updateCounter();
        updateChipStates();
      });

      chipWrap.appendChild(chip);
    });

    container.appendChild(chipWrap);
  });

  updateCounter();
  updateChipStates();

  return {
    getSelected: function () { return Array.from(selected); },
  };
}
