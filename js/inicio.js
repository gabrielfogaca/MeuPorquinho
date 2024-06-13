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
  let collections = [
    'metas',
    'transacoes',
    'contas',
    'Despesas',
    'Receitas',
    'users',
  ];
  let results = {};

  let promises = collections.map(function (entry) {
    return firebase
      .firestore()
      .collection(entry)
      .get()
      .then((snapshot) => {
        results[entry] = snapshot.docs.map((doc) => doc.data());
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

  // Itere sobre cada coleção em results
  for (const [collectionName, collectionData] of Object.entries(results)) {
    // Crie uma nova div para a coleção
    let collectionDiv = document.createElement('div');
    collectionDiv.id = collectionName; // Defina um ID para a div baseada no nome da coleção
    collectionDiv.className = 'collection-div'; // Adicione uma classe para estilização, se necessário

    // Crie um título para a coleção
    let title = document.createElement('h2');
    title.textContent =
      collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
    collectionDiv.appendChild(title);

    // Crie elementos HTML para cada item na coleção
    collectionData.forEach((item) => {
      let itemDiv = document.createElement('div');
      itemDiv.className = 'item-div';

      // Itere sobre as propriedades do objeto e crie elementos para cada par chave-valor
      for (const [key, value] of Object.entries(item)) {
        let p = document.createElement('p');
        p.textContent = `${key}: ${value}`;
        itemDiv.appendChild(p);
      }

      collectionDiv.appendChild(itemDiv);
    });

    // Adicione a div da coleção à div pai
    parentDiv.appendChild(collectionDiv);
  }
}
