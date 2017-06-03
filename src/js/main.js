function updateBus(bus){
    $("#loadBufArea").html(loadBufHead);
    for(i = 0; i < bus.loadBuffers.length; i++){
        $("#loadBufArea").append(bus.loadBuffers[i].draw());
    }
    $("#storeBufArea").html(storeBufHead);
    for(i = 0; i < bus.storeBuffers.length; i++){
        $("#storeBufArea").append(bus.storeBuffers[i].draw());
    }
    $("#addStationArea").html(stationHead);
    for(i = 0; i < bus.addStations.length; i++){
        $("#addStationArea").append(bus.addStations[i].draw("add"));
    }
    $("#mulStationArea").html(stationHead);
    for(i = 0; i < bus.mulStations.length; i++){
        $("#mulStationArea").append(bus.mulStations[i].draw("mul"));
    }
    $("#FUArea").html(FUHead);
    for(i = 0; i < bus.FUs.length; i++){
        $("#FUArea").append(bus.FUs[i].draw());
    }
}

var stationHead = '<tr>' +
'<th>StationName</th>' +
'<th>InstName</th>' +
'<th>V1</th>' +
'<th>Q1</th>' +
'<th>V2</th>' +
'<th>Q1</th>' +
'<th>Result</th>' +
'<th>Busy</th>' +
'<th>Active</th>' +
'<th>RemianingTime</th>' +
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
