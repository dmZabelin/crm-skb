import { setAttributes, createObj } from './any.js';
import { saveClientData, changeClientData, deleteClientData} from './api.js';
import { createTableBody } from './view.js';
let count = 0;
const LIMIT_OTHER_CONTACT = 10;

// CREATE MODAL
function createModal ( btn, obj ) {
   if(document.body.querySelector('.modal'))
      return;
   const ADD_FORM_TITLE = 'Новый клиент';
   const DEL_FORM_TITLE = 'Удалить клиента';
   const CHANGE_FORM_TITLE = 'Изменить данные';
   const modalBody = document.createElement('div');
   const modalContent = document.createElement('div');
   const modalClose = document.createElement('span');
   const formTitle = document.createElement('h3')
   const dataAction = btn.dataset.action;
   if(obj)
      modalBody.dataset.id = obj.id;

   let form = createForm(dataAction, obj);

   switch (dataAction) {
      case 'add':
         formTitle.textContent = ADD_FORM_TITLE;
         break;
      case 'change':
         formTitle.innerHTML = CHANGE_FORM_TITLE + `<span> ID: ${ obj.id } </span>`;
         break;
      case 'delete':
         formTitle.classList.add('modal__title_del');
         formTitle.textContent = DEL_FORM_TITLE;
         break;
   }

   modalBody.classList.add('modal');
   modalContent.classList.add('modal__content');
   modalClose.classList.add('modal__close');
   formTitle.classList.add('modal__title');
   modalClose.dataset.close = '';

   modalContent.append(formTitle, form, modalClose);
   modalBody.append(modalContent);
   document.body.append(modalBody);

   modalBody.addEventListener('click', modalListener);
   modalBody.addEventListener('input', modalListener);
   modalBody.addEventListener('submit', modalListener);
}

// CREATE MODAL WINDOW FORM
function createForm (action, obj) {
   let form = document.createElement('form');
   const surnameLabel = document.createElement('label');
   const nameLabel = document.createElement('label');
   const middleLabel = document.createElement('label');
   const surnameInput = document.createElement('input');
   const nameInput = document.createElement('input');
   const middleInput= document.createElement('input');
   const surnameTxt = document.createElement('span');
   const nameTxt = document.createElement('span');
   const middleTxt = document.createElement('span');
   const formContacts = document.createElement('div');
   const formContactsWrap = document.createElement('div');
   const formAddBtn = document.createElement('button');
   const formSaveBtn = document.createElement('button');
   const formResetBtn = document.createElement('button');

   form.classList.add('modal__form', 'form');
   formContactsWrap.classList.add('form__contacts-wrap');
   surnameLabel.classList.add('form__label', 'form__label_surname');
   nameLabel.classList.add('form__label', 'form__label_name');
   middleLabel.classList.add('form__label');
   setAttributes(surnameInput, {'type': 'text', 'name': 'surname', 'class': 'form__input','autocomplete': 'off'});
   setAttributes(nameInput, {'type': 'text', 'name': 'name', 'class': 'form__input', 'autocomplete': 'off'});
   setAttributes(middleInput, {'type': 'text', 'name': 'lastName', 'class': 'form__input', 'autocomplete': 'off'});
   formContacts.classList.add('form__contacts');
   formAddBtn.classList.add('form__add-btn');
   formAddBtn.setAttribute('type', 'button');
   formSaveBtn.classList.add('form__save-btn');
   formSaveBtn.setAttribute('type', 'submit');
   formResetBtn.classList.add('form__reset-btn');
   formResetBtn.setAttribute('type', 'button');

   formResetBtn.dataset.close = '';
   formAddBtn.dataset.btn = 'add';
   formResetBtn.dataset.action = 'reset';
   formSaveBtn.dataset.action = 'save';

   surnameTxt.textContent = 'Фамилия';
   nameTxt.textContent = 'Имя';
   middleTxt.textContent = 'Отчество';
   formAddBtn.textContent = 'Добавить контакт';
   formSaveBtn.textContent = 'Сохранить';
   formResetBtn.textContent = 'Отмена';

   surnameLabel.append(surnameInput, surnameTxt);
   nameLabel.append(nameInput, nameTxt);
   middleLabel.append(middleInput, middleTxt);
   formContacts.append(formContactsWrap, formAddBtn)
   form.append(surnameLabel, nameLabel, middleLabel, formContacts, formSaveBtn, formResetBtn);

   if(obj !== null && action === 'change') {
      [surnameLabel, nameLabel, middleLabel].forEach( el => {
         el.classList.add('scale');
      })
      surnameInput.value = obj.surname;
      nameInput.value = obj.name;
      middleInput.value = obj.lastName;
      obj.contacts.forEach( obj => {
        let contact = createOtherContacts(formAddBtn, obj);
         formContactsWrap.append(contact);
      })
      formResetBtn.textContent = 'Удалить клиента';
      formResetBtn.dataset.action = 'delete';
      formResetBtn.removeAttribute('data-close');
      formSaveBtn.dataset.action = 'change';
   }
   if(obj !== null && action === 'delete') {
      form.innerHTML = '';
      const formDescr = document.createElement('p');
      formDescr.textContent = 'Вы действительно хотите удалить данного клиента?';
      formSaveBtn.textContent = 'Удалить';
      formSaveBtn.dataset.action = 'delete';
      form.append(formDescr, formSaveBtn, formResetBtn);
   }
   return  form;
}

// LISTEN MODAL WINDOW
function modalListener (e) {
   const target = e.target;

// RESET SUBMIT EVENT
   if(e.type === 'submit') {
      return;
   }

// STYLES FOR INPUT
   if(target.classList.contains('form__input')) {
      if(e.type === 'input') {
         target.parentNode.classList.add('scale');
         if(!target.value.length) {
            target.parentNode.classList.remove('scale');
         }
      }
   }

// CREATE ADDITIONAL CONTACTS
   if(target.dataset.btn === 'add') {
      const otherContacts = createOtherContacts(target,{});
      e.path[1].children[0].append(otherContacts);
   }

// SHOW/HIDE CLOSE BUTTON
   if(target.classList.contains('other-contacts__input')) {
      e.path[1].lastChild.hidden
         = target.value.length === 0;
   }

// REMOTE ADDITIONAL CONTACTS
   if(target.classList.contains('other-contacts__close')) {
      e.path[1].remove();
      count--;
      hideShowAddBtn(e.path[3].lastChild, count);
   }

// SAVE CLIENT DATA
   if(target.dataset.action === 'save') {
      e.preventDefault();
      let saveData = new Promise( resolve => {
         const obj = createObj(e.path[1]);
         const clientData = saveClientData(obj);
         resolve(clientData)
      });
      saveData.then( data => {
         createTableBody(data);
         deleteModal(this);
      });
   }

// CHANGE CLIENT DATA
   if(target.dataset.action === 'change') {
      e.preventDefault();
      const idClient = this.dataset.id;
      let changeData = new Promise( resolve => {
         const obj = createObj(e.path[1]);
         console.log(obj)
         const clientData = changeClientData(idClient, { obj } );
         resolve(clientData)
      });
      changeData.then( data => {
         createTableBody(data);
         deleteModal(this);
      });
   }

// DELETE CLIENT DATA
   if(target.dataset.action === 'delete') {
      e.preventDefault();
      const idClient = this.dataset.id;
      let deleteData = new Promise( resolve => {
         const clientData = deleteClientData(idClient);
         resolve(clientData)
      });
      deleteData.then( data => {
         createTableBody(data);
         deleteModal(this);
      });
   }

// DELETE MODAL
   if(this === target || target.hasAttribute('data-close')) {
      deleteModal(this);
   }
}

// CREATE INPUT FIELD FOR ADDITIONAL CONTACTS
function createOtherContacts (btn, { type='phone', value= '' }) {
   const otherContacts = document.createElement('div');
   otherContacts.classList.add('form__other-contacts', 'other-contacts', 'd-flex');
   const select = createSelect(type);
   const input = document.createElement('input');
   const deleteOtherContacts = document.createElement('span');

   setAttributes(input, {
      'type': 'text',
      'placeholder': 'Введите данные контакта',
      'class': 'other-contacts__input',
      'name': type,
      'autocomplete': 'off'
   });

   input.value = value;

   deleteOtherContacts.classList.add('other-contacts__close');
   deleteOtherContacts.hidden = !input.value;

  otherContacts.append(select, input, deleteOtherContacts);
   count++;
   hideShowAddBtn(btn, count);
   return otherContacts;
}

// CREATE CUSTOM SELECT
function createSelect (type) {
   const select = document.createElement('div');
   select.classList.add('other-contacts__select', 'select');
   const selected = document.createElement('button');
   selected.setAttribute('type', 'button');
   selected.classList.add('select__selected');
   selected.dataset.show = 'true';
   const option = document.createElement('div');
   option.classList.add('select__option');
   const optionList = {
      addPhone: 'Доп.телефон',
      mail: 'E-mail',
      vk: 'VK',
      fb: 'Facebook',
      other: 'Другое',
   }

   selected.textContent = optionList[type];
   if(!optionList[type])
      selected.textContent = 'Телефон';

   let optionArr = Object.entries(optionList);
   for (let i = 0;  i < optionArr.length; i++ ) {
      const optionEl = document.createElement('button');
      optionEl.setAttribute('type', 'button');
      optionEl.setAttribute('tabindex', '-1');
      optionEl.classList.add('select__option-item');
      let [key, val] = optionArr[i];
      optionEl.dataset.name = key;
      optionEl.textContent = val;
      option.append(optionEl);
   }
   select.append(selected, option);
   return select;
}

// HIDE OR SHOW ADD OTHER CONTACTS BUTTON
function hideShowAddBtn(btn, count) {
   btn.hidden = count >= LIMIT_OTHER_CONTACT;
}

function formValidate (str, name) {
   let checkStr = str.trim();
   switch(name) {
      case 'surname':
      case 'name':
      case 'lastName':
         checkStr = checkStr[0].toUpperCase() + checkStr.slice(1).toLowerCase();
      break;
   }
   return checkStr;
}

// DELETE MODAL WINDOW
function deleteModal (modal) {
   count = 0;
   modal.remove();
   modal.removeEventListener('click', modalListener);
   modal.removeEventListener('input', modalListener);
   modal.removeEventListener('submit', modalListener);
}

export {createModal, formValidate};
