document.addEventListener('DOMContentLoaded', function () {
  const form = {
    confirmPassword: () => document.getElementById('confirmPassword'),
    email: () => document.getElementById('email'),
    password: () => document.getElementById('password'),
    registerButton: () => document.getElementById('register-button'),
  };

  function onChangePassword() {
    validateForm();
  }

  function onChangeConfirmPassword() {
    validateForm();
  }

  function validateForm() {
    const email = form.email().value;
    const password = form.password().value;
    const confirmPassword = form.confirmPassword().value;
    let valid = true;

    if (!email || !validateEmail(email)) {
      valid = false;
      document.getElementById('email-required-error').style.display = 'block';
    } else {
      document.getElementById('email-required-error').style.display = 'none';
    }

    if (!password || password.length < 6) {
      valid = false;
      document.getElementById('password-required-error').style.display =
        'block';
    } else {
      document.getElementById('password-required-error').style.display = 'none';
    }

    if (!confirmPassword || confirmPassword !== password) {
      valid = false;
      if (confirmPassword !== password) {
        document.getElementById('password-mismatch-error').style.display =
          'block';
      } else {
        document.getElementById(
          'confirm-password-required-error',
        ).style.display = 'block';
      }
    } else {
      document.getElementById('password-mismatch-error').style.display = 'none';
      document.getElementById('confirm-password-required-error').style.display =
        'none';
    }

    form.registerButton().disabled = !valid;
  }

  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  document
    .getElementById('passwordForm')
    .addEventListener('submit', function (event) {
      event.preventDefault();

      if (isFormValid()) {
        register();
      } else {
        alert('Preencha o formulário corretamente.');
      }
    });

  function isFormValid() {
    const email = form.email().value;
    const password = form.password().value;
    const confirmPassword = form.confirmPassword().value;

    return (
      email &&
      validateEmail(email) &&
      password &&
      password.length >= 6 &&
      confirmPassword === password
    );
  }

  function register() {
    showLoading();

    const email = form.email().value;
    const password = form.password().value;
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        hideLoading();
        window.location.href = 'inicio.html';
      })
      .catch((error) => {
        hideLoading();
        alert(getErrorMessage(error));
      });
  }

  function getErrorMessage(error) {
    if (error.code === 'auth/email-already-in-use') {
      return 'Email já está em uso';
    } else if (error.code === 'auth/missing-email') {
      return 'Preencha o campo de Email';
    }
    return error.message;
  }

  // Associar os eventos de mudança nos campos de senha
  form.password().addEventListener('input', onChangePassword);
  form.confirmPassword().addEventListener('input', onChangeConfirmPassword);
  form.email().addEventListener('input', validateForm);
});
