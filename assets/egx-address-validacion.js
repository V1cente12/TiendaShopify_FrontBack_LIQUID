const nombreEl = document.querySelector('#AddressFirstNameNew');
const ApellidoEl = document.querySelector('#AddressLastNameNew');
const telefonoEl = document.querySelector('#AddressPhoneNew');
const direccionEl = document.querySelector('#AddressAddress1New_complemento');
const ciudadEl = document.getElementById('address-new[selectcity]');
const statusCiudadEl = document.querySelector('#statusCiudad');
const zonaEl = document.querySelector('#AddressProvinceNew');
const statusZonaEl = document.querySelector('#statusZona');
const formEl = document.querySelector('#address_form_new');


let nombreEditEl;
let ApellidoEditEl;
let telefonoEditEl;
let ciudadEditEl;
let direccionEditEl;
let zonaEditEl;
let formEditEl;

let inputFocus = false;

const checkTextGeneric = (PInput, PMensaje) => {
    let valido = false;
    const value = PInput.value.trim();
    if (!egxIsRequired(value)) {
        egxShowError(PInput,PMensaje);
    }else{
        egxShowSuccess(PInput);
        valido = true;
    }
    if(!valido){
        if(!inputFocus){
            $("#"+PInput.getAttribute("id")).focus();
            inputFocus = true;
        }
    }
    return valido;
}


const checkTelefono = (PTelefono) => {
    let valido = false;
    const minimo = 6, maximo = 8;
    const value = PTelefono.value.trim();
    if (!egxIsRequired(value)) {
        egxShowError(PTelefono,'El Teléfono es obligatorio');
    }else if (!egxIsBetween(value.length, minimo, maximo)) {
        egxShowError(PTelefono,`El Teléfono debe tener entre ${minimo} y ${maximo} digitos.`)
    }else{
        egxShowSuccess(PTelefono);
        valido = true;
    }

    if(!valido){
        if(!inputFocus){
            $("#"+PTelefono.getAttribute("id")).focus();
            inputFocus = true;
        }
    }


    return valido;
}

const checkNombreNew = () =>{
    return checkTextGeneric(nombreEl, 'El nombre es obligatorio');
}
const checkApellidoNew = () =>{
    return checkTextGeneric(ApellidoEl, 'El alias es obligatorio');
}
const checkTelefonoNew = () =>{
    return checkTelefono(telefonoEl);
}
const checkDireccionNew = () =>{
    return checkTextGeneric(direccionEl, 'La dirección es obligatorio');
}
const checkCiudadNew = () =>{
    try{
        if(ciudadEl.value.trim() == ''){
            egxShowError(statusCiudadEl,'La ciudad es obligatorio');
            return false;
        }else{
            egxShowSuccess(statusCiudadEl);
            return true;
        }
    }
    catch{
        egxShowError(statusCiudadEl,'La ciudad es obligatorio');
        return false;
    }
}
const checkZonaNew = () =>{
    return checkTextGeneric(zonaEl, 'La zona es obligatorio');
}




const checkNombreEdit = () =>{
    return checkTextGeneric(nombreEditEl, 'El nombre es obligatorio');
}
const checkApellidoEdit = () =>{
    return checkTextGeneric(ApellidoEditEl, 'El alias es obligatorio');
}
const checkTelefonoEdit = () =>{
    return checkTelefono(telefonoEditEl);
}

const checkDireccionEdit = () =>{
    return checkTextGeneric(direccionEditEl, 'La dirección es obligatorio');
}
const checkCiudadEdit = () =>{
    return checkTextGeneric(ciudadEditEL, 'la ciudad es obligatorio');
}
const checkZonaEdit = () =>{
    return checkTextGeneric(zonaEditEl, 'La zona es obligatorio');
}


const mostrarMensaje = (id) => {
    const data = `<div class="row">
                    <div class="col-lg-12">
                    <div class="alert alert-warning " role="alert" style="border-radius: 20px;">
                        <div class="row">
                        <div class="col-xs-10">
                            <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                            <strong>Estimado Usuario. </strong>  <label style="line-height: 17px;">Mueva el mapa hasta encontrar tu ubicación exacta.</label>
                        </div>
                        <div class="col-xs-2" style = "display: flex;
                            justify-content: right;
                            align-items: center;cursor:pointer"> 
                            <span class=""  data-dismiss="alert"  aria-label="Close"><b>X</b></span>                             
                        </div>
                        </div>
                    </div>
                    </div>               
                </div>`;
    $('.'+id).html(data);
}
const isValidForm = () => {
    const isNombreValid = checkNombreNew();
    const isApellidoValid = checkApellidoNew();
    const isTelefonoValid = checkTelefonoNew();
    const isDireccionValid = checkDireccionNew();
    const isCiudadValid = checkCiudadNew();
    const isZonaValid = checkZonaNew();

    return isNombreValid && isApellidoValid && isTelefonoValid && isDireccionValid && isCiudadValid && isZonaValid;
}

const isValidFormEdit = () => {
    const isNombreEditValid = checkNombreEdit();
    const isApellidoEditValid = checkApellidoEdit();
    const isTelefonoValid = checkTelefonoEdit();
    const isDireccionValid = checkDireccionEdit();
    const isCiudadValid1 = checkCiudadEdit();
    const isZonaValid = checkZonaEdit();

    return isZonaValid && isCiudadValid1 && isNombreEditValid && isApellidoEditValid && isTelefonoValid && isDireccionValid;
}


const debounce = (fn, delay = 500) => {
    let timeoutId;
    return (...args) => {

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            fn.apply(null, args)
        }, delay);
    };
};

  

function initValoresEdit(){
    nombreEditEl = document.querySelector('#AddressFirstName_'+idEditForm);
    ApellidoEditEl = document.querySelector('#AddressLastName_'+idEditForm);
    telefonoEditEl = document.querySelector('#AddressPhone_'+idEditForm);
    direccionEditEl = document.querySelector('#AddressAddress1_New_Complemento'+idEditForm);
    ciudadEditEL =  document.querySelector('#AddressFirstName1_'+idEditForm);
    zonaEditEl =  document.querySelector('#AddressProvince_'+idEditForm);
    
    formEditEl =  document.querySelector('#address_form_'+idEditForm);
    
    formEditEl.addEventListener('input', debounce(function (e) {

        switch (e.target.id) {
            case 'AddressFirstName_'+idEditForm:
                checkNombreEdit();
                break;
            case 'AddressLastName_'+idEditForm:
                checkApellidoEdit();
                break;
            case 'AddressPhone_'+idEditForm:
                checkTelefonoEdit();
                break;
            case 'AddressAddress1_New_Complemento'+idEditForm:
                mostrarMensaje('mensajeDireccionEdit');
                checkDireccionEdit();
                break;
            case 'AddressFirstName1_'+idEditForm:
                checkCiudadEdit();
                break;
            case 'AddressProvince_'+idEditForm:
                checkZonaEdit();
                break;
        }
    }));
    

}
formEl.addEventListener('input', debounce(function (e) {
    switch (e.target.id) {
        case 'AddressFirstNameNew':
            checkNombreNew();
            break;
        case 'AddressLastNameNew':
            checkApellidoNew();
            break;
        case 'AddressPhoneNew':
            checkTelefonoNew();
            break;
        case 'AddressAddress1New_complemento':
            mostrarMensaje('mensajeDireccionNew');
            checkDireccionNew();
            break;
        case 'address-new[selectcity]':
            checkCiudadNew();
            break;

        case 'AddressProvinceNew':
            checkZonaNew();
            break;
            
    }
}));

function ValidarNew(e){
    e.preventDefault();;
    inputFocus = false;
    let isFormValid = isValidForm();
    if(isFormValid){
        $("#address_form_new").submit();
        
        new Promise((resolve) => {
            localStorage.setItem('insertAddress', true)
            resolve(true);
        });
        new Promise((resolve) => {
            $("#address_form_new").submit();
            resolve(true);
        });
        
    }
} 
function ValidarEdit(e){
    e.preventDefault();
    inputFocus = false;
    let isFormValid = isValidFormEdit();
    if(isFormValid){
        $("#address_form_"+idEditForm).submit();
    }
} 
