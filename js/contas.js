// Certifique-se de que o Firebase está inicializado com suas configurações
firebase.initializeApp(firebaseConfig);

// Referência ao Firestore
var db = firebase.firestore();

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = '../home.html';
    })
    .catch(() => {
      alert('Erro ao fazer logout');
    });
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    findContas(user);
    if (!isNewTransaction()) {
      const uid = getTransactionUid();
      findcontasyUid(uid);
    }
  }
});

function findContas(user) {
  firebase
    .firestore()
    .collection('contas')
    .where('user.uid', '==', user.uid) // Filtrar as contas pelo UID do usuário logado
    .get()
    .then((snapshot) => {
      let contas = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));
      console.log(contas);
      createDivsForContas(contas);
    })
    .catch((error) => {
      console.error('Erro ao buscar contas: ', error);
    });
}

function createDivsForContas(contas) {
  const parentDiv = document.getElementById('contascadastradas');

  if (!parentDiv) {
    console.error("Elemento com ID 'contascadastradas' não encontrado.");
    return;
  }

  parentDiv.innerHTML = '';

  let mainDiv = document.createElement('div');
  mainDiv.className = 'container';

  contas.forEach((conta) => {
    let contaDiv = document.createElement('div');
    contaDiv.className = 'col banner';

    let title = document.createElement('h4');
    title.textContent = conta.type; // Título para a conta
    contaDiv.appendChild(title);

    let botaoEditar = document.createElement('button');
    botaoEditar.type = 'submit';
    botaoEditar.className = 'editar btn btn-primary';
    botaoEditar.id = 'editar';
    botaoEditar.addEventListener('click', () => {
      window.location.href = 'contas.html?uid=' + conta.uid;
    });
    botaoEditar.innerHTML = 'Editar';
    contaDiv.appendChild(botaoEditar);

    let botaoExcluir = document.createElement('button');
    botaoExcluir.type = 'submit';
    botaoExcluir.className = 'excluir btn btn-danger';
    botaoExcluir.id = 'excluir';
    botaoExcluir.addEventListener('click', (event) => {
      event.stopPropagation();
      askRemoveConta(conta);
    });
    botaoExcluir.innerHTML = 'Excluir';
    contaDiv.appendChild(botaoExcluir);

    let saldoDiv = document.createElement('div');
    saldoDiv.className = 'row';
    saldoDiv.innerHTML = `<div class="col"><span>Saldo: R$ ${conta.valor}</span></div>`;
    contaDiv.appendChild(saldoDiv);

    let mes = document.createElement('div');
    mes.className = 'col';
    mes.innerHTML = `<div class="col"><span>Data: ${conta.data}</span></div>`;
    contaDiv.appendChild(mes);

    mainDiv.appendChild(contaDiv);
  });

  parentDiv.appendChild(mainDiv);
}

function askRemoveConta(conta) {
  const shouldRemove = confirm(
    'Deseja remover a Conta Bancária com saldo de R$ ' + conta.valor + '?',
  );
  if (shouldRemove) {
    removeConta(conta);
  }
}

function removeConta(conta) {
  showLoading();

  const contaRef = db.collection('contas').doc(conta.uid);

  contaRef
    .delete()
    .then(() => {
      hideLoading();
      const elementToRemove = document.getElementById(conta.uid);
      if (elementToRemove) {
        elementToRemove.remove();
      }
      window.location.href = 'contas.html';
    })
    .catch((error) => {
      hideLoading();
      console.error('Erro ao remover conta:', error);
      alert('Erro ao remover conta');
    });
}

function isNewTransaction() {
  return !getTransactionUid(); // Retorna true se não houver UID na URL
}

function findcontasyUid(uid) {
  showLoading();

  db.collection('contas')
    .doc(uid)
    .get()
    .then((doc) => {
      hideLoading();
      if (doc.exists) {
        fillTransactionScreen(doc.data());
        toggleSaveButtonDisable();
      } else {
        alert('Documento não encontrado');
        window.location.href = 'contas.html'; // Redireciona para a página de contas
      }
    });
}

document
  .getElementById('transactionForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();
    saveTransaction();
  });

function getTransactionUid() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('uid');
}

function isNewTransaction() {
  return getTransactionUid() ? false : true;
}

function fillTransactionScreen(contas) {
  document.getElementById('conta').value = contas.type; // Campo correto é 'conta'
  document.getElementById('data').value = contas.data; // Campo correto é 'data'
  document.getElementById('valor').value = contas.valor; // Campo correto é 'valor'
}

function saveTransaction() {
  const contas = createTransaction();

  if (isNewTransaction()) {
    save(contas); // Salva uma nova conta
  } else {
    update(contas); // Atualiza uma conta existente
  }
}

function update(transaction) {
  operationInProgress = true;
  showLoading();
  const uid = getTransactionUid();

  db.collection('contas')
    .doc(uid)
    .set(transaction)
    .then(() => {
      hideLoading();
      operationInProgress = false;
      window.location.href = 'contas.html';
    })
    .catch(() => {
      hideLoading();
      operationInProgress = false;
      alert('Erro ao atualizar transação');
    });
}

function createTransaction() {
  return {
    type: document.getElementById('conta').value,
    data: document.getElementById('data').value,
    valor: parseFloat(document.getElementById('valor').value),
    user: {
      uid: firebase.auth().currentUser.uid,
    },
  };
}

function removeTransaction(contas) {
  operationInProgress = true;
  showLoading();

  const contaRef = db.collection('contas').doc(contas.uid);

  contasRef
    .delete()
    .then(() => {
      hideLoading();
      operationInProgress = false;
      const elementToRemove = document.getElementById(contas.uid);
      if (elementToRemove) {
        elementToRemove.remove();
      }
      window.location.href = 'contas.html';
    })
    .catch((error) => {
      hideLoading();
      operationInProgress = false;
      console.error('Erro ao remover transação:', error);
      alert('Erro ao remover transação');
    });
}

function save(transaction) {
  operationInProgress = true;
  showLoading();

  db.collection('contas')
    .add(transaction)
    .then(() => {
      hideLoading();
      operationInProgress = false;
      window.location.href = 'contas.html';
    })
    .catch(() => {
      hideLoading();
      operationInProgress = false;
      alert('Erro ao salvar transação');
    });
}
