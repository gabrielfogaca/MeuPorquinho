function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = 'home.html';
    })
    .catch(() => {
      alert('Erro ao fazer logout');
    });
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    findTransactions(user);
  }
});

function findTransactions(user) {
  let collections = ['metas', 'contas', 'transacoes'];
  let results = {};

  let promises = collections.map(function (entry) {
    return firebase
      .firestore()
      .collection(entry)
      .get()
      .then((snapshot) => {
        if (entry === 'transacoes') {
          // Filtrar e dividir transações em receitas e despesas
          let transacoes = snapshot.docs.map((doc) => doc.data());
          let receitas = transacoes.filter(
            (transacao) => transacao.type === 'receita',
          );
          let despesas = transacoes.filter(
            (transacao) => transacao.type === 'despesa',
          );

          results[entry] = { receitas, despesas };
        } else {
          results[entry] = snapshot.docs.map((doc) => doc.data());
        }
      });
  });

  Promise.all(promises).then(() => {
    console.log(results);
    createDivsForCollections(results);
  });
}

function createDivsForCollections(results) {
  // Obtenha a referência da div pai onde você deseja adicionar as divs das coleções
  const parentDiv = document.getElementById('collectionsDiv');

  // Limpe o conteúdo atual da div pai, se houver
  parentDiv.innerHTML = '';

  // Crie a div principal
  let mainDiv = document.createElement('div');
  mainDiv.className = 'container';

  // Itere sobre as coleções em pares de duas
  for (let i = 0; i < Object.keys(results).length; i += 2) {
    // Crie uma nova div para cada par de coleções
    let rowDiv = document.createElement('div');
    rowDiv.className = 'row base-banner';

    // Verifique se há coleção suficiente para a primeira coluna
    if (i < Object.keys(results).length) {
      let collectionName1 = Object.keys(results)[i];
      let collectionData1 = results[collectionName1];
      createCollectionDiv(collectionName1, collectionData1, rowDiv);
    }

    // Verifique se há coleção suficiente para a segunda coluna
    if (i + 1 < Object.keys(results).length) {
      let collectionName2 = Object.keys(results)[i + 1];
      let collectionData2 = results[collectionName2];
      createCollectionDiv(collectionName2, collectionData2, rowDiv);
    }

    // Adicione a rowDiv à div principal
    mainDiv.appendChild(rowDiv);
  }

  // Adicione a div principal à div pai
  parentDiv.appendChild(mainDiv);
}

// Função para criar uma div de coleção (como Metas, Contas, Transações, etc.)
function createDivsForCollections(results) {
  // Obtenha a referência da div pai onde você deseja adicionar as divs das coleções
  const parentDiv = document.getElementById('collectionsDiv');

  // Limpe o conteúdo atual da div pai, se houver
  parentDiv.innerHTML = '';

  // Crie a div principal
  let mainDiv = document.createElement('div');
  mainDiv.className = 'container';

  // Itere sobre as coleções em pares de duas
  for (let i = 0; i < Object.keys(results).length; i += 2) {
    // Crie uma nova div para cada par de coleções
    let rowDiv = document.createElement('div');
    rowDiv.className = 'row base-banner s' + i;

    // Verifique se há coleção suficiente para a primeira coluna
    if (i < Object.keys(results).length) {
      let collectionName1 = Object.keys(results)[i];
      let collectionData1 = results[collectionName1];
      createCollectionDiv(collectionName1, collectionData1, rowDiv);
    }

    // Verifique se há coleção suficiente para a segunda coluna
    if (i + 1 < Object.keys(results).length) {
      let collectionName2 = Object.keys(results)[i + 1];
      let collectionData2 = results[collectionName2];
      createCollectionDiv(collectionName2, collectionData2, rowDiv);
    }

    // Adicione a rowDiv à div principal
    mainDiv.appendChild(rowDiv);
  }

  // Adicione a div principal à div pai
  parentDiv.appendChild(mainDiv);
}

// Função para criar uma div de coleção (como Metas, Contas, Transações, etc.)
function createCollectionDiv(collectionName, collectionData, parentDiv) {
  let collectionDiv = document.createElement('div');
  collectionDiv.className = 'col banner ' + collectionName;

  // Crie um título para a coleção
  let title = document.createElement('h4');
  title.textContent =
    collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
  collectionDiv.appendChild(title);

  // Verifica o tipo de coleção e estrutura o HTML de acordo
  if (collectionName === 'metas') {
    // Estrutura para Metas de Economia
    collectionData.forEach((item) => {
      let objetivo = document.createElement('span');
      objetivo.textContent = `Objetivo: R$ ${item.objetivo}`;
      collectionDiv.appendChild(objetivo);

      let prazoSaldoDiv = document.createElement('div');
      prazoSaldoDiv.className = 'row';

      let prazoDiv = document.createElement('div');
      prazoDiv.className = 'col';
      prazoDiv.innerHTML = `<span>Prazo: ${new Date(
        item.prazo,
      ).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</span>`;
      prazoSaldoDiv.appendChild(prazoDiv);

      let saldoDiv = document.createElement('div');
      saldoDiv.className = 'col totais';
      saldoDiv.textContent = `Saldo: R$ ${item.saldoincial}`;
      prazoSaldoDiv.appendChild(saldoDiv);

      collectionDiv.appendChild(prazoSaldoDiv);
    });
  } else if (collectionName === 'contas') {
    // Estrutura para Saldo em Conta
    let rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    let saldoTitleDiv = document.createElement('div');
    saldoTitleDiv.className = 'col';
    let saldoTitle = document.createElement('h4');
    saldoTitleDiv.appendChild(saldoTitle);
    rowDiv.appendChild(saldoTitleDiv);

    collectionDiv.appendChild(rowDiv);

    // Itens individuais de contas
    collectionData.forEach((item) => {
      let rowDiv = document.createElement('div');
      rowDiv.className = 'row';

      let itemCodeDiv = document.createElement('div');
      itemCodeDiv.className = 'col-1';
      itemCodeDiv.textContent = 'xx';
      rowDiv.appendChild(itemCodeDiv);

      let typeDiv = document.createElement('div');
      typeDiv.className = 'col';
      typeDiv.textContent = item.type;
      rowDiv.appendChild(typeDiv);

      let valueDiv = document.createElement('div');
      valueDiv.className = 'col totais';
      valueDiv.textContent = `Valor:  R$ ${item.valor}`;
      rowDiv.appendChild(valueDiv);

      collectionDiv.appendChild(rowDiv);
    });
  } else if (collectionName === 'transacoes') {
    // Obtém as divs existentes para despesas e receitas
    let despesasContainer = document.getElementById('despesas');
    let receitasContainer = document.getElementById('receitas');

    // Verifica se as divs existem, se não, cria-as
    if (!despesasContainer) {
      despesasContainer = document.createElement('div');
      despesasContainer.id = 'despesas';
      despesasContainer.className = 'col banner'; // Adiciona a classe para manter o estilo
      parentDiv.appendChild(despesasContainer);
    }
    if (!receitasContainer) {
      receitasContainer = document.createElement('div');
      receitasContainer.id = 'receitas';
      receitasContainer.className = 'col banner'; // Adiciona a classe para manter o estilo
      parentDiv.appendChild(receitasContainer);
    }

    // Função para criar a lista de transações
    function createTransactionList(transactions, container, title) {
      let transacoesDiv = document.createElement('div');
      transacoesDiv.className = 'col';

      let transacoesTitle = document.createElement('h4');
      transacoesTitle.textContent = title;
      transacoesDiv.appendChild(transacoesTitle);

      let totalAmount = transactions.reduce((acc, item) => acc + item.valor, 0);
      let totalSpan = document.createElement('span');
      totalSpan.className = 'total';
      totalSpan.textContent = `Total: R$ ${totalAmount.toFixed(2)}`;
      transacoesDiv.appendChild(totalSpan);

      let ul = document.createElement('ul');
      ul.className = 'list-group';

      if (transactions && transactions.length > 0) {
        transactions.forEach((item) => {
          let li = document.createElement('li');
          li.className = 'list-item';
          li.textContent = `${item.transactiontype}: R$ ${item.valor}`;
          ul.appendChild(li);
        });
      } else {
        let li = document.createElement('li');
        li.className = 'list-item';
        li.textContent = `Não há ${title.toLowerCase()} para mostrar.`;
        ul.appendChild(li);
      }

      transacoesDiv.appendChild(ul);
      container.appendChild(transacoesDiv);
    }

    // Adiciona as despesas
    if (collectionData.despesas && collectionData.despesas.length > 0) {
      createTransactionList(
        collectionData.despesas,
        despesasContainer,
        'Despesas por Categoria:',
      );
    }

    // Adiciona as receitas
    if (collectionData.receitas && collectionData.receitas.length > 0) {
      createTransactionList(
        collectionData.receitas,
        receitasContainer,
        'Receitas por Categoria:',
      );
    }
  }

  // Adicione a coleção à div pai
  parentDiv.appendChild(collectionDiv);
}
