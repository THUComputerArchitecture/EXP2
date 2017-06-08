/**
 * Created by Administrator on 2017/6/3 0003.
 */
var MEM_SIZE = 4096;
var ADD_PIPELINE_STAGE_NUM = 2;
var ADD_PIPELINE_STAGE_CCs = [1,1,1];       //为方便起见，将写回周期看作是流水线的一部分
var MUL_PIPELINE_STAGE_NUM = 6;
var MUL_PIPELINE_STAGE_CCs = [1,2,2,2,2,2,1,1];
var DIV_PIPELINE_STAGE_NUM = 6;
var DIV_PIPELINE_STAGE_CCs = [6,7,7,7,7,7,6,1];

var LOAD_BUF_SIZE = 3;
var STORE_BUF_SIZE = 3;
var FU_SIZE = 11;
var ADD_STATION_SIZE = 3;
var MUL_STATION_SIZE = 2;
var INST_BUF_SIZE = 4096;
var MAX_RUN_CYCLE = 100;      //一次执行到断点的操作的最大可执行周期数


function memDraw(index, value) {
    return [index, value];
    // html = '<tr id="' + devName.mem + "_" + index + '">' +
    //     '<td>' + index +
    //     '<td>' + value +
    //     '</tr>';
    // return html;
}

var iName = {           //指令名称
    addd : "ADDD",
    subd : "SUBD",
    muld : "MULD",
    divd : "DIVD",
    ld : "LD",
    st : "ST"
};

var devName = {        // 设备名称,用于匹配等待寄存器的设备（寄存器重命名）或者是网页中的id附与
    add : "addStation",
    mul : "mulStation",
    load : "loadBuffer",
    st : "storeBuffer",
    FU : "FU",
    inst : "instruction",
    mem : 'memory'
};

var CC = {              // 操作耗时
    add : 2,
    sub : 2,
    mul : 10,
    div : 40,
    ld : 2,
    st : 2
};

var pipeLineNames = {
    add : "AddSubPipeline",
    mul : "mulDivPipeline"
};

var op2Time = {};
op2Time[iName.addd] = CC.add;
op2Time[iName.subd] = CC.sub;
op2Time[iName.divd] = CC.div;
op2Time[iName.muld] = CC.mul;
op2Time[iName.ld] = CC.ld;
op2Time[iName.st] = CC.st;

function Instruction(name,src0, src1, src2){
    this.name = name;
    this.src0 = src0;
    this.src1 = src1;
    this.src2 = src2;
    this.issueTime = -1;     //完成 issue, execute, result 的时间
    this.executeTime = -1;
    this.resultTime = -1;
    this.breakpoint = false;
    this.ready = false;
    this.val0 = -1;         //操作数的实际值
    this.val1 = -1;
    this.val2 = -1;
    this.result = -1;       //运算结果
    this.WBDev = null;      //经过重命名后，写回的目标名

    this.draw = function(id){
        return [id.toString(), this.name, this.src0, this.src1, this.src2,
                    this.issueTime, this.executeTime, this.resultTime];
 /*               '<tr id="'+ devName.inst + "_" + id + '">'  +
                '<td>instruction'+ id +
                '<td>' + this.name +
                '<td>' + this.src0 +
                '<td>' + this.src1 +
                '<td>' + this.src2 +
                '<td>' + this.issueTime +
                '<td>' + this.executeTime +
                '<td>' + this.resultTime +
                '</tr>' ;*/
       /* var html = '<tr class="inst-row" ondblclick="modifyInst(this)" id="inst-'+id+'">' +
            '<td class="inst-No">'+id+'</td>' +
            '<td class="inst-type">'+this.name+'</td>' +
            '<td class="inst-src0">'+this.src0+'</td>'+
            '<td class="inst-src1">'+this.src1+'</td>'+
            '<td class="inst-src2">'+this.src2+'</td>'+
            '<td class="instructions-result-part">'+this.issueTime+'</td>'+
            '<td class="instructions-result-part">'+this.executeTime+'</td>'+
            '<td class="instructions-result-part">'+this.resultTime+'</td>'+
            '</tr>';

        return html;*/
    }
}

function LoadBuffer(){

    this.draw = function(id){
        var html =
            '<tr id="'+ devName.ld + "_" + id + '" class="">'  +
            '<td>'+ id + '</td>' +
            '<td>' + this.busy + '</td>' +
            '<td>' + this.address + '</td>' +
            '<td>' + this.value + '</td>' +
            '<td>' + this.remainingTime + '</td>' +
            '</tr>' ;
        return html;
    }
    this.init = function(){
        this.busy = false;
        this.address = -1;
        this.value = null;
        this.instruction = null;
        this.remainingTime = -1;
    }
    this.init();
}

function StoreBuffer(){
    this.draw = function(id){
        var html =
            '<tr id="'+ devName.st + "_" + id + '">'  +
            '<td>'+ id +
            '<td>' + this.busy +
            '<td>' + this.address +
            '<td>' + this.value +
            '<td>' + this.waitDev +
            '<td>' + this.active +
            '<td>' + this.remainingTime +
            '</tr>' ;

        return html;
    }
    this.init = function(){
        this.busy = false;
        this.address = -1;
        this.value = null;
        this.instruction = null;
        this.remainingTime = -1;
        this.waitDev = null;        // 如果有指令预定写回到源寄存器，则该变量为指令所在部件的名字
        this.active = false;
    }
    this.init();
}

function ReservationStation(){
    this.init = function() {
        this.op = null;               // 操作名称，应为iName中的一个
        this.v1 = 0;                // 操作数1，2的值
        this.v2 = 0;
        this.q1 = null;               // 操作数等待状态，如果不为空，表示其等待在某一个部件中
        this.q2 = null;
        //this.result = 0;              //指令的运算结果，引入流水线后不再使用
        this.busy = false;          // 是否已被占用
        //this.active = false;        // 是否正在运算，引入流水线后不再使用
        //this.remainingTime = -1;    // 指令还剩多少时间运行完毕，引入流水线后不再使用
        this.instruction = null;
    }
    this.draw = function(id,type){
        var html =
            '<tr id="'+ type + "_" + id + '">'  +
            '<td>' + id  + '</td>' +
            '<td><div class="label">'+ this.op + '</div></td>' +
            '<td>' + this.v1 + '</td>' +
            '<td>' + this.q1 + '</td>' +
            '<td>' + this.v2 + '</td>' +
            '<td>' + this.q2 + '</td>' +
            '<td>' + this.busy + '</td>' +
            '</tr>' ;

        return html;
    }
    this.init();
}

function FU(){
    this.init = function(){
        this.waitDev = null;         // 如果有指令预定写回到该寄存器，则该变量为指令所在部件的名字
        this.value = 0.0;
    };
    this.draw = function(id){
        var html =
            '<tr id="'+ devName.FU + "_" + id + '">'  +
            '<td>'+ id +
            '<td>' + this.value +
            '<td>' + this.waitDev +
            '</tr>' ;

        return html;
    };
    this.init();
}

function Pipeline(bus, stageNum, name){
    this.bus = bus;
    this.stageNum = stageNum;
    this.name = name;
    this.init = function(){
        this.stagesInsts = new Array(this.stageNum);    //在各流水段的指令
        this.stageTime = new Array(this.stageNum);
        for(var i = 0; i < this.stageNum; i++){
            this.stagesInsts[i] = null;
            this.stageTime[i] = -1;
        }
    };

    this.canIssue = function(){
        return this.stagesInsts[0] == null;
    };
    this.issue = function(instruction){
        this.stagesInsts[0] = instruction;
        this.stageTime[0] = getStageCC(instruction.name, 0);
    };
    this.execute = function(){
        for(var i = this.stageNum; i >= 0; i--){    //从后向前遍历流水线
            if(this.stagesInsts[i] != null){    //不为空则执行一个周期
                this.stageTime[i] -= 1;
            }else
                continue;
            if(this.stageTime[i] <= 0){               //指令已经执行完一个段
                if(i == this.stageNum){               //指令已经完成写回周期
                    this.bus.emitWrite(this.stagesInsts[i].WBDev, this.stagesInsts[i].result);
                    this.stagesInsts[i].resultTime = this.bus.curTime;
                    this.stagesInsts[i] = null;
                    this.stageTime[i] = -1;
                }
                else if(i == this.stageNum - 1){    //指令完成运算,进入写回阶段
                    this.stagesInsts[i].result = caculate(this.stagesInsts[i].name,
                                                            this.stagesInsts[i].val1,
                                                            this.stagesInsts[i].val2);
                    this.stagesInsts[i].executeTime = this.bus.curTime;
                    this.stagesInsts[i+1] = this.stagesInsts[i];
                    this.stageTime[i+1] = getStageCC(this.stagesInsts[i].name, i+1);
                    this.stagesInsts[i] = null;
                    this.stageTime[i] = -1;
                }
                else if(this.stagesInsts[i+1] == null){     //下一个流水段可用，转移到下一个段
                    this.stagesInsts[i+1] = this.stagesInsts[i];
                    this.stageTime[i+1] = getStageCC(this.stagesInsts[i].name, i+1);
                    this.stagesInsts[i] = null;
                    this.stageTime[i] = -1;
                }
                //否则停留在当前流水段
            }
        }
    };
    this.draw = function(type){
        var html = '<h5>Add-Sub-Pipeline</h5> \
        <div class="pipeline-board">';
        for(var i = 0; i <= this.stageNum; i++) {
            html += '<div class="pipeline-item '+type+'-pipeline-stage-'+(i+1)+'">\
                <div class="pipeline-stage-label">Stage ' + i + '</div>\
                <div class="label pipeline-inst-board">';
            if (this.stagesInsts[i] == null)
                html += 'null</div></div>';
            else
                html += this.stagesInsts[i].name + '</div></div>';
        }
        html += '</div>';
        return html;
    };
    this.init();
}

function getStageCC(instName, stageNum){
    if(instName == iName.addd || instName == iName.subd)
        return ADD_PIPELINE_STAGE_CCs[stageNum];
    else if(instName == iName.mul)
        return MUL_PIPELINE_STAGE_CCs[stageNum];
    else
        return DIV_PIPELINE_STAGE_CCs[stageNum];
}


function BUS(){
    this.init = function() {
        this.loadBuffers = new Array(LOAD_BUF_SIZE);
        this.storeBuffers = new Array(STORE_BUF_SIZE);
        this.FUs = new Array(FU_SIZE);
        this.addStations = new Array(ADD_STATION_SIZE);
        this.mulStations = new Array(MUL_STATION_SIZE);
        this.instBuffer = new Array(INST_BUF_SIZE);
        this.memory = new Array(MEM_SIZE);
        this.addPipeline = new Pipeline(this, ADD_PIPELINE_STAGE_NUM, pipeLineNames.add);
        this.mulDivPipeline = new Pipeline(this, MUL_PIPELINE_STAGE_NUM, pipeLineNames.mul);
        this.instPtr = 0;
        this.instCnt = 0;
        this.curTime = 0;
        this.issuedCount = 0;       //采用流水线后，重命名的寄存器个数可能大于保留站个数，因此需要加以扩展

        for (var i = 0; i < LOAD_BUF_SIZE; i++)
            this.loadBuffers[i] = new LoadBuffer();
        for (var i = 0; i < STORE_BUF_SIZE; i++)
            this.storeBuffers[i] = new StoreBuffer();
        for (var i = 0; i < FU_SIZE; i++)
            this.FUs[i] = new FU();
        for (var i = 0; i < ADD_STATION_SIZE; i++)
            this.addStations[i] = new ReservationStation();
        for (var i = 0; i < MUL_STATION_SIZE; i++)
            this.mulStations[i] = new ReservationStation();
        for (var i = 0; i < MEM_SIZE; i++)
            this.memory[i] = 0.0;
        for (var i = 0; i < INST_BUF_SIZE; i++)
            this.instBuffer[i] = null;
    };
    this.init();
    /*推进一个时钟周期
        执行顺序：issue -> checkExecute -> checkStart
     */
    this.plusOneSecond = function(){
        var flag = true;
        var instruction = this.instBuffer[this.instPtr];
        if(instruction != null) {
            if(this.tryIssue(instruction))
            {
                if(instruction.ready && instruction.breakpoint)
                    flag = false;
                this.instPtr++;
            }
        }
        //console.log('flag is ?'+flag);
        this.checkExecute();
        if(!this.checkStart())
            flag = false;
        //console.log('flag1 is ?'+flag);
        this.curTime ++;
        if(this.curTime >= MAX_RUN_CYCLE)
            flag = false;
        return flag;
    };

    // 尝试发射一条指令，返回成功与否(是否存在结构冲突）
    this.tryIssue = function(instruction){
        if(instruction.name == iName.ld){
            return this.tryIssueLD(instruction);
        }else if(instruction.name == iName.st){
            //console.log('issue a st instruction');
            return this.tryIssueST(instruction);
        }else if(instruction.name == iName.addd || instruction.name == iName.subd){
            return this.tryIssueADD_SUB(instruction)
        } else {
            return this.tryIssueDIV_MUL(instruction);
        }
    };

    this.tryIssueLD = function(instruction){
        if(instruction.issueTime != -1){
            console.log("[ISSUE]Make sure the inst' issue time is -1!");
            return false;
        }
        // 找到空buffer
        for(var i = 0; i < LOAD_BUF_SIZE; i++){
            if(!(this.loadBuffers[i].busy)){
                // 占用buffer
                this.loadBuffers[i].busy = true;
                this.loadBuffers[i].address = instruction.src1;
                this.loadBuffers[i].value = 0;
                this.loadBuffers[i].instruction = instruction;
                this.loadBuffers[i].remainingTime = CC.st + 1; // +1因为接下来立即会执行
                instruction.ready = true;
                instruction.issueTime = this.curTime;
                // 声明写回寄存器
                var dest = instruction.src0;
                this.FUs[dest].waitDev = devName.load + "_" + this.issuedCount++ + "_"+ i;
                return true;
            }
        }
        return false;
    };

    this.tryIssueST = function(instruction){
        // 找到空buffer
        for(var i = 0; i < STORE_BUF_SIZE; i++){
            if(!(this.storeBuffers[i].busy)){
                // 占用buffer
                this.storeBuffers[i].busy = true;
                this.storeBuffers[i].address = instruction.src1;
                this.storeBuffers[i].instruction = instruction;
                this.storeBuffers[i].remainingTime = -1;
                instruction.issueTime = this.curTime;
                // 检查源寄存器状态
                var src = instruction.src0;
                if(this.FUs[src].waitDev == null){
                    //寄存器可用,直接取值
                    this.storeBuffers[i].value = this.FUs[src].value;
                    this.storeBuffers[i].waitDev = null;
                    this.storeBuffers[i].remainingTime = CC.st;
                    this.storeBuffers[i].active = true;
                }
                else{
                    //寄存器不可用，标记等待
                    this.storeBuffers[i].waitDev = this.FUs[src].waitDev;
                    this.storeBuffers[i].active = false;
                }
                //.log('there is ok');
                return true;
            }
        }
        return false;
    };

    this.tryIssueADD_SUB = function(instruction){
        for(var i = 0; i < ADD_STATION_SIZE; i++){
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
                if((this.addStations[i].q1 = this.FUs[src].waitDev) == null) {//寄存器可用
                    this.addStations[i].v1 = this.FUs[src].value;
                    availableCnt ++;
                }
                src = instruction.src2;
                if((this.addStations[i].q2 = this.FUs[src].waitDev) == null) {
                    this.addStations[i].v2 = this.FUs[src].value;
                    availableCnt++;
                }
                // 声明写回目的寄存器
                var dest = instruction.src0;
                this.FUs[dest].waitDev = devName.add+ "_" + this.issuedCount++ + "_"+ i;
                instruction.WBDev = this.FUs[dest].waitDev;
                return true;
            }
        }
        return false;
    };

    this.tryIssueDIV_MUL = function(instruction){
        for(var i = 0; i < MUL_STATION_SIZE; i++){
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
                if((this.mulStations[i].q1 = this.FUs[src].waitDev) == null) {//寄存器可用
                    this.mulStations[i].v1 = this.FUs[src].value;
                    availableCnt ++;
                }
                src = instruction.src2;
                if((this.mulStations[i].q2 = this.FUs[src].waitDev) == null) {
                    this.mulStations[i].v2 = this.FUs[src].value;
                    availableCnt++;
                }
                var dest = instruction.src0;
                this.FUs[dest].waitDev = devName.mul+ "_" + this.issuedCount++ + "_"+ i;
                instruction.WBDev = this.FUs[dest].waitDev;
                return true;
            }
        }
        return false;
    };

    // 使得所有开始运算的部件推进一个周期
    this.checkExecute = function(){
        this.executeAdd();
        this.executeLoad();
        this.executeMul();
        this.executeStore();
    };

    this.executeLoad = function(){
        for(var i = 0; i < LOAD_BUF_SIZE; i++){
            var buffer = this.loadBuffers[i];
            // 检查是否被使用
            if(!buffer.busy)
                continue;
            // 检查是否执行完成
            if(buffer.remainingTime-- == 0){
                buffer.value = this.memory[buffer.address];
                buffer.instruction.executeTime = this.curTime;
            }
            // 检查是否需要写回
            else if(buffer.remainingTime < 0){
                buffer.instruction.resultTime = this.curTime;
                this.emitWrite(devName.load+"_"+ i, buffer.value);
                buffer.init();
            }
        }
    };

    this.executeStore = function(){
        for(var i = 0; i < STORE_BUF_SIZE; i++){
            var buffer = this.storeBuffers[i];
            // 检查是否被使用
            if(!buffer.busy || !buffer.active)
                continue;
            // 检查是否执行完成
            if(buffer.remainingTime-- == 0){
                buffer.instruction.executeTime = this.curTime;
            }
            // 检查是否需要写回
            else if(buffer.remainingTime < 0){
                buffer.instruction.resultTime = this.curTime;
                this.memory[buffer.address] = buffer.value;
                buffer.init();
            }
        }
    };

    this.executeAdd = function(){
        this.addPipeline.execute();
    };

    this.executeMul = function(){
        this.mulDivPipeline.execute();
    };

    // 广播一个写回消息，检查所有可能需要该资源的设备
    this.emitWrite = function(devName, value){
        var devCnt = 0;
        for(var i = 0; i < STORE_BUF_SIZE; i++){
            if(this.storeBuffers[i].busy && this.storeBuffers[i].waitDev == devName){
                this.storeBuffers[i].waitDev = null;
                this.storeBuffers[i].value = value;
                devCnt++;
            }
        }
        for(var i = 0; i < ADD_STATION_SIZE; i++){
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
        for(var i = 0; i < MUL_STATION_SIZE; i++){
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
        for(var i = 0; i < FU_SIZE; i++){
            if(this.FUs[i].waitDev == devName){
                this.FUs[i].waitDev = null;
                this.FUs[i].value = value;
                devCnt++;
            }
        }
        if(devCnt == 0)
            console.log("No one wants the data from " + devName + "!");
    };

    // 检查哪些设备可以开始执行
    this.checkStart = function(){
        var flag = true;
        if(!this.startAdd())
            flag = false;
        if(!this.startMul())
            flag = false;
        if(!this.startStore())
            flag = false;
        return flag;
    };

    this.startStore = function(){
        var flag = true;
        for(var i = 0; i < STORE_BUF_SIZE; i++){
            if(!this.storeBuffers[i].busy || this.storeBuffers[i].active)
                continue;
            if(this.storeBuffers[i].waitDev == null && this.storeBuffers[i].active == false){
                this.storeBuffers[i].active = true;
                this.storeBuffers[i].remainingTime = CC.st;
                if(this.storeBuffers[i].instruction.breakpoint)
                    flag = false;
            }
        }
        return flag;
    };

    this.startAdd = function(){
        var flag = true;
        for(var i = 0; i < ADD_STATION_SIZE; i++) {
            var station = this.addStations[i];
            if(!station.busy)
                continue;
            var instruction = station.instruction;
            if(station.q1 == null && station.q2 == null){
                if(this.addPipeline.canIssue()){        //尝试将指令发射到流水线中
                    station.instruction.val1 = station.v1;
                    station.instruction.val2 = station.v2;
                    this.addPipeline.issue(station.instruction);
                    station.init();
                }
                if(instruction.breakpoint)
                    flag = false;
            }
        }
        return flag;
    };

    this.startMul = function(){
        var flag = true;
        for(var i = 0; i < MUL_STATION_SIZE; i++) {
            var station = this.mulStations[i];
            if(!station.busy)
                continue;
            var instruction = station.instruction;
            if(this.mulDivPipeline.canIssue()){        //尝试将指令发射到流水线中
                station.instruction.val1 = station.v1;
                station.instruction.val2 = station.v2;
                this.mulDivPipeline.issue(station.instruction);
                station.init();
            }
            if(instruction.breakpoint)
                flag = false;
        }
        return flag;
    };

    this.addInst = function(instruction){
        if(this.instCnt >= INST_BUF_SIZE){
            alert("指令不能超过" + INST_BUF_SIZE + "条！");
            return;
        }
        else
            this.instBuffer[this.instCnt++] = instruction;
    }

    this.editInst = function (index, type, des, src0, src1) {
        this.instBuffer[index].name = type;
        this.instBuffer[index].src0 = des;
        this.instBuffer[index].src1 = src0;
        this.instBuffer[index].src2 = src1;
    }

    this.delInst = function(index){
        if(index >= this.instCnt){
            alert("找不到指令"+index);
            return;
        }
        if(this.instBuffer[index].issueTime != -1){
            alert("不能删除已发射的指令");
            return;
        }
        this.instBuffer.splice(index,1);
    }
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

