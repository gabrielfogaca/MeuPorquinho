function onChangeEmail() {
  toggleEmailErrors();
}

function onChangePassword() {
  togglePasswordErrors();
}

function login() {
  firebase
    .auth()
    .signInWithEmailAndPassword(form.email().value, form.password().value)
    .then((response) => {
      window.location.href = 'inicio.html';
    })
    .catch((error) => {
      alert(getErrorMessage(error));
    });
}

function getErrorMessage(error) {
  if (error.code == 'auth/internal-error') {
    return 'Usuário ou senha incorretos';
  }
  return error.message;
}

function register() {
  window.location.href = 'cadastro.html';
}

function toggleEmailErrors() {
  const email = form.email().value;
}

function togglePasswordErrors() {
  const password = form.password().value;
}

function isEmailValid() {
  const email = form.email().value;
  if (!email) {
    return false;
  }
  return validateEmail(email);
}

function isPasswordValid() {
  return form.password().value ? true : false;
}

const form = {
  email: () => document.getElementById('email'),
  loginButton: () => document.getElementById('login-button'),
  password: () => document.getElementById('password'),
  passwordRequiredError: () =>
    document.getElementById('password-required-error'),
  recoverPasswordButton: () =>
    document.getElementById('recover-password-button'),
};
