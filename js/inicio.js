document.addEventListener('DOMContentLoaded', (event) => {
  setCurrentMonth();
  fetchInitialData(); // Fetch initial data with the current month
  findTransactions();
});

function setCurrentMonth() {
  const monthPicker = document.getElementById('monthPicker');
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  monthPicker.value = `${year}-${month}`;
}

function fetchInitialData() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const selectedMonth = document.getElementById('monthPicker').value;
      findTransactions(user, selectedMonth);
    }
  });
}

document.getElementById('fetchDataBtn').addEventListener('click', () => {
  const user = firebase.auth().currentUser;
  if (user) {
    const selectedMonth = document.getElementById('monthPicker').value;
    findTransactions(user, selectedMonth);
  }
});

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
    clearDivs();
  }
});

function findTransactions(user, selectedMonth) {
  // console.log('Selected Month:', selectedMonth); // Exibe o mês selecionado no console

  let collections = ['metas', 'contas', 'transacoes'];
  let results = {};

  let promises = collections.map(function (entry) {
    return firebase
      .firestore()
      .collection(entry)
      .where('user.uid', '==', user.uid) // Filtra os documentos pelo UID do usuário logado
      .get()
      .then((snapshot) => {
        if (entry === 'transacoes' || entry === 'contas') {
          // Filtrar e dividir transações em receitas e despesas ou contas
          let documents = snapshot.docs.map((doc) => doc.data());
          // Filtrar pelo mês selecionado
          let filteredDocuments = documents.filter((doc) => {
            if (entry === 'transacoes') {
              // Para transações, extraímos o mês e o ano da data completa
              let docDate = new Date(doc.data);
              let docMonth = `${docDate.getFullYear()}-${String(
                docDate.getMonth() + 1,
              ).padStart(2, '0')}`;
              return docMonth === selectedMonth;
            } else {
              // Para contas, comparamos diretamente o mês
              return doc.data === selectedMonth;
            }
          });

          if (entry === 'transacoes') {
            let receitas = filteredDocuments.filter(
              (transacao) => transacao.type === 'Receita',
            );
            let despesas = filteredDocuments.filter(
              (transacao) => transacao.type === 'Despesa',
            );

            results[entry] = { receitas, despesas };
          } else {
            results[entry] = filteredDocuments;
          }
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
      const parentDiv2 = document.getElementById('geralmes');
      parentDiv2.innerHTML =
        '<div class="container banner text-banner">Não existem transações criadas no momento. Preencha suas despesas e receitas clicando no botão abaixo!<br><a type="button" class="btn btn-primary" href="item/transacoes.html">Transações</a></div>';
    } else {
      createDivsForCollections(results);
    }
  });
}

function clearDivs() {
  const divsToClear = [
    'metas',
    'contas',
    'transacoes',
    'despesas',
    'receitas',
    'geralmes',
  ];
  divsToClear.forEach((divId) => {
    const div = document.getElementById(divId);
    if (div) {
      div.innerHTML = '';
    }
  });
}

function createDivsForCollections(results) {
  clearDivs();

  const parentDiv = document.getElementById('collectionsDiv');
  parentDiv.innerHTML = '';

  let mainDiv = document.createElement('div');
  mainDiv.className = 'container';

  for (let i = 0; i < Object.keys(results).length; i += 2) {
    let rowDiv = document.createElement('div');
    rowDiv.className = 'row base-banner';

    if (i < Object.keys(results).length) {
      let collectionName1 = Object.keys(results)[i];
      let collectionData1 = results[collectionName1];
      createCollectionDiv(collectionName1, collectionData1, rowDiv);
    }

    if (i + 1 < Object.keys(results).length) {
      let collectionName2 = Object.keys(results)[i + 1];
      let collectionData2 = results[collectionName2];
      createCollectionDiv(collectionName2, collectionData2, rowDiv);
    }

    mainDiv.appendChild(rowDiv);
  }

  parentDiv.appendChild(mainDiv);
}

function createCollectionDiv(collectionName, collectionData, parentDiv) {
  // console.log(collectionData);
  let collectionDiv = document.createElement('div');
  collectionDiv.className = 'col banner ' + collectionName;

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

  if (collectionName === 'metas') {
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

    let rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    let saldoTitleDiv = document.createElement('div');
    saldoTitleDiv.className = 'col';
    let saldoTitle = document.createElement('h4');
    saldoTitleDiv.appendChild(saldoTitle);
    rowDiv.appendChild(saldoTitleDiv);

    collectionDiv.appendChild(rowDiv);

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
    checkCollectionData(collectionData, collectionName);
    let despesasContainer = document.getElementById('despesas');
    let receitasContainer = document.getElementById('receitas');
    let geralmesContainer = document.getElementById('geralmes');

    if (!despesasContainer) {
      despesasContainer = document.createElement('div');
      despesasContainer.id = 'despesas';
      despesasContainer.className = 'col banner despesas';
      parentDiv.appendChild(despesasContainer);
    }
    if (!receitasContainer) {
      receitasContainer = document.createElement('div');
      receitasContainer.id = 'receitas';
      receitasContainer.className = 'col banner receitas';
      parentDiv.appendChild(receitasContainer);
    }

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

      let canvas = document.createElement('canvas');
      canvas.id = 'resumoGrafico';
      canvas.className = 'canva-ajuste';
      canvas.style.width = '250px';
      canvas.style.height = '250px';
      resumoDiv.appendChild(canvas);

      geralmesContainer.appendChild(resumoDiv);

      if (Chart.getChart('resumoGrafico')) {
        Chart.getChart('resumoGrafico').destroy();
      }

      let ctx = document.getElementById('resumoGrafico').getContext('2d');

      // Prepare the data for the pie chart
      let chartData = [];
      let chartLabels = [];
      let backgroundColors = [];

      collectionData.despesas.forEach((item) => {
        chartLabels.push(`Despesa: ${item.description}`);
        chartData.push(item.valor);
        backgroundColors.push('#ff6384'); // Red for expenses
      });

      collectionData.receitas.forEach((item) => {
        chartLabels.push(`Receita: ${item.description}`);
        chartData.push(item.valor);
        backgroundColors.push('#36a2eb'); // Blue for revenues
      });

      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: chartLabels,
          datasets: [
            {
              data: chartData,
              backgroundColor: backgroundColors,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
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

  parentDiv.appendChild(collectionDiv);
}

checkCollectionData(collectionData, collectionName);

function checkCollectionData(collectionData, collectionName) {
  if (collectionName === 'transacoes') {
    if (isCollectionDataEmpty(collectionData)) {
      // console.log(collectionData);
      clearDivs();
      const parentDiv2 = document.getElementById('nothinghere');
      parentDiv2.innerHTML =
        '<div class="container banner text-banner">Não existem transações criadas no momento. Preencha suas despesas e receitas clicando no botão abaixo!<br><a type="button" class="btn btn-primary" href="item/transacoes.html">Transações</a></div>';
    } else {
      const parentDiv3 = document.getElementById('nothinghere');
      parentDiv3.style = 'display: none;';
    }
  }
}

function isCollectionDataEmpty(data) {
  return data.receitas.length === 0 && data.despesas.length === 0;
}
