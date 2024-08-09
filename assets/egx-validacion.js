function soloNumeros(event){
    const charCode = (event.which) ? event.which : event.keyCode;
    if(charCode >= 48 && charCode <= 57)
        return true;
    return false;
}


const egxShowSuccess = (input) => {
    // obtener el elemento de campo de formulario
    const formField = input.parentElement;
    
    // eliminar la clase de error
    formField.classList.remove('error');
    formField.classList.add('success');

    // ocultar el mensaje de error
    const error = formField.querySelector('small');
    error.textContent = '';
}

const egxShowError = (input, message) => {
    const formField = input.parentElement;

    formField.classList.remove('success');
    formField.classList.add('error');

    const error = formField.querySelector('small');
    error.textContent = message;
};


const egxIsRequired = value => value === '' ? false : true;

const egxIsBetween = (length, min, max) => length < min || length > max ? false : true;

const egxIsEmailValid = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};