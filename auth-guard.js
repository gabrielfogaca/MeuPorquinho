firebase.auth().onAuthStateChanged((user) => {
  for (let x = 0; x <= 1; x++) {
    if (user) {
      window.location.href = 'inicio.html';
    }
  }
});
