function selectInit() {
    for(var i in iName) {
        var s = '<option value="' + iName[i] + '">' + iName[i] + '</option>';
        $('#new-instruction-type-selector').append(s);
        $('#editInsType').append(s);
    }
    for(var i = 0; i < FU_SIZE; i++) {
        $('#editFloatRegister').append('<option value="'+i+'">F'+i+'</option>');
    }
    // $('.selectpicker').selectpicker();
}


$(document).ready(function () {
    selectInit();
    // updateBus(bus);
    // redrawMem(bus.memory, memStart, memNum);
    // bus.addInst(new Instruction(iName.addd, 1, 2, 3));
    // bus.addInst(new Instruction(iName.subd, 2, 1, 2));
    // bus.addInst(new Instruction(iName.st, 2, 0, 0));
    // updateBus(bus);
    // redrawMem(bus.memory, memStart, memNum);
    // /*bus.plusOneSecond();
    //  updateBus(bus,instList);
    //  redrawMem(bus.memory, memStart, memNum);*/
});
