import {getContactById, getDataClients} from './api.js';
import { setAttributes, replaceDate, calcMargin } from './any.js';
import { createModal } from './modal.js';

const HOME_URL = '#';
const APP_TITLE = 'Клиенты';

const tContent = createTable();

// GET DATA FROM API
let dataPromise = new Promise( resolve => {
    tContent.tBody.innerHTML = `<tr>...Download</tr>`;
    let clientsList = getDataClients();
    resolve(clientsList);
});
dataPromise.then( list => {
    createTableBody(list);
});

// CREATE CRM APP
(()=>{
    const body = document.body;
    const header = createHeader();
    const content = createMainBlock();
    const addBtn = createSectionBtn();

    content.container.append(tContent.table, addBtn);
    body.append(header, content.main);
    calcMargin();
})();

// CREATE HEADER APP
function createHeader () {
    const formSearch = createFormSearch();
    const header = document.createElement('header');
    const container = document.createElement('div');
    const logo = document.createElement('a');

    header.classList.add('header');
    container.classList.add('container','header__container','d-flex');
    logo.classList.add('header__logo');

    setAttributes(logo, {
        'href': HOME_URL,
        'target': '_blank',
    });

    container.append(logo, formSearch);
    header.append(container);

    return header;
}

// CREATE SEARCH FORM FOR HEADER
function createFormSearch () {
    const formSearch = document.createElement('form');
    const inputSearch = document.createElement('input');

    formSearch.classList.add('header__form-search', 'form-search');
    setAttributes(inputSearch, {
        'type': 'text',
        'placeholder': 'Введите запрос',
        'class': 'form-search__input'
    });

    formSearch.append(inputSearch);

    return formSearch;
}

// CREATE BODY APP
function createMainBlock() {
    const sectionTitle = createTitle();
    const main = document.createElement('main');
    const section = document.createElement('section');
    const container = document.createElement('div');

    main.classList.add('main');
    section.classList.add('section');
    container.classList.add('container', 'section__container');

    container.append(sectionTitle);
    section.append(container);
    main.append(section);

    return { main, container };
}

// CREATE APP TITLE
function createTitle() {
    const title = document.createElement('h1');
    title.classList.add('section__title');
    title.textContent = APP_TITLE;
    return title;
}

// CREATE TABLE FOR DATA
function createTable() {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tBody = document.createElement('tbody');
    const headRow = document.createElement('tr');

    table.classList.add('section__table', 'table');
    thead.classList.add('table__head');
    tBody.classList.add('table__body');
    headRow.classList.add('table__row');

    const dataTitle = ['ID', 'Фамилия Имя Отчество', 'Дата и время создания', 'Последние изменения', 'Контакты', 'Действия'];

    dataTitle.forEach((title) => {
        const headData = document.createElement('th');
        const span = document.createElement('span');
        headData.classList.add('table__data-head');
        span.textContent = title;
        headData.append(span);
        headRow.append(headData);
    })

    table.addEventListener('click', function (e) {

        const target = e.target;
        let activeBtn = this.querySelectorAll('.contacts__btn');
        activeBtn.forEach( btn => {
            if(btn !== target)
                btn.classList.remove('active');
        })

        if(target.classList.contains('contacts__btn')) {
            target.classList.toggle('active');
        }

        if(target.classList.contains('action__btn_change') || target.classList.contains('action__btn_delete')) {
            const idClient = e.path[3].querySelector('td').textContent;
            getContactById(idClient)
                .then( data => {
                    createModal(target, data);
                });
        }
    })
    thead.append(headRow);
    table.append(thead, tBody);
    return { table, tBody };
}

// CREATE TABLE CONTENT
function createTableBody (data) {
    let tBodyRow;
    const check = Array.isArray(data)

    if(check && data.length === 0) {
        tContent.tBody.innerHTML = '';
        tBodyRow = document.createElement('tr');
        tBodyRow.innerHTML = `<td class="table__message" COLSPAN=6>Пришло время добавить первого клиента! Жми кнопку скорее!</td>`;
        tContent.tBody.append(tBodyRow)
        tContent.table.append(tContent.tBody);
        return;
    }

    if(check) {
        tContent.tBody.innerHTML = '';
        data.forEach( el => {
            tBodyRow = createClientData(el);
            tContent.tBody.append(tBodyRow)
        })
    } else {
        if(tContent.tBody.querySelector('.table__message'))
            tContent.tBody.innerHTML = '';
        tBodyRow = createClientData(data);
    }
    tContent.tBody.append(tBodyRow)
    tContent.table.append(tContent.tBody);
    calcMargin();
}

// CREATE CLIENT DATA
function createClientData( dataObj ) {
    const copyObj = Object.assign({}, dataObj);
    const rowData = document.createElement('tr');
    const tdId = document.createElement('td');
    const tdFullName = document.createElement('td');
    const tdCreateDate = document.createElement('td');
    const tdChangeDate = document.createElement('td');
    const tdContacts = document.createElement('td');
    const tdAction = document.createElement('td');
    const contactList = createContactsBlock(copyObj.contacts);
    const btnWrapper = document.createElement('div');
    const changeBtn = document.createElement('button');
    const deleteBtn = document.createElement('button');
    contactList.classList.add('table__contacts', 'contacts', 'd-flex');
    [tdId, tdFullName, tdCreateDate, tdChangeDate, tdContacts, tdAction].forEach( el => {
        el.classList.add('table__data-body');
    })

    changeBtn.dataset.action = 'change';
    deleteBtn.dataset.action = 'delete';

    rowData.classList.add('table__row');
    btnWrapper.classList.add('table__action', 'action', 'd-flex');
    changeBtn.classList.add('action__btn', 'action__btn_change');
    deleteBtn.classList.add('action__btn', 'action__btn_delete');

    changeBtn.textContent = 'Изменить';
    deleteBtn.textContent = 'Удалить';

    btnWrapper.append(changeBtn, deleteBtn);
    tdAction.append(btnWrapper);

    copyObj.fullName = () => {
        const { name, surname, lastName } = copyObj;
        return surname + ' ' + name + ' ' + lastName;
    }
    copyObj.startDate = () => {
        const { createdAt } = copyObj;
        return replaceDate( createdAt );
    }
    copyObj.changeDate = () => {
        const { updatedAt } = copyObj;
        return replaceDate( updatedAt );
    }

    const { date: dateStart, time: timeStart } = copyObj.startDate();
    const { date: dateChange, time: timeChange } = copyObj.changeDate();

    tdId.textContent = copyObj.id;
    tdFullName.textContent = copyObj.fullName();
    tdCreateDate.innerHTML = dateStart + `<span>` + timeStart + `</span>`;
    tdChangeDate.innerHTML = dateChange + `<span>` + timeChange + `</span>`;

    tdContacts.append(contactList);

    rowData.append(
        tdId,
        tdFullName,
        tdCreateDate,
        tdChangeDate,
        tdContacts,
        tdAction
    )

    return rowData;
}

// CREATE CONTACTS BLOCK FOR CLIENT DATA
function createContactsBlock(contacts) {
    const contactList = document.createElement('div');

    contacts.forEach( contact => {
        const btn = document.createElement('button');
        const tooltip = document.createElement('div');
        const linkDescr = document.createElement('span');
        const link = document.createElement('a');

        link.classList.add('contacts__link');
        btn.classList.add('contacts__btn');
        tooltip.classList.add('contacts__tooltip');

        btn.dataset.social = contact.type;

        switch (contact.type) {
            case 'phone':
            case 'addPhone':
                link.setAttribute('href', `tel:${ contact.value }`);
                linkDescr.textContent = 'Телефон:';
                link.textContent = contact.value;
                break;
            case 'mail':
                link.setAttribute('href', `mailto:${ contact.value }`)
                linkDescr.textContent = 'E-mail:';
                link.textContent = contact.value;
                break;
            case 'fb':
                link.setAttribute('href', `${ contact.value }`);
                link.setAttribute('target', '_blank');
                linkDescr.textContent = 'Facebook:';
                link.textContent = contact.value;
                break;
            case 'vk':
                link.setAttribute('href', `${ contact.value }`);
                link.setAttribute('target', '_blank');
                linkDescr.textContent = 'Vk:';
                link.textContent = contact.value;
                break;
            case 'other':
                let valArr = contact.value.split(',');
                link.setAttribute('href', `${ valArr[1] }`);
                link.setAttribute('target', '_blank');
                linkDescr.textContent = `${valArr[0]}:`;
                link.textContent = valArr[1]
                break;
        }

        tooltip.append(linkDescr, link);
        btn.append(tooltip);
        contactList.append(btn);
    })
    return contactList;
}

// CREATE ADD CLIENT BUTTON
function createSectionBtn () {
    const btn = document.createElement('button');
    btn.classList.add('section__btn');
    btn.innerHTML = 'Добавить клиента';
    btn.dataset.action = 'add';
    btn.addEventListener('click', event => {
        createModal( event.target, null );
    })
    return btn;
}

export { createTableBody }