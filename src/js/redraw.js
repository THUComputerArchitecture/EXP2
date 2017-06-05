/**
 * Created by Administrator on 2017/6/4 0004.
 */
function updateBus(bus, insts, memStart, memNum){
    redrawAddStation(bus.addStations);
    redrawLoadBuf(bus.loadBuffers);
    redrawMulStation(bus.mulStations);
    redrawStoreBuf(bus.storeBuffers);
    redrwaFU(bus.FUs);
    redrawInst(bus.instBuffer, bus.instCnt);
    // or redrawInst(bus.insts);
    redrawTimer(bus.curTime);
    redrawAddPipeline(bus.addPipeline);
    redrawMulDivPipeLine(bus.mulDivPipeline);
}



function redrawMem(memory, start, num){
    $("#MemArea").html(memHead);
    for(var i = start; i < start + num; i++){
        $("#MemArea").append(memDraw(i, memory[i]));
    }
}

function redrawTimer(time){
    $("#timer").html("Current Clock Cycle is <span style='color: red'>" + time + "</span>");
}

function redrawLoadBuf(loadBuffers){
    $("#loadBufArea").html(loadBufHead);
    for(i = 0; i < loadBuffers.length; i++){
        $("#loadBufArea").append(loadBuffers[i].draw(i));
    }
}

function redrawAddStation(addStations){
    $("#addStationArea").html(stationHead);
    for(i = 0; i < addStations.length; i++){
        $("#addStationArea").append(addStations[i].draw(i,devName.add));
    }
}

function redrawMulStation(mulStations){
    $("#mulStationArea").html(stationHead);
    for(i = 0; i < mulStations.length; i++){
        $("#mulStationArea").append(mulStations[i].draw(i,devName.mul));
    }
}

function redrawStoreBuf(storeBuffers){
    $("#storeBufArea").html(storeBufHead);
    for(i = 0; i < storeBuffers.length; i++){
        $("#storeBufArea").append(storeBuffers[i].draw(i));
    }
}

function redrwaFU(FUs){
    $("#FUArea").html(FUHead);
    for(i = 0; i < FUs.length; i++){
        $("#FUArea").append(FUs[i].draw(i));
    }
}

function redrawInst(insts, instCnt){
    $("#instArea").html(instHead);
    for(i = 0; i < instCnt; i++){
        if(insts[i] != null)
            $("#instArea").append(insts[i].draw(i));
    }
}

function redrawAddPipeline(pipeline){
    $("#addPipelineArea").html(pipeline.draw());
}

function redrawMulDivPipeLine(pipeline){
    $("#mulPipelineArea").html(pipeline.draw());
}


var instHead = '<tr>' +
    '<th>Type</th>' +
    '<th>InstructionName</th>' +
    '<th>Src0</th>' +
    '<th>Src1</th>' +
    '<th>Src2</th>' +
    '<th>issueTime</th>' +
    '<th>excuteTime</th>' +
    '<th>resultTime</th>' +
    '</tr>';

var stationHead = '<tr>' +
    '<th>StationName</th>' +
    '<th>InstName</th>' +
    '<th>V1</th>' +
    '<th>Q1</th>' +
    '<th>V2</th>' +
    '<th>Q1</th>' +
    '<th>Busy</th>' +
    '</tr>';

var loadBufHead = '<tr>' +
    '<th>BufferName</th>' +
    '<th>Busy</th>' +
    '<th>Destination</th>' +
    '<th>Address</th>' +
    '<th>RemainingTime</th>' +
    '</tr>';

var storeBufHead =  '<tr>' +
    '<th>BufferName</th>' +
    '<th>Busy</th>' +
    '<th>Address</th>' +
    '<th>Value</th>' +
    '<th>WaitDev</th>' +
    '<th>Active</th>' +
    '<th>RemainingTime</th>' +
    '</tr>';

var FUHead =  '<tr>' +
    '<th>FUName</th>' +
    '<th>WaitDev</th>' +
    '<th>Value</th>' +
    '</tr>';

var memHead = '<tr>' +
    '<th>Address</th>' +
    '<th>Value</th>' +
    '</tr>';
