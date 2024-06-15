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
      .where('user.uid', '==', user.uid) // Filtra os documentos pelo UID do usuário logado
      .get()
      .then((snapshot) => {
        if (entry === 'transacoes') {
          // Filtrar e dividir transações em receitas e despesas
          let transacoes = snapshot.docs.map((doc) => doc.data());
          let receitas = transacoes.filter(
            (transacao) => transacao.type === 'Receita',
          );
          let despesas = transacoes.filter(
            (transacao) => transacao.type === 'Despesa',
          );

          results[entry] = { receitas, despesas };
        } else {
          results[entry] = snapshot.docs.map((doc) => doc.data());
        }
      });
  });

  Promise.all(promises).then(() => {
    let allEmpty = true;

    // Verifica se todos os arrays dentro de results estão vazios
    for (let key in results) {
      if (
        results[key].length > 0 ||
        (results[key].receitas && results[key].receitas.length > 0) ||
        (results[key].despesas && results[key].despesas.length > 0)
      ) {
        allEmpty = false;
        break;
      }
    }

    if (allEmpty) {
      const parentDiv = document.getElementById('collectionsDiv');
      parentDiv.innerHTML =
        '<div class="container banner text-banner">Não existem metas, contas ou transações cadastradas. Começe cadastrando suas METAS!<br><a type="button" class="btn btn-primary" href="item/metas.html">METAS</a></div>';
    } else {
      createDivsForCollections(results);
    }
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

function createCollectionDiv(collectionName, collectionData, parentDiv) {
  let collectionDiv = document.createElement('div');
  collectionDiv.className = 'col banner ' + collectionName;

  // Crie um título para a coleção
  let title = document.createElement('h4');
  title.textContent =
    collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
  collectionDiv.appendChild(title);

  let botaonovo = document.createElement('button');
  botaonovo.className = 'btn btn-primary float-right buttonclass';
  botaonovo.textContent = '+';
  botaonovo.addEventListener('click', () => {
    window.location.href = 'item/' + collectionName + '.html';
  });
  collectionDiv.appendChild(botaonovo);

  // Verifica o tipo de coleção e estrutura o HTML de acordo
  if (collectionName === 'metas') {
    // Estrutura para Metas de Economia
    collectionData.forEach((item) => {
      let divisa = document.createElement('br');
      let objetivo = document.createElement('span');
      objetivo.style = 'margin: 15px;';
      objetivo.textContent = `Objetivo: ${item.objetivo.toLocaleString(
        'pt-BR',
        { style: 'currency', currency: 'BRL' },
      )}`;
      collectionDiv.appendChild(divisa);
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
      saldoDiv.textContent = `Saldo: ${item.saldoinicial.toLocaleString(
        'pt-BR',
        { style: 'currency', currency: 'BRL' },
      )}`;
      prazoSaldoDiv.appendChild(saldoDiv);
      // Cria a barra de progresso
      let progresso = document.createElement('div');
      progresso.className = 'progress-bar-container';
      let progressoBarra = document.createElement('div');
      progressoBarra.className = 'progress-bar';
      let percentual = (item.saldoinicial / item.objetivo) * 100;
      progressoBarra.style.width = `${percentual}%`;
      progressoBarra.textContent = `${percentual.toFixed(2)}%`;
      progresso.appendChild(progressoBarra);
      prazoSaldoDiv.appendChild(progresso);

      collectionDiv.appendChild(prazoSaldoDiv);
      let divisa2 = document.createElement('br');
      collectionDiv.appendChild(divisa2);
    });
  } else if (collectionName === 'contas') {
    let divisa3 = document.createElement('br');
    collectionDiv.appendChild(divisa3);

    let divisa4 = document.createElement('br');
    collectionDiv.appendChild(divisa4);

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
      valueDiv.textContent = `Valor: ${item.valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}`;
      rowDiv.appendChild(valueDiv);

      collectionDiv.appendChild(rowDiv);
    });
  } else if (collectionName === 'transacoes') {
    // Obtém as divs existentes para despesas e receitas
    let despesasContainer = document.getElementById('despesas');
    let receitasContainer = document.getElementById('receitas');
    let geralmesContainer = document.getElementById('geralmes'); // Obtém a div geralmes

    // Verifica se as divs existem, se não, cria-as
    if (!despesasContainer) {
      despesasContainer = document.createElement('div');
      despesasContainer.id = 'despesas';
      despesasContainer.className = 'col banner despesas'; // Adiciona a classe para manter o estilo
      parentDiv.appendChild(despesasContainer);
    }
    if (!receitasContainer) {
      receitasContainer = document.createElement('div');
      receitasContainer.id = 'receitas';
      receitasContainer.className = 'col banner receitas'; // Adiciona a classe para manter o estilo
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
      totalSpan.textContent = `Total: ${totalAmount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}`;
      transacoesDiv.appendChild(totalSpan);

      let ul = document.createElement('ul');
      ul.className = 'list-group';

      if (transactions && transactions.length > 0) {
        transactions.forEach((item) => {
          let li = document.createElement('li');
          li.className = 'list-item';
          li.textContent = `${
            item.transactiontype
          }: ${item.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}`;
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
    let totalDespesas = 0;
    if (collectionData.despesas && collectionData.despesas.length > 0) {
      totalDespesas = collectionData.despesas.reduce(
        (acc, item) => acc + item.valor,
        0,
      );
      createTransactionList(
        collectionData.despesas,
        despesasContainer,
        'Despesas por Categoria:',
      );
    }

    // Adiciona as receitas
    let totalReceitas = 0;
    if (collectionData.receitas && collectionData.receitas.length > 0) {
      totalReceitas = collectionData.receitas.reduce(
        (acc, item) => acc + item.valor,
        0,
      );
      createTransactionList(
        collectionData.receitas,
        receitasContainer,
        'Receitas por Categoria:',
      );
    }

    // Adiciona os totais gerais na div geralmes
    if (geralmesContainer) {
      let resumoDiv = document.createElement('div');
      resumoDiv.className = 'col resumo-mes';

      let resumoTitle = document.createElement('h4');
      resumoTitle.textContent = 'Resumo do Mês';
      resumoDiv.appendChild(resumoTitle);

      let totalDespesasSpan = document.createElement('div');
      totalDespesasSpan.textContent = `Total Despesas: ${totalDespesas.toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        },
      )}`;
      resumoDiv.appendChild(totalDespesasSpan);

      let totalReceitasSpan = document.createElement('div');
      totalReceitasSpan.textContent = `Total Receitas: ${totalReceitas.toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        },
      )}`;
      resumoDiv.appendChild(totalReceitasSpan);

      // Adiciona o gráfico de pizza
      let canvas = document.createElement('canvas');
      canvas.id = 'resumoGrafico';
      canvas.className = 'canva-ajuste';
      canvas.style.width = '250px'; // Ajuste a largura desejada
      canvas.style.height = '250px'; // Ajuste a altura desejada
      resumoDiv.appendChild(canvas);

      geralmesContainer.appendChild(resumoDiv);

      // Cria o gráfico de pizza usando Chart.js
      let ctx = document.getElementById('resumoGrafico').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Despesas', 'Receitas'],
          datasets: [
            {
              data: [totalDespesas, totalReceitas],
              backgroundColor: ['#ff6384', '#36a2eb'],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });

      let saldoMesSpan = document.createElement('span');
      let saldoMes = totalReceitas - totalDespesas;
      saldoMesSpan.className = 'total';
      saldoMesSpan.textContent = `Saldo do Mês: ${saldoMes.toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        },
      )}`;
      resumoDiv.appendChild(saldoMesSpan);
    }
  }

  // Adicione a coleção à div pai
  parentDiv.appendChild(collectionDiv);
}
