function modifyForm() {
    console.log('modifyForm()');

    let form = document.modify_form;
    
    if (form.a_mail.value === '') {
        alert('INPUT MAIL!!');
        form.a_mail.focus();

    } else if (form.a_phone.value === '') {
        alert('INPUT PHONE!!');
        form.a_phone.focus();
        
    } else {
        form.submit();

    }

}