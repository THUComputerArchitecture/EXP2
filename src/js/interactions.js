/**
 * Created by Administrator on 2017/6/4 0004.
 */
function addInstruction(bus, type, des, src0, src1) {
    bus.addInst(new Instruction(type, des, src0, src1));
//    console.log("add success");
}

function editInstruction(bus, index, type, des, src0, src1) {
    if(bus.instBuffer[index].issueTime != -1)
        alert('指令已执行，无法修改！');
    else
        bus.editInst(index, type, des, src0, src1);
}

function deleteInstruction(bus, index) {
    if(bus.instBuffer[index].issueTime != -1)
        alert('指令已执行，无法删除！');
    else
        bus.delInst(index);
}

function editFloatRegisterValue(index, value) {
    //console.log('index is ? ='+index);
    bus.FUs[index].value = value;
}

function editMemoryValue(addr, value) {
    console.log('addr is '+addr);
    bus.memory[addr] = value;
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
        content += bus.instBuffer[i].excuteTime + '\r\n';
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

function loadFromFile(bus, file) {
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
            bus.instBuffer[i].excuteTime = parseInt(data[++off]);
            bus.instBuffer[i].resultTime = parseInt(data[++off]);
        }
        for(var i = 0; i < FU_SIZE; i++) {
            bus.FUs[i].value = parseFloat(data[++off]);
        }
        for(var i = 0; i < INST_BUF_SIZE; i++) {
            bus.memory[i] = parseFloat(data[++off]);
        }
    }
}

function nsAhead(n) {
    for(var i = 0; i < n; i++)
        bus.plusOneSecond();
}

function setBreakPoint(bus, index) {
    bus.instBuffer[index].breakpoint = true;
}

function runUntilBP(bus) {
    while(bus.plusOneSecond()){};
}
