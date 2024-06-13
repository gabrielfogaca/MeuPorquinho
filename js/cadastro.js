// // firebase.auth().onAuthStateChanged((user) => {
// //   if (user) {
// //     window.location.href = 'inicio.html';
// //   }
// // });

// function onChangePassword() {
//   const password = form.password().value;
//   validatePasswordsMatch();
// }

// function onChangeConfirmPassword() {
//   validatePasswordsMatch();
// }

// function register() {
//   showLoading();

//   const email = form.email().value;
//   const password = form.password().value;
//   firebase
//     .auth()
//     .createUserWithEmailAndPassword(email, password)
//     .then(() => {
//       hideLoading();
//       // window.location.href = 'inicio.html';
//     })
//     .catch((error) => {
//       hideLoading();
//       alert(getErrorMessage(error));
//     });
// }

// function getErrorMessage(error) {
//   if (error.code == 'auth/email-already-in-use') {
//     return 'Email já está em uso';
//   } else if (error.code == 'auth/missing-email') {
//     return 'Preencha o campo de Email';
//   }
//   return error.message;
// }

// function validatePasswordsMatch() {
//   const password = form.password().value;
//   const confirmPassword = form.confirmPassword().value;

//   if (password === confirmPassword && password !== '') {
//     register-button.disabled = false;
//   } else {
//     register-button.disabled = true;
//   }
// }

// function isFormValid() {
//   const email = form.email().value;
//   if (!email || !validateEmail(email)) {
//     return false;
//   }

//   const password = form.password().value;
//   if (!password || password.length < 6) {
//     return false;
//   }

//   const confirmPassword = form.confirmPassword().value;
//   if (password != confirmPassword) {
//     return false;
//   }

//   return true;
// }

// const form = {
//   confirmPassword: () => document.getElementById('confirmPassword'),
//   confirmPasswordDoesntMatchError: () =>
//     document.getElementById('password-doesnt-match-error'),
//   email: () => document.getElementById('email'),
//   emailInvalidError: () => document.getElementById('email-invalid-error'),
//   emailRequiredError: () => document.getElementById('email-required-error'),
//   password: () => document.getElementById('password'),
//   passwordMinLengthError: () =>
//     document.getElementById('password-min-length-error'),
//   passwordRequiredError: () =>
//     document.getElementById('password-required-error'),
//   registerButton: () => document.getElementById('register-button'),
// };

document.addEventListener('DOMContentLoaded', function () {
  const form = {
    confirmPassword: () => document.getElementById('confirmPassword'),
    email: () => document.getElementById('email'),
    password: () => document.getElementById('password'),
    registerButton: () => document.getElementById('register-button'),
  };

  function onChangePassword() {
    validatePasswordsMatch();
  }

  function onChangeConfirmPassword() {
    validatePasswordsMatch();
  }

  function validatePasswordsMatch() {
    const password = form.password().value;
    const confirmPassword = form.confirmPassword().value;

    if (password === confirmPassword && password !== '') {
      form.registerButton().disabled = false;
    } else {
      form.registerButton().disabled = true;
    }
  }

  function isFormValid() {
    const email = form.email().value;
    if (!email || !validateEmail(email)) {
      return false;
    }

    const password = form.password().value;
    if (!password || password.length < 6) {
      return false;
    }

    const confirmPassword = form.confirmPassword().value;
    if (password !== confirmPassword) {
      return false;
    }

    return true;
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
        alert('Por favor, preencha todos os campos corretamente.');
      }
    });

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
});
