function getDataClients () {
    return  fetch('http://localhost:3000/api/clients')
        .then( res => res.json());
}

function getContactById (idClient) {
  return  fetch(`http://localhost:3000/api/clients/${idClient}`)
        .then( res => res.json());
}

function saveClientData (obj) {
    return fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(obj)
    }).then( res => res.json());
}

async function changeClientData (idClient, { obj }) {
    if(!obj.contacts)
        obj.contacts = [];
    await fetch(`http://localhost:3000/api/clients/${idClient}`, {
        method: 'PATCH',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
            name: obj.name,
            surname: obj.surname,
            lastName: obj.lastName,
            contacts: obj.contacts
        })
    })
    return getDataClients();
}

async function deleteClientData (idClient) {
    await fetch(`http://localhost:3000/api/clients/${idClient}`, {
        method: 'DELETE',
    });
    return getDataClients();
}

export { getDataClients, saveClientData, getContactById, changeClientData, deleteClientData };