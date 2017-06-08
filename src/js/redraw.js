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
    redrawMem(bus.memory, 0,4096);
}



function redrawMem(memory, start, num){
    $('#mem-table').dataTable().fnClearTable();
   /* for(var i = start; i < start + num; i++){
        $('#mem-table').dataTable().fnAddData(memDraw(i, memory[i]));
    }*/
    var data = [];

    for(var i = 0; i < MEM_SIZE; i++) {
        data.push([i, memory[i]]);
    }
    $('#mem-table').dataTable().fnAddData(data);
}

function redrawTimer(time){
    $("#timer").html(time );
}

function redrawLoadBuf(loadBuffers){
    $("#loadBufArea").html(loadBufHead);
    for(i = 0; i < loadBuffers.length; i++) {
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
    $('#inst-table').dataTable().fnClearTable();
    for(i = 0; i < instCnt; i++){
        if(insts[i] != null)
            $('#inst-table').dataTable().fnAddData(insts[i].draw(i));
    }
}

function redrawAddPipeline(pipeline){
    $("#addPipelineArea").html(pipeline.draw('as'));
}

function redrawMulDivPipeLine(pipeline){
    $("#mulPipelineArea").html(pipeline.draw('md'));
}

var stationHead = '<tr>' +
    '<th>No</th>' +
    '<th>Instruction</th>' +
    '<th>V1</th>' +
    '<th>Q1</th>' +
    '<th>V2</th>' +
    '<th>Q1</th>' +
    '<th>Busy</th>' +
    '</tr>';

var loadBufHead = '<tr>' +
    '<th>No</th>' +
    '<th>Busy</th>' +
    '<th>Destination</th>' +
    '<th>Address</th>' +
    '<th>Remaining Time</th>' +
    '</tr>';

var storeBufHead =  '<tr>' +
    '<th>No</th>' +
    '<th>Busy</th>' +
    '<th>Address</th>' +
    '<th>Value</th>' +
    '<th>Wait Dev</th>' +
    '<th>Active</th>' +
    '<th>Remaining Time</th>' +
    '</tr>';

var FUHead =  '<tr>' +
    '<th>No</th>' +
    '<th>Value</th>' +
    '<th>Wait Dev</th>' +
    '</tr>';
