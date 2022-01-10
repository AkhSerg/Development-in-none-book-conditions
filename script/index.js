class Api {
    constructor(url, headers) {
        this._url = url;
        this._headers = headers;
    }

    // функция получения данных от сервера
    _getItems() {
        return fetch(this._url, {
            method: 'GET',
            headers: this._headers
        }).then((res) => {
            return this._processResult(res, 'Ошибка при получении данных');
        })
    }
// функция удаления данных о карточке по id; возвращает данные о студентах без удаленного
    _deleteItem(id) {
        return fetch(`${this._url}/${id}`, {
            method: 'DELETE',
            headers: this._headers
        }).then((res) => {
            return this._processResult(res, 'Ошибка при удалении данных');
        })
    }

    _createItem(data) {
        return fetch(`${this._url}/`, {
            method: 'POST',
            headers: this._headers,
            body: JSON.stringify(data)
        }).then((res) => {
           return this._processResult(res, 'Ошибка при добавлении записи');
        });
     }
  
    _updateItem(id, data) {
        return fetch(`${this._url}/${id}`, {
            method: 'PUT',
            headers: this._headers,
            body: JSON.stringify(data)
        }).then((res) => {
           return this._processResult(res, 'Ошибка при изменении записи');
        });
    }
  
    // функция обработки результата (ошибки)
    _processResult(res, errorText) {
        if (res.ok) {
            return res.json();
        }
        alert(errorText);
        return Promise.reject();
    }
}

class Form {
    constructor(element) {
       this._element = element;
    }
 
    init(submitHandler, values) {
       this.closeForm();
       this._submitHandler = submitHandler;
       this._element.addEventListener('submit', this._submitHandler);
        
       if (values) {
          Object.keys(values).forEach((name) => {
            this._element.querySelector(`[name="${name}"]`).value = values[name];
          });
       }
    }
 
    closeForm() {
       this._element.reset();
       this._element.removeEventListener('submit', this._submitHandler);
       this._submitHandler = null;
    }
 }

 const $studentsContainer = document.querySelector('.students_container');
 const $studentTemplate = document.querySelector('#student_template').content;
 const $cardContainer = document.querySelector('.card_container');
 const $cardTemplate = document.querySelector('#card_template').content;
 const $popup = document.querySelector('#student_popup');
 const $popupCloseButton = document.querySelector('.popup__close');
 const $studentButton = document.querySelector('.header_icon');
 const studentApi = new Api(
     'http://localhost:3000/students', {
     'Content-Type': 'application/json',
     'Access-Control-Allow-Methods': '*'
 })
 
 const studentForm = new Form(document.querySelector('.student-form'));
 
 const showPopup = () => {
     $popup.classList.add('opened');
 }
  
 const hidePopup = () => {
     $popup.classList.remove('opened');
     studentForm.closeForm();
 }

$popupCloseButton.addEventListener('click', (event) => {
    hidePopup();
});


// функция для генерации (пересоздания) списка данных, чтобы в дальнейшем отправить их на сервер
const renderList = (data) => {
    $studentsContainer.innerHTML = '';
    data.forEach(renderItem);
}

const renderCard = (item) => {
    $cardTemplate.innerHTML = '';
    $cardContainer.innerHTML = '';
    const $cardItem = $cardTemplate.cloneNode(true);
    const $cardImg = $cardItem.querySelector('.avatar');
    const $buttonClose = $cardItem.querySelector('.button_close');

    $cardItem.querySelector('.last_name').textContent = item.last_name;
    $cardItem.querySelector('.fs_name').textContent = (item.first_name + " " + item.middle_name);
    $cardItem.querySelector('.city').textContent = item.city;
    $cardItem.querySelector('.study').textContent = item.study;
    $cardItem.querySelector('.phone_number').textContent = item.phone_number;
    $cardItem.querySelector('.email').textContent = item.email;
    $cardImg.setAttribute('src', item.avatar);
    $cardImg.setAttribute('alt', (item.first_name + " " + item.last_name));

    $cardContainer.appendChild($cardItem);

    $buttonClose.addEventListener('click', (event) => {
        event.preventDefault();
        $cardContainer.style.display = "";
        $cardContainer.innerHTML = '';
    })

    // удочка на закрытие карточки по свайпу
    $cardContainer.addEventListener('touchmove', (event) => {
        event.preventDefault();
        $cardContainer.style.display = "";
        $cardContainer.innerHTML = '';
    });

    $cardContainer.style.display = "flex";
}

// функция, получающая на вход item; позволяет получить данные из item и записать их в HTML
// применяется клонирование item и добавление клона в контейнер (students_container)
const renderItem = (item) => {
    const $studentItem = $studentTemplate.cloneNode(true);
    const $studentImg = $studentItem.querySelector('.avatar');
    const $buttonDelete = $studentItem.querySelector('.button_delete');
    const $student = $studentItem.querySelector('.student');
    const $buttonEdit = $studentItem.querySelector('.button_edit')

    $studentItem.querySelector('.student_name').textContent = (item.first_name + " " + item.last_name);
    $studentItem.querySelector('.city').textContent = item.city;
    $studentItem.querySelector('.study').textContent = item.study;
    $studentImg.setAttribute('src', item.avatar);
    $studentImg.setAttribute('alt', (item.first_name + " " + item.last_name));

    $studentsContainer.appendChild($studentItem);

    $buttonDelete.addEventListener('click', (event)=>{
        event.preventDefault();
        // каждый раз перечитываем данные, не оптимально; можно удалить элемент сам по себе
        // studentApi._deleteItem(item.id).then((data)=>{
        //     getItems().then((data) => renderList(data));
        // });
        // удаляем элемент сам по себе
        studentApi._deleteItem(item.id).then(() => {
            // event.target - ссылка на кнопку;
            // closest('.class_name') - получаем родителя
            // remove() - удаляет элемент
            // ? - проверяет, что удаляется корректно, чтобы не возникло ошибок
            event.target.closest('.student')?.remove?.();
            
        })
    });

    $buttonEdit.addEventListener('click', (event)=>{
        showPopup();
        //     // инициализируем форму 
        studentForm.init((event) => 
        // первый параметр данные, которые считываем из формы
        {
            event.preventDefault();
            // считываем данные на фронте из формы
            const data = {
                id: item.id,
                last_name: event.target.elements[0].value,
                first_name: event.target.elements[1].value,
                middle_name: event.target.elements[2].value,
                city: event.target.elements[3].value,
                study: event.target.elements[4].value,
                avatar: event.target.elements[5].value,
                phone_number: event.target.elements[6].value,
                email: event.target.elements[7].value
            }
            console.log(data)
            // обращаемся к серверу через API, чтобы изменить данные в базе
            studentApi._updateItem(item.id, data).then(() => {
                studentApi._getItems().then((data) => renderList(data));
                hidePopup();
            });   
        }, // второй параметр для отображения данных в форме, которые будем менять
        {
            last_name: item.last_name,
            first_name: item.first_name,
            middle_name: item.middle_name,
            city: item.city,
            study: item.study,
            avatar: item.avatar,
            phone_number: item.phone_number,
            email: item.email
        });
    })

    // контекстное меню на студента
    $student.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        renderCard(item);
    });
}

// генерация списка данных с проверкой на ошибку
// если при генерации списка будет ошибка, то сработает call-back onReject
studentApi._getItems().then((data) => renderList(data));

$studentButton.addEventListener('click', () => {
    showPopup();
    studentForm.init((event) => {
        event.preventDefault();
        const data = {
            last_name: event.target.elements[0].value,
            first_name: event.target.elements[1].value,
            middle_name: event.target.elements[2].value,
            city: event.target.elements[3].value,
            study: event.target.elements[4].value,
            avatar: event.target.elements[5].value,
            phone_number: event.target.elements[6].value,
            email: event.target.elements[7].value
        };
        console.log(data)
        studentApi._createItem(data).then(() => {
            studentApi._getItems().then((data) => renderList(data));
            hidePopup();
        });
    });
})
