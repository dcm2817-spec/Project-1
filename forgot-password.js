// uniVERSE — forgot password
// Facebook-style flow: one form, then a confirmation message in place of it.
// No real email/SMS is sent yet — this is the UI ready for the backend.

(function () {
  const form = document.getElementById("reset-form");
  if (!form) return;

  const identifier = document.getElementById("identifier");
  const requestCard = document.getElementById("request-card");
  const confirmCard = document.getElementById("confirm-card");
  const confirmText = document.getElementById("confirm-text");

  function setError(input, errorEl, message) {
    if (message) {
      input.classList.add("is-invalid");
      errorEl.textContent = message;
    } else {
      input.classList.remove("is-invalid");
      errorEl.textContent = "";
    }
  }

  function validateIdentifier() {
    const el = document.getElementById("identifier-error");
    const val = identifier.value.trim();
    if (!val) {
      setError(identifier, el, "Enter your email or phone number");
      return false;
    }
    setError(identifier, el, "");
    return true;
  }

  identifier.addEventListener("blur", validateIdentifier);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateIdentifier()) return;

    // Backend not wired yet — once connected, this is where the reset
    // email/SMS actually gets triggered via Supabase Auth.
    confirmText.textContent =
      "If an account matches \u201c" + identifier.value.trim() + "\u201d, a password reset link is on its way.";

    requestCard.hidden = true;
    confirmCard.hidden = false;
  });
})();
