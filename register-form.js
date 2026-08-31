// uniVERSE — register form validation
// Custom inline error messages (no default browser bubbles) + live password match.

(function () {
  const form = document.getElementById("register-form");
  if (!form) return;

  const fullname = document.getElementById("fullname");
  const schoolValue = document.getElementById("school-value");
  const schoolSearch = document.getElementById("school-search");
  const phone = document.getElementById("phone");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const confirmHint = document.getElementById("confirm-password-hint");

  const NIGERIA_PHONE = /^0\d{10}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, errorEl, message) {
    if (message) {
      input.classList.add("is-invalid");
      errorEl.textContent = message;
    } else {
      input.classList.remove("is-invalid");
      errorEl.textContent = "";
    }
  }

  function validateFullname() {
    const val = fullname.value.trim();
    const el = document.getElementById("fullname-error");
    if (!val) return (setError(fullname, el, "Enter your full name"), false);
    if (val.length < 3) return (setError(fullname, el, "Name looks too short"), false);
    setError(fullname, el, "");
    return true;
  }

  function validateSchool() {
    const el = document.getElementById("school-error");
    if (!schoolValue.value) {
      setError(schoolSearch, el, "Select your school from the list");
      return false;
    }
    setError(schoolSearch, el, "");
    return true;
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

  function validateEmail() {
    const el = document.getElementById("email-error");
    const val = email.value.trim();
    if (val && !EMAIL_RE.test(val)) {
      setError(email, el, "That email doesn't look right");
      return false;
    }
    setError(email, el, "");
    return true;
  }

  function validatePassword() {
    const el = document.getElementById("password-error");
    const val = password.value;
    if (!val) return (setError(password, el, "Create a password"), false);
    if (val.length < 8) return (setError(password, el, "Use at least 8 characters"), false);
    setError(password, el, "");
    return true;
  }

  function checkPasswordMatch() {
    if (!confirmPassword.value) {
      confirmHint.textContent = "";
      confirmHint.classList.remove("is-match");
      confirmPassword.classList.remove("is-invalid");
      return false;
    }
    const matches = confirmPassword.value === password.value;
    confirmHint.textContent = matches ? "Passwords match" : "Passwords don't match yet";
    confirmHint.classList.toggle("is-match", matches);
    confirmPassword.classList.toggle("is-invalid", !matches);
    return matches;
  }

  fullname.addEventListener("blur", validateFullname);
  phone.addEventListener("blur", validatePhone);
  email.addEventListener("blur", validateEmail);
  password.addEventListener("blur", validatePassword);
  password.addEventListener("input", function () {
    if (confirmPassword.value) checkPasswordMatch();
  });
  confirmPassword.addEventListener("input", checkPasswordMatch);

  // School field is validated on blur of the search input, after the combobox
  // has had a chance to set the hidden value on click/selection.
  schoolSearch.addEventListener("blur", function () {
    setTimeout(validateSchool, 150);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const checks = [
      validateFullname(),
      validateSchool(),
      validatePhone(),
      validateEmail(),
      validatePassword(),
      checkPasswordMatch(),
    ];

    if (checks.every(Boolean)) {
      // Backend not wired yet — once Supabase Auth is connected, this
      // redirect happens after the account is actually created.
      window.location.href = "app.html";
    } else {
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
    }
  });
})();
