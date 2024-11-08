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

function resetForm () {
    console.log('resetForm()');

    $('div.profile_thum_wrap').css('display', 'block');
    $('input[name="profile_thum"]').css('display', 'none');

    document.modify_form.reset();

}

// 프로필 변경 함수 시작
$(document).ready(function() {
    console.log('DOCUMENT READY!!');

    initEvents();

});

function initEvents() {
    console.log('initEvents()');

    $(document).on('change', 'input[name="cover_profile_thum_delete"]', function() {
        console.log('cover_profile_thum_delete CHANGED');

        if ($(this).prop("checked")) {
            $('input[name="profile_thum"]').css('display', 'inline-block');
            $('div.profile_thum_wrap').css('display', 'none');

        } else {
            $('input[name="profile_thum"]').css('display', 'none');
            $('div.profile_thum_wrap').css('display', 'block');

        }

    });

    $(document).on('click', 'div.profile_thum_wrap a', function(){
        console.log('profile_thum_wrap CLICKED!!');

        $('#profile_modal_wrap').css('display', 'block');

    });

    $(document).on('click', '#profile_modal_wrap div.profile_thum_close a', function(){
        console.log('profile_thum_close CLICKED!!');

        $('#profile_modal_wrap').css('display', 'none');

    });

}