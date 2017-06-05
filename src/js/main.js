function selectInit() {
    for(var i in iName) {
        var s = '<option value="' + iName[i] + '">' + iName[i] + '</option>';
        $('#newInsType').append(s);
        $('#editInsType').append(s);
    }
    for(var i = 0; i < FU_SIZE; i++) {
        $('#editFloatRegister').append('<option value="'+i+'">F'+i+'</option>');
    }
}
