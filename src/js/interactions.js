/**
 * Created by Administrator on 2017/6/4 0004.
 */
function addInstruction() {
    var type = $('#new-instruction-type-selector').val();
    var frIndex =  $('#new-instruction-src0-selector').val();
    if(!checkNoNegInt(frIndex)) return;
    frIndex = parseInt(frIndex);
    if(!checkFrIndex(frIndex)) return;
    var src0,src1;
    if(isASMDinsType(type)) {
        src0 = $('#new-instruction-src1-selector').val();
        if(!checkNoNegInt(src0)) return;
        src0 = parseInt(src0);
        if(!checkFrIndex(src0)) return;
        src1 = $('#new-instruction-src2-selector').val();
        console.log(src1);
        if(!checkNoNegInt(src1)) return;
        src1 = parseInt(src1);
        if(!checkFrIndex(src1)) return;
        if(src0 == src1) {
            myAlert('加减乘除指令的两个源操作寄存器不能相同');
            return;
        }
    } else if(isLSinsType(type)) {
        src0 = $('#new-instruction-src1-selector').val();
        if(!checkNoNegInt(src0)) return;
        src0 = parseInt(src0);
        if(!checkMemoryIndex(src0)) return;
        src1 = null;
    }
    bus.addInst(new Instruction(type, frIndex, src0, src1));
}

function editInstruction(insIndex, type, frIndex, src0, src1) {
    console.log(insIndex,type,frIndex,src0,src1);
    if(!checkNoNegInt(insIndex)) return false;
    insIndex = parseInt(insIndex);
    if(!checkInsIndex(insIndex)) return false;
    if(!checkNoNegInt(frIndex)) return false;
    frIndex = parseInt(frIndex);
    if(!checkFrIndex(frIndex)) return false;
    if(isASMDinsType(type)) {
        if(!checkNoNegInt(src0)) return false;
        src0 = parseInt(src0);
        if(!checkFrIndex(src0)) return false;
        if(!checkNoNegInt(src1)) return false;
        src1 = parseInt(src1);
        if(!checkFrIndex(src1)) return false;
        if(src0 == src1) {
            myAlert('加减乘除指令的两个源操作寄存器不能相同');
            return false;
        }
    } else if(isLSinsType(type)) {
        if(!checkNoNegInt(src0)) return false;
        src0 = parseInt(src0);
        if(!checkMemoryIndex(src0)) return false;
        src1 = null;
    }
    if(bus.instBuffer[insIndex].issueTime != -1) {
        alert('指令已执行，无法修改！');
        return false;
    } else
        bus.editInst(insIndex, type, frIndex, src0, src1);
    return true;
}

function deleteInstruction(insIndex) {
    if(!checkNoNegInt(insIndex)) return false;
    insIndex = parseInt(insIndex);
    if(!checkInsIndex(insIndex)) return false;
    if(bus.instBuffer[insIndex].issueTime != -1) {
        myAlert('指令已执行，无法删除！');
        return false;
    }
    else
        bus.delInst(insIndex);
    return true;
}

function editFloatRegisterValue() {
    var frIndex = $('#editFloatRegister').val();
    if(!checkNoNegInt(frIndex)) return;
    frIndex = parseInt(frIndex);
    if(!checkFrIndex(frIndex)) return;
    var value = $('#editFRValue').val();
    if(!checkFloat(value)) return;
    bus.FUs[frIndex].value = value;
}

function editMemoryValue(redrawMem) {
    var memIndex = $('#editMemAddress').val();
    if(!checkNoNegInt(memIndex)) return;
    memIndex = parseInt(memIndex);
    if(!checkMemoryIndex(memIndex)) return;
    var value = $('#editMemValue').val();
    if(!checkFloat(value)) return;
    value = parseFloat(value);
    bus.memory[memIndex] = value;
    redrawMem(bus.memory,memIndex, 1);
}

function save2file(bus) {
    var content = "";
    content += bus.instCnt.toString() + '\r\n';
    for(var i = 0; i < bus.instCnt; i++) {
        content += bus.instBuffer[i].name + '\r\n';
        content += bus.instBuffer[i].src0 + '\r\n';
        content += bus.instBuffer[i].src1 + '\r\n';
        content += bus.instBuffer[i].src2 + '\r\n';
        content += bus.instBuffer[i].issueTime + '\r\n';
        content += bus.instBuffer[i].executeTime + '\r\n';
        content += bus.instBuffer[i].resultTime + '\r\n';
    }
    for(var i = 0; i < FU_SIZE; i++) {
        content += bus.FUs[i].value + '\r\n';
    }
    for(var i = 0; i < INST_BUF_SIZE; i++) {
        content += bus.memory[i] + '\r\n';
    }
    var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "save.txt");//saveAs(blob,filename)
}

function loadFromFile(updateBus) {
    var file = document.getElementById('select-file-btn').files[0];
    if(typeof(file) == 'undefined') {
        myAlert('请先选择导入文件');
        return;
    }
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
        var data = this.result.toString().split('\r\n');
        //bus.instCnt = parseInt(data[0]);
        //console.log(bus.instCnt);
        off = 0;
        for(var i = 0; i < parseInt(data[0]); i++) {
            bus.addInst(new Instruction(data[++off], data[++off], data[++off], data[++off]));
            bus.instBuffer[i].issueTime = parseInt(data[++off]);
            bus.instBuffer[i].executeTime = parseInt(data[++off]);
            bus.instBuffer[i].resultTime = parseInt(data[++off]);
        }
        for(var i = 0; i < FU_SIZE; i++) {
            bus.FUs[i].value = parseFloat(data[++off]);
        }
        for(var i = 0; i < INST_BUF_SIZE; i++) {
            bus.memory[i] = parseFloat(data[++off]);
        }
        updateBus(bus);
    }
}

function nsAhead() {
    var nCycle = $('#nsAhead').val();
    if(!checkPosInt(nCycle)) return;
    for(var i = 0; i < parseInt(nCycle); i++)
        bus.plusOneSecond();
}

function changeBreakPoint(insIndex) {
    bus.instBuffer[insIndex].breakpoint = ~bus.instBuffer[insIndex].breakpoint;
    return true;
}

function runUntilBP() {
    while(bus.plusOneSecond()){};
}

function checkPosInt(input) {
    var r = /^[1-9][0-9]*$/;　　//正整数
    if(r.test(input))
        return true;
    else {
        myAlert('请输入正整数');
        return false;
    }
}

function checkNoNegInt(input) {
    var r = /^[0-9]+$/;　　//非负整数
    if(r.test(input))
        return true;
    else {
        myAlert('请输入非负整数');
        return false;
    }
}

function myAlert(content) {
    alert(content);
}

function checkInsIndex(index) {
    if(index < bus.instCnt)
        return true;
    else {
        myAlert('请输入正确的指令序号');
        return false;
    }
}

function changeInsAddInputForm() {
    var type = $('#newInsType').val();
    if(isASMDinsType(type))
        $('#newInsSrc1').attr('disabled',false);
    else if(isLSinsType(type)) {
        $('#newInsSrc1').val('');
        $('#newInsSrc1').attr('disabled',true);
    }
}

function checkFrIndex(index) {
    if(index < FU_SIZE)
        return true;
    else {
        myAlert('请输入正确的浮点寄存器序号');
        return false;
    }
}

function isASMDinsType(type) {
    return type == iName.addd || type == iName.subd || type == iName.muld || type == iName.divd;
}

function isLSinsType(type) {
    return type == iName.ld || type == iName.st;
}

function checkMemoryIndex(index) {
    if(index < INST_BUF_SIZE)
        return true;
    else {
        myAlert('请输入正确的内存地址');
        return false;
    }
}

function checkFloat(input) {
    var r = /^-?[0-9]+(.[0-9]+)?$/;　　//浮点数
    if(r.test(input))
        return true;
    else {
        myAlert('请输入浮点数');
        return false;
    }
}

function changeInsEditInputForm() {
    var type = $('#editInsType').val();
    if(isASMDinsType(type))
        $('#editInsSrc1').attr('disabled',false);
    else if(isLSinsType(type)) {
        $('#editInsSrc1').val('');
        $('#editInsSrc1').attr('disabled',true);
    }
}

function showMemory(redrawMem) {
    var memIndex = $('#showMemAddress').val();
    if(!checkNoNegInt(memIndex)) return;
    memIndex = parseInt(memIndex);
    if(!checkMemoryIndex(memIndex)) return;
    var number = $('#showMemNumber').val();
    if(!checkPosInt(number)) return;
    number = parseInt(number);
    if(memIndex + number >= INST_BUF_SIZE){
        myAlert('显示地址超过内存上限');
        return;
    }
    redrawMem(bus.memory, memIndex, number);
}
