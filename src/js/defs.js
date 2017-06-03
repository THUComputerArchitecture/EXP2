/**
 * Created by Administrator on 2017/6/3 0003.
 */
var MEM_SIZE = 4096;

var iName = {           //指令名称
    addd : "ADDD",
    subd : "SUBD",
    muld : "MULD",
    divd : "DIVD",
    ld : "LD",
    st : "ST"
};

var devName = {        // 声明写入寄存器的设备名称
    add : "add",
    mul : "mul",
    load : "load"
};

var CC = {              // 操作耗时
    add : 2,
    sub : 2,
    mul : 10,
    div : 40,
    ld : 2,
    st : 2
};

var op2Time = {};
op2Time[iName.addd] = CC.add;
op2Time[iName.subd] = CC.sub;
op2Time[iName.divd] = CC.div;
op2Time[iName.muld] = CC.mul;
op2Time[iName.ld] = CC.ld;
op2Time[iName.st] = CC.st;

var memory = new Array(MEM_SIZE);
for(i = 0 ; i < MEM_SIZE; i++)
    memory[i] = 0.0;

function Instruction(name,src0, src1, src2){
    this.name = name;
    this.src0 = src0;
    this.src1 = src1;
    this.src2 = src2;
    this.issueTime = -1;     //完成 issue, excute, result 的时间
    this.excuteTime = -1;
    this.resultTime = -1;

    this.draw = function(){
        var html =
                '<tr>'  +
                '<td>instruction' +
                '<td>' + this.name +
                '<td>' + this.src0 +
                '<td>' + this.src1 +
                '<td>' + this.src2 +
                '<td>' + this.issueTime +
                '<td>' + this.excuteTime +
                '<td>' + this.resultTime +
                '</tr>' ;

        return html;
    }
}

function LoadBuffer(){
    this.busy = false;
    this.address = -1;
    this.value = null;
    this.instruction = null;
    this.remainingTime = -1;    //完成load操作所需的时间
}

function StoreBuffer(){
    this.busy = false;
    this.address = -1;
    this.value = null;
    this.instruction = null;
    this.remainingTime = -1;
    this.waitDev = null;        // 如果有指令预定写回到源寄存器，则该变量为指令所在部件的名字
    this.active = false;
}

function ReservationStation(){
    this.op = "";               // 操作名称，应为iName中的一个
    this.v1 = 0;                // 操作数1，2的值
    this.v2 = 0;
    this.q1 = "";               // 操作数等待状态，如果不为空，表示其等待在某一个部件中
    this.q2 = "";
    this.result = 0;
    this.busy = false;          // 是否已被占用
    this.active = false;        // 是否正在运算
    this.remainingTime = -1;    // 指令还剩多少时间运行完毕
    this.instruction = null;
}

function FU(){
    this.writer = null;         // 如果有指令预定写回到该寄存器，则该变量为指令所在部件的名字
    this.value = 0.0;
}

var LOAD_BUF_SIZE = 3;
var STORE_BUF_SIZE = 3;
var FU_SIZE = 20;
var ADD_STATION_SIZE = 3;
var MUL_STATION_SIZE = 2;
var INST_BUF_SIZE = 20;

function BUS(){
    this.loadBuffers = new Array(LOAD_BUF_SIZE);
    this.storeBuffers = new Array(STORE_BUF_SIZE);
    this.FUs = new Array(FU_SIZE);
    this.addStations = new Array(ADD_STATION_SIZE);
    this.mulStations = new Array(MUL_STATION_SIZE);
    this.instBuffer = new Array(INST_BUF_SIZE);
    this.curTime = 0;

    for(i = 0; i < LOAD_BUF_SIZE; i++)
        this.loadBuffers[i] = new LoadBuffer();
    for(i = 0; i < STORE_BUF_SIZE; i++)
        this.storeBuffers[i] = new StoreBuffer();
    for(i = 0; i < FU_SIZE; i++)
        this.FUs[i] = new FU();
    for(i = 0; i < ADD_STATION_SIZE; i++)
        this.addStations[i] = new ReservationStation();
    for(i = 0; i < MUL_STATION_SIZE; i++)
        this.mulStations[i] = new ReservationStation();

    /*推进一个时钟周期
        执行顺序：issue -> checkExcute -> checkStart
     */
    this.plusOneSecond = function(issueList){
        if(!(issueList instanceof Array)){
            console.log("issueList must be an Array!");
            return;
        }
        this.checkExcute();
        this.checkStart();
    };

    // 尝试发射一条指令，返回成功与否(是否存在结构冲突）
    this.tryIssue = function(instruction){
        if(instruction.name == iName.ld){
            return this.tryIssueLD(instruction);
        }else if(instruction.name == iName.st){
            return this.tryIssueST(instruction);
        }else if(instruction.name == iName.addd || instruction.name == iName.subd){
            return this.tryIssueADD_SUB(instruction)
        } else {
            return this.tryIssueDIV_MUL(instruction);
        }
    };

    this.tryIssueLD = function(instruction){
        // 找到空buffer
        for(i = 0; i < LOAD_BUF_SIZE; i++){
            if(!(this.loadBuffers[i].busy)){
                // 占用buffer
                this.loadBuffers[i].busy = true;
                this.loadBuffers[i].address = instruction.src1;
                this.loadBuffers[i].value = 0;
                this.loadBuffers[i].instruction = instruction;
                this.loadBuffers[i].remainingTime = CC.st;
                instruction.issueTime = this.curTime;
                // 声明写回寄存器
                var dest = instruction.src0;
                this.FUs[dest].writer = devName.load + "_" + i;
                return true;
            }
        }
        return false;
    };

    this.tryIssueST = function(instruction){
        // 找到空buffer
        for(i = 0; i < STORE_BUF_SIZE; i++){
            if(!(this.storeBuffers[i].busy)){
                // 占用buffer
                this.storeBuffers[i].busy = true;
                this.storeBuffers[i].address = instruction.src1;
                this.storeBuffers[i].instruction = instruction;
                this.storeBuffers[i].remainingTime = -1;
                instruction.issueTime = this.curTime;
                // 检查源寄存器状态
                var src = instruction.src0;
                if(this.FUs[src].writer == null){
                    //寄存器可用,直接取值
                    this.storeBuffers[i].value = this.FUs[src].value;
                    this.storeBuffers[i].waitDev = null;
                    this.storeBuffers[i].remainingTime = CC.st;
                    this.storeBuffers[i].active = true;
                }
                else{
                    //寄存器不可用，标记等待
                    this.storeBuffers[i].waitDev = this.FUs[src].writer;
                    this.storeBuffers[i].active = false;
                }
                return true;
            }
        }
        return false;
    };

    this.tryIssueADD_SUB = function(instruction){
        for(i = 0; i < ADD_STATION_SIZE; i++){
            // 寻找空站
            if(!(this.addStations[i].busy)){
                // 占用保留站
                this.addStations[i].busy = true;
                this.addStations[i].op = instruction.name;
                this.addStations[i].active = false;
                this.addStations[i].instruction = instruction;
                instruction.issueTime = this.curTime;
                var src = instruction.src1;
                var availableCnt = 0;
                // 检查源寄存器状态
                if((this.addStations[i].q1 = this.FUs[src].writer) == null) {//寄存器可用
                    this.addStations[i].v1 = this.FUs[src].value;
                    availableCnt ++;
                }
                src = instruction.src2;
                if((this.addStations[i].q2 = this.FUs[src].writer) == null) {
                    this.addStations[i].v2 = this.FUs[src].value;
                    availableCnt++;
                }
                if(availableCnt == 2){       //操作数集齐，可以开始
                    this.addStations[i].active = true;
                    if(instruction.name == iName.addd)
                        this.addStations[i].remainingTime = CC.add;
                    else
                        this.addStations[i].remainingTime = CC.sub;
                }
                // 声明写回目的寄存器
                var dest = instruction.src0;
                this.FUs[dest].writer = devName.add+"_"+ i;
                return true;
            }
        }
        return false;
    };

    this.tryIssueDIV_MUL = function(instruction){
        for(i = 0; i < MUL_STATION_SIZE; i++){
            // 寻找空站
            if(!(this.mulStations[i].busy)){
                // 占用保留站
                this.mulStations[i].busy = true;
                this.mulStations[i].op = instruction.name;
                this.mulStations[i].active = false;
                this.mulStations[i].instruction = instruction;
                instruction.issueTime = this.curTime;
                var src = instruction.src1;
                var availableCnt = 0;
                // 检查源寄存器状态
                if((this.mulStations[i].q1 = this.FUs[src].writer) == null) {//寄存器可用
                    this.mulStations[i].v1 = this.FUs[src].value;
                    availableCnt ++;
                }
                src = instruction.src2;
                if((this.mulStations[i].q2 = this.FUs[src].writer) == null) {
                    this.mulStations[i].v2 = this.FUs[src].value;
                    availableCnt++;
                }
                if(availableCnt == 2){       //操作数集齐，可以开始
                    this.mulStations[i].active = true;
                    if(instruction.name == iName.muld)
                        this.mulStations[i].remainingTime = CC.mul;
                    else
                        this.mulStations[i].remainingTime = CC.div;
                }
                var dest = instruction.src0;
                this.FUs[dest].writer = devName.mul+"_"+ i;
                return true;
            }
        }
        return false;
    };

    // 使得所有开始运算的部件推进一个周期
    this.checkExcute = function(){
        this.excuteAdd();
        this.excuteLoad();
        this.excuteMul();
        this.excuteStore();
    };

    this.excuteLoad = function(){
        for(i = 0; i < LOAD_BUF_SIZE; i++){
            var buffer = this.loadBuffers[i];
            // 检查是否被使用
            if(!buffer.busy)
                continue;
            // 检查是否执行完成
            if(buffer.remainingTime-- == 0){
                buffer.value = memory[buffer.address];
                buffer.instruction.excuteTime = this.curTime;
            }
            // 检查是否需要写回
            else if(buffer.remainingTime < 0){
                buffer.busy = false;
                buffer.instruction.writeTime = this.curTime;
                this.emitWrite(devName.load+"_"+ i, buffer.value);
            }
        }
    };

    this.excuteStore = function(){
        for(i = 0; i < STORE_BUF_SIZE; i++){
            var buffer = this.storeBuffers[i];
            // 检查是否被使用
            if(!buffer.busy)
                continue;
            // 检查是否执行完成
            if(buffer.remainingTime-- == 0){
                buffer.instruction.excuteTime = this.curTime;
            }
            // 检查是否需要写回
            else if(buffer.remainingTime < 0){
                buffer.busy = false;
                buffer.instruction.writeTime = this.curTime;
                memory[buffer.address] = buffer.value;
            }
        }
    };

    this.excuteAdd = function(){
        for(i = 0; i < ADD_STATION_SIZE; i++){
            var station = this.addStations[i];
            //检查是否正在执行运算
            if(!station.busy || !station.active)
                continue;
            // 检查是否执行完成
            if(station.remainingTime-- == 0){
                station.instruction.excuteTime = this.curTime;
                station.result = caculate(station.op, station.v1, station.v2);
            }
            // 检查是否需要写回
            else if(station.remainingTime < 0){
                station.busy = false;
                station.active = false;
                station.instruction.resultTime = this.curTime;
                this.emitWrite(devName.add + "_" + i, station.result);
            }
        }
    };

    this.excuteMul = function(){
        for(i = 0; i < MUL_STATION_SIZE; i++){
            var station = this.mulStations[i];
            //检查是否正在执行运算
            if(!station.busy || !station.active)
                continue;
            // 检查是否执行完成
            if(station.remainingTime-- == 0){
                station.instruction.excuteTime = this.curTime;
                station.result = caculate(station.op, station.v1, station.v2);
            }
            // 检查是否需要写回
            else if(station.remainingTime < 0){
                station.busy = false;
                station.active = false;
                station.instruction.resultTime = this.curTime;
                this.emitWrite(devName.mul + "_" + i, station.result);
            }
        }
    };

    // 广播一个写回消息，检查所有可能需要该资源的设备
    this.emitWrite = function(devName, value){
        var devCnt = 0;
        for(i = 0; i < STORE_BUF_SIZE; i++){
            if(this.storeBuffers[i].busy && this.storeBuffers[i].waitDev == devName){
                this.storeBuffers[i].waitDev = null;
                this.storeBuffers[i].value = value;
                devCnt++;
            }
        }
        for(i = 0; i < ADD_STATION_SIZE; i++){
            if(this.addStations[i].busy){
                if(this.addStations[i].q1 == devName){
                    this.addStations[i].q1 = null;
                    this.addStations[i].v1 = value;
                    devCnt++;
                }
                if(this.addStations[i].q2 == devName){
                    this.addStations[i].q2 = null;
                    this.addStations[i].v2 = value;
                    devCnt++
                }
            }
        }
        for(i = 0; i < MUL_STATION_SIZE; i++){
            if(this.mulStations[i].busy){
                if(this.mulStations[i].q1 == devName){
                    this.mulStations[i].q1 = null;
                    this.mulStations[i].v1 = value;
                    devCnt++;
                }
                if(this.mulStations[i].q2 == devName){
                    this.mulStations[i].q2 = null;
                    this.mulStations[i].v2 = value;
                    devCnt++;
                }
            }
        }
        if(devCnt == 0)
            console.log("No one wants the data!");
    };

    // 检查哪些设备可以开始执行
    this.checkStart = function(){
        this.startAdd();
        this.startMul();
        shit.startStore();
    };

    this.startStore = function(){
        for(i = 0; i < STORE_BUF_SIZE; i++){
            if(!this.storeBuffers[i].busy || this.storeBuffers[i].active)
                continue;
            if(this.storeBuffers[i].waitDev == null && this.storeBuffers[i].active == false){
                this.storeBuffers[i].active = true;
                this.storeBuffers[i].remainingTime = CC.st;
            }
        }
    };

    this.startAdd = function(){
        for(i = 0; i < ADD_STATION_SIZE; i++) {
            var station = this.addStations[i];
            if(!station.busy || station.active)
                continue;
            if(station.q1 == null && station.q2 == null){
                station.active = true;
                station.remainingTime = op2Time[station.op];
            }
        }
    };

    this.startMul = function(){
        for(i = 0; i < MUL_STATION_SIZE; i++) {
            var station = this.mulStations[i];
            if(!station.busy || station.active)
                continue;
            if(station.q1 == null && station.q2 == null){
                station.active = true;
                station.remainingTime = op2Time[station.op];
            }
        }
    };
}

function caculate(operation, src1, src2){
    if(operation == iName.addd)
        return src1 + src2;
    if(operation == iName.subd)
        return src1 - src2;
    if(operation == iName.muld)
        return src1 * src2;
    if(operation == iName.divd)
        return src1 / src2;
    console.log("Unrecognized operation " + operation);
}

