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
    findtransacoes(user);
    if (!isNewTransaction()) {
      const uid = getTransactionUid();
      findtransacoesByUid(uid);
    }
  }
});

function findTransacoes(user) {
  firebase
    .firestore()
    .collection('transacoes')
    .where('user.uid', '==', user.uid) // Filtra as transações pelo UID do usuário logado
    .get()
    .then((snapshot) => {
      let transacoes = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));
      createDivsFortransacoes(transacoes);
    })
    .catch((error) => {
      console.error('Erro ao buscar transacoes: ', error);
    });
}

function createDivsFortransacoes(transacoes) {
  const parentDiv = document.getElementById('transacoescadastradas');

  if (!parentDiv) {
    console.error("Elemento com ID 'transacoescadastradas' não encontrado.");
    return;
  }

  parentDiv.innerHTML = '';

  let mainDiv = document.createElement('div');
  mainDiv.className = 'container';

  transacoes.forEach((conta) => {
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
      window.location.href = 'transacoes.html?uid=' + conta.uid;
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

    let tipodetransacao = document.createElement('div');
    tipodetransacao.className = 'row';
    tipodetransacao.innerHTML = `<div class="col"><span>Tipo de transação: ${conta.transactiontype}</span></div>`;
    contaDiv.appendChild(tipodetransacao);

    let descricao = document.createElement('div');
    descricao.className = 'row';
    descricao.innerHTML = `<div class="col"><span>Descrição: ${conta.description}</span></div>`;
    contaDiv.appendChild(descricao);

    let mes = document.createElement('span');
    mes.className = 'col';
    mes.innerHTML = `<div class="col"><span>Data: ${conta.data}</span></div>`;
    contaDiv.appendChild(mes);

    let saldoDiv = document.createElement('div');
    saldoDiv.className = 'row';
    saldoDiv.innerHTML = `<div class="col"><span>Saldo: R$ ${conta.valor}</span></div>`;
    contaDiv.appendChild(saldoDiv);

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

  const contaRef = db.collection('transacoes').doc(conta.uid);

  contaRef
    .delete()
    .then(() => {
      hideLoading();
      const elementToRemove = document.getElementById(conta.uid);
      if (elementToRemove) {
        elementToRemove.remove();
      }
      window.location.href = 'transacoes.html';
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

function findtransacoesByUid(uid) {
  showLoading();

  db.collection('transacoes')
    .doc(uid)
    .get()
    .then((doc) => {
      hideLoading();
      if (doc.exists) {
        fillTransactionScreen(doc.data());
        toggleSaveButtonDisable();
      } else {
        alert('Documento não encontrado');
        window.location.href = 'transacoes.html'; // Redireciona para a página de transacoes
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

function fillTransactionScreen(transacoes) {
  console.log(transacoes);
  document.getElementById('date').value = transacoes.data; // Campo correto é 'data'
  document.getElementById('value').value = transacoes.valor; // Campo correto é 'valor'
  document.getElementById('transaction-type').value =
    transacoes.transactiontype; // Campo correto é 'transaction-type'
  document.getElementById('description').value = transacoes.description; // Campo correto é 'description'

  // Definir o tipo de transação (Despesa ou Receita) com base no valor
  if (transacoes.type === 'Despesa') {
    document.getElementById('expense').checked = true;
  } else if (transacoes.type === 'Receita') {
    document.getElementById('income').checked = true;
  }
}

function saveTransaction() {
  const transacoes = createTransaction();

  if (isNewTransaction()) {
    save(transacoes); // Salva uma nova conta
  } else {
    update(transacoes); // Atualiza uma conta existente
  }
}

function update(transaction) {
  showLoading();
  const uid = getTransactionUid();

  db.collection('transacoes')
    .doc(uid)
    .set(transaction)
    .then(() => {
      hideLoading();
      window.location.href = 'transacoes.html';
    })
    .catch(() => {
      hideLoading();
      alert('Erro ao atualizar transação');
    });
}

function createTransaction() {
  // Verifica se os elementos existem antes de tentar acessar suas propriedades
  const typeElement = document.querySelector('input[name="type"]:checked');
  const type = typeElement ? typeElement.nextElementSibling.textContent : '';

  const dateElement = document.getElementById('date');
  const date = dateElement ? dateElement.value : '';

  const valorElement = document.getElementById('value');
  const valor = valorElement ? parseFloat(valorElement.value) : 0;

  const transactionTypeElement = document.getElementById('transaction-type');
  const transaction = transactionTypeElement
    ? transactionTypeElement.value
    : '';

  const descriptionElement = document.getElementById('description');
  const description = descriptionElement ? descriptionElement.value : '';

  return {
    type: type,
    data: date,
    valor: valor,
    transactiontype: transaction,
    description: description,
    user: {
      uid: firebase.auth().currentUser.uid,
    },
  };
}

function save(transaction) {
  showLoading();

  db.collection('transacoes')
    .add(transaction)
    .then(() => {
      hideLoading();
      window.location.href = 'transacoes.html';
    })
    .catch(() => {
      hideLoading();
      alert('Erro ao salvar transação');
    });
}

function removeTransaction(transacoes) {
  showLoading();

  const transacoesRef = db.collection('transacoes').doc(transacoes.uid);

  transacoesRef
    .delete()
    .then(() => {
      hideLoading();
      const elementToRemove = document.getElementById(transacoes.uid);
      if (elementToRemove) {
        elementToRemove.remove();
      }
      window.location.href = 'transacoes.html';
    })
    .catch((error) => {
      hideLoading();
      console.error('Erro ao remover transação:', error);
      alert('Erro ao remover transação');
    });
}

function showLoading() {
  // Implementar exibição de loading
}

function hideLoading() {
  // Implementar ocultação de loading
}

function toggleSaveButtonDisable() {
  document.getElementById('save-button').disabled = !isFormValid();
}

function isFormValid() {
  const date = document.getElementById('date').value;
  const valor = document.getElementById('valor').value;
  const transactionType = document.getElementById('transaction-type').value;

  return date && valor && transactionType;
}

function onChangeDate() {
  // Implementar lógica de validação ou outras ações quando a data é alterada
}

function onChangeValue() {
  // Implementar lógica de validação ou outras ações quando o valor é alterado
}

function onChangeTransactionType() {
  // Implementar lógica de validação ou outras ações quando o tipo de transação é alterado
}
