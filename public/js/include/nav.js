function deleteConfirm() {
    console.log('deleteConfirm()');

    if (confirm('DELETE REALLY?')) 
        location.href = '/user/delete_confirm';

}