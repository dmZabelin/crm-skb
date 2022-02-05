import { formValidate } from './modal.js'
// Create attributes
function setAttributes(el, options) {
   Object.keys(options).forEach(function(attr) {
      el.setAttribute(attr, options[attr]);
   })
}

function replaceDate( data ) {
   const dateArr = data.split('T');
   const date = dateArr[0]
      .split('-')
      .reverse()
      .toString()
      .replaceAll(',', '.');
   const time = dateArr[1]
      .split(':', 2)
      .toString()
      .replace(',',':');
   return { date, time };
}

function calcMargin() {
   const toolTips = document.querySelectorAll('.contacts__tooltip');
   const contactsList = document.querySelectorAll('.table__contacts ');
   toolTips.forEach(el=> {
      el.style.marginLeft = '-' + Math.ceil(el.offsetWidth)/2 + 'px';
   })
   contactsList.forEach(el=> {
      el.style.marginTop = '-' + Math.ceil(el.offsetHeight)/2 + 'px';
   })
}

function createObj(form) {
   const obj = {};
   let contactsArr = [];
   const inputs = form.querySelectorAll('input');

   for (let i = 0; i < inputs.length ; i++) {
      if(i < 3) {
         obj[inputs[i].name] = formValidate(inputs[i].value, inputs[i].name);
      } else {
       let objCont =  {
            type: inputs[i].name,
            value: formValidate(inputs[i].value, inputs[i].name)
         }
         contactsArr.push(objCont)
         obj.contacts = contactsArr;
      }
   }
   return obj;
}

export { setAttributes, replaceDate, calcMargin, createObj };
