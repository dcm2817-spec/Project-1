// uniVERSE — login form validation
// Custom inline error messages, matching the register form's pattern.

(function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  const phone = document.getElementById("phone");
  const password = document.getElementById("password");

  const NIGERIA_PHONE = /^0\d{10}$/;

  function setError(input, errorEl, message) {
    if (message) {
      input.classList.add("is-invalid");
      errorEl.textContent = message;
    } else {
      input.classList.remove("is-invalid");
      errorEl.textContent = "";
    }
  }

  function validatePhone() {
    const el = document.getElementById("phone-error");
    const val = phone.value.trim();
    if (!val) return (setError(phone, el, "Enter your phone number"), false);
    if (!NIGERIA_PHONE.test(val)) {
      setError(phone, el, "Enter an 11-digit number starting with 0");
      return false;
    }
    setError(phone, el, "");
    return true;
  }

  function validatePassword() {
    const el = document.getElementById("password-error");
    if (!password.value) return (setError(password, el, "Enter your password"), false);
    setError(password, el, "");
    return true;
  }

  phone.addEventListener("blur", validatePhone);
  password.addEventListener("blur", validatePassword);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const checks = [validatePhone(), validatePassword()];

    if (!checks.every(Boolean)) {
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    const phoneValue = phone.value.trim();
    const authEmail = phoneValue + "@universe.local"; // same synthesis used at register time

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: authEmail,
      password: password.value,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = "Log in";

    if (error) {
      const el = document.getElementById("password-error");
      setError(password, el, "Phone number or password is incorrect");
      return;
    }

    window.location.href = "app.html";
  });
})();
