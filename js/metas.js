firebase.initializeApp(firebaseConfig);
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
    findMetas(user);
  }
});

function findMetas(user) {
  firebase
    .firestore()
    .collection('metas')
    .where('user.uid', '==', user.uid) // Filtrar as metas pelo UID do usuário logado
    .get()
    .then((snapshot) => {
      let metas = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));
      createDivsForMetas(metas);
    })
    .catch((error) => {
      console.error('Error fetching metas: ', error);
    });
}

function createDivsForMetas(metas) {
  // Obtenha a referência da div pai onde você deseja adicionar as divs das metas
  const parentDiv = document.getElementById('metascadastradas');

  // Verifique se parentDiv existe
  if (!parentDiv) {
    console.error("Elemento com ID 'collectionsDiv' não encontrado.");
    return;
  }

  // Limpe o conteúdo atual da div pai, se houver
  parentDiv.innerHTML = '';

  // Crie a div principal
  let mainDiv = document.createElement('div');
  mainDiv.className = 'container';

  metas.forEach((meta) => {
    let metaDiv = document.createElement('div');
    metaDiv.className = 'col banner';

    //título para a meta
    let title = document.createElement('h4');
    title.textContent = 'Meta de Economia';
    metaDiv.appendChild(title);

    //botao de editar
    let botao = document.createElement('button');
    botao.type = 'submit';
    botao.className = 'editar btn btn-primary';
    botao.id = 'editar';
    botao.addEventListener('click', () => {
      window.location.href = 'metas.html?uid=' + meta.uid;
    });
    botao.innerHTML = 'Editar';
    metaDiv.appendChild(botao);

    //botao de excluir
    let botaoz = document.createElement('button');
    botaoz.type = 'submit';
    botaoz.className = 'excluir btn btn-danger';
    botaoz.id = 'Excluir';
    botaoz.addEventListener('click', (event) => {
      event.stopPropagation();
      askRemoveTransaction(meta);
    });
    botaoz.innerHTML = 'Excluir';
    metaDiv.appendChild(botaoz);

    // Exibir o objetivo separadamente
    let objetivoDiv = document.createElement('div');
    objetivoDiv.className = 'row';
    objetivoDiv.innerHTML = `<div class="col"><span>Objetivo: R$ ${meta.objetivo}</span></div>`;
    metaDiv.appendChild(objetivoDiv);

    // Criar a div para prazo e saldo
    let prazoSaldoDiv = document.createElement('div');
    prazoSaldoDiv.className = 'row';

    // Div para o prazo
    let prazoDiv = document.createElement('div');
    prazoDiv.className = 'col';
    prazoDiv.innerHTML = `<span>Prazo: ${new Date(
      meta.prazo,
    ).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}</span>`;
    prazoSaldoDiv.appendChild(prazoDiv);

    // Div para o saldo
    let saldoDiv = document.createElement('div');
    saldoDiv.className = 'col saldoini';
    console.log(meta);
    saldoDiv.textContent = `Saldo Inicial: R$ ${meta.saldoinicial}`;
    saldoDiv;
    prazoSaldoDiv.appendChild(saldoDiv);

    // Adicionar prazo e saldo à div principal da meta
    metaDiv.appendChild(prazoSaldoDiv);

    // Adicionar metaDiv ao mainDiv
    mainDiv.appendChild(metaDiv);
  });

  // Adicionar a div principal ao parentDiv
  parentDiv.appendChild(mainDiv);
}

document
  .getElementById('transactionForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();
    saveTransaction();
  });

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    if (!isNewTransaction()) {
      const uid = getTransactionUid();
      findTransactionByUid(uid);
    }
  }
});

function getTransactionUid() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('uid');
}

function isNewTransaction() {
  return getTransactionUid() ? false : true;
}

function findTransactionByUid(uid) {
  showLoading();

  db.collection('metas')
    .doc(uid)
    .get()
    .then((doc) => {
      hideLoading();
      if (doc.exists) {
        fillTransactionScreen(doc.data());
        toggleSaveButtonDisable();
      } else {
        alert('Documento não encontrado');
        window.location.href = 'metas.html';
      }
    })
    .catch(() => {
      hideLoading();
      alert('Erro ao recuperar documento');
      window.location.href = 'metas.html';
    });
}

function fillTransactionScreen(transaction) {
  document.getElementById('objetivo').value = transaction.objetivo;
  document.getElementById('prazo').value = transaction.prazo;
  document.getElementById('saldoinicial').value = transaction.saldoinicial;
}

function saveTransaction() {
  const transaction = createTransaction();

  if (isNewTransaction()) {
    save(transaction);
  } else {
    update(transaction);
  }
}

function save(transaction) {
  showLoading();

  db.collection('metas')
    .add(transaction)
    .then(() => {
      hideLoading();
      window.location.href = 'metas.html';
    })
    .catch(() => {
      hideLoading();
      alert('Erro ao salvar transação');
    });
}

function update(transaction) {
  showLoading();
  const uid = getTransactionUid();

  db.collection('metas')
    .doc(uid)
    .set(transaction)
    .then(() => {
      hideLoading();
      window.location.href = 'metas.html';
    })
    .catch(() => {
      hideLoading();
      alert('Erro ao atualizar transação');
    });
}

function createTransaction() {
  return {
    objetivo: document.getElementById('objetivo').value,
    prazo: document.getElementById('prazo').value,
    saldoinicial: parseFloat(document.getElementById('saldoinicial').value),
    user: {
      uid: firebase.auth().currentUser.uid,
    },
  };
}

function showLoading() {
  // Implementar exibição de loading
}

function hideLoading() {
  // Implementar ocultação de loading
}

function toggleSaveButtonDisable() {
  document.querySelector('button[type="submit"]').disabled = !isFormValid();
}

function isFormValid() {
  const objetivo = document.getElementById('objetivo').value;
  const prazo = document.getElementById('prazo').value;
  const saldo = document.getElementById('saldoinicial').value;

  return objetivo && prazo && saldo;
}

function askRemoveTransaction(meta) {
  const shouldRemove = confirm(
    'Deseja remover a Meta de R$ ' + meta.objetivo + '?',
  );
  if (shouldRemove) {
    removeTransaction(meta);
  }
}

function removeTransaction(meta) {
  showLoading();

  // Obtém uma referência para o documento que você deseja remover
  const metaRef = db.collection('metas').doc(meta.uid);

  // Remove o documento usando o método delete()
  metaRef
    .delete()
    .then(() => {
      hideLoading();
      // Remove o elemento do DOM pelo seu ID
      const elementToRemove = document.getElementById(meta.uid);
      if (elementToRemove) {
        elementToRemove.remove();
      }
      window.location.href = 'metas.html';
    })
    .catch((error) => {
      hideLoading();
      console.error('Erro ao remover transação:', error);
      alert('Erro ao remover transação');
    });
}
