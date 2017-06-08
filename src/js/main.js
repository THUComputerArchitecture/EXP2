$(document).ready(function () {
    $("#inst-table").dataTable(
        {
            responsive: true,
            "dom": 'T<"clear">lfrtip',
            "tableTools": {
                "sSwfPath": "js/plugins/dataTables/swf/copy_csv_xls_pdf.swf"
            },
            "createdRow": function (row, data, index) {
                $('td', row).eq(0).attr('class', 'inst-No');
                $('td', row).eq(1).attr('class', 'inst-type');
                $('td', row).eq(2).attr('class', 'inst-src1');
                $('td', row).eq(3).attr('class', 'inst-src1');
                $('td', row).eq(4).attr('class', 'inst-src2');
                $('td', row).eq(5).attr('class', 'instructions-result-part');
                $('td', row).eq(6).attr('class', 'instructions-result-part');
                $('td', row).eq(7).attr('class', 'instructions-result-part');
                $(row).attr('class', 'inst-row').attr('ondblclick', 'modifyInst(this)').attr('id', 'inst-' + index);
            },
            "columnDefs":[
                {
                    "targets":[5],
                    "searchable":false
                },
                {
                    "targets":[6],
                    "searchable":false
                },
                {
                    "targets":[7],
                    "searchable":false
                }
            ],
            "aLengthMenu": [5, 10, 20]
        }
    );
    var data = [];

    for(var i = 0; i < MEM_SIZE; i++) {
        data.push([i, '0']);
    }

    $('#mem-table').dataTable({
        responsive: true,
        "dom": 'T<"clear">lfrtip',
        "tableTools": {
            "sSwfPath": "js/plugins/dataTables/swf/copy_csv_xls_pdf.swf"
        },
        "createdRow": function (row, data, index) {
            $('td', row).eq(0).attr('class', 'mem-No');
            $('td', row).eq(1).attr('class', 'mem-value');
            $(row).attr('class', 'mem-row').attr('ondblclick', 'modifyMem(this)').attr('id', 'mem-' + index);
        },
        "columnDefs":[
            {
                //设置第一列不参与搜索
                "targets":[1],
                "searchable":false
            }
        ],
        data: data
    });

    data = [];

    for(var i = 0; i < FU_SIZE; i++) {
        data.push([i, '0', 'null']);
    }

    $('#fu-table').dataTable({
        responsive: true,
        "dom": 'T<"clear">lfrtip',
        "tableTools": {
            "sSwfPath": "js/plugins/dataTables/swf/copy_csv_xls_pdf.swf"
        },
        "createdRow": function (row, data, index) {
            $('td', row).eq(0).attr('class', 'fu-No');
            $('td', row).eq(1).attr('class', 'fu-value');
            $('td', row).eq(2).attr('class', 'fu-wait-dev');
            $(row).attr('class', 'fu-row').attr('ondblclick', 'modifyFu(this)').attr('id', 'fu-' + index);
        },
        "columnDefs":[
            {
                "targets":[1],
                "searchable":false
            },
            {
                "targets":[2],
                "searchable":false
            }
        ],
        "aLengthMenu": [11, 5],
        data: data
    });

    $("#load-btn").attr('class','btn btn-default').attr('disabled', 'disabled');

});

function selectedFile(node){
    console.log("change");
    var file = node.files[0];
    if(typeof(file) === 'undefined') {
        $("#load-btn").attr('class','btn btn-default').attr('disabled', 'disabled');

    } else {
        $("#load-btn").attr('class','btn btn-success').removeAttr('disabled');
    }
}


function selectInit() {
    for (var i in iName) {
        var s = '<option value="' + iName[i] + '">' + iName[i] + '</option>';
        $('#new-instruction-type-selector').append(s);
        $('#editInsType').append(s);
    }
    for (var i = 0; i < FU_SIZE; i++) {
        $('#editFloatRegister').append('<option value="' + i + '">F' + i + '</option>');
    }
    // $('.selectpicker').selectpicker();
}

function generateInstTypeHtml(instType) {
    var html = "<select>";
    for (var i in iName) {
        if (iName[i] === instType) {
            html += "<option value='" + iName[i] + "' selected>" + iName[i] + "</option>";
        } else {
            html += "<option value='" + iName[i] + "'>" + iName[i] + "</option>";
        }
    }
    html += "</select>";
    return html;
}

function generateInstSrcHtml(src0) {
    return "<input type='text' class='inst-modify-input' value='" + src0 + "'>";
}

function generateInstModifyBtn() {
    var html = "<td class='inst-modify-btns-panel center-orientation' colspan='3'> <button class='btn inst-modify-btn btn-success' onclick='confirmModifyInst(this)'>Confirm</button><button class='btn inst-modify-btn btn-primary' onclick='confirmChangeBreakpoint(this)'>Set/Delete Breakpoint</button><button class='btn inst-modify-btn btn-warning' onclick='confirmDeleteInst(this)'>Delete</button></td>"
    return html;

}

function generateInstResultPart() {
    return '<td class="instructions-result-part">-1</td><td class="instructions-result-part">-1</td><td class="instructions-result-part">-1</td>'
}

function generateMemValueHtml(value) {
    return "<input type='text' class='mem-modify-input' value='" + value + "' onblur='confirmModifyMemValue(this)'>";
}

function generateFuValueHtml(value) {
    return "<input type='text' class='fu-modify-input' value='" + value + "' onblur='confirmModifyFuValue(this)'>";
}


function modifyInst(node) {
    var id = node.id.substring(5);
    var instType = $(node).find(".inst-type").html();
    var src0 = $(node).find(".inst-src0").html();
    var src1 = $(node).find(".inst-src1").html();
    var src2 = $(node).find(".inst-src2").html();
    $(node).find(".inst-type").html(generateInstTypeHtml(instType));
    $(node).find(".inst-src0").html(generateInstSrcHtml(src0));
    $(node).find(".inst-src1").html(generateInstSrcHtml(src1));
    $(node).find(".inst-src2").html(generateInstSrcHtml(src2));
    $(node).find(".instructions-result-part").remove();
    $(".inst-row").removeAttr("ondblclick");
    $(node).append(generateInstModifyBtn());
}


function modifyMem(node) {
    var id = node.id.substring(4);
    var value = $(node).find(".mem-value").html();
    $(node).find(".mem-value").html(generateMemValueHtml(value));
    $(".mem-row").removeAttr("ondblclick");
}

function modifyFu(node) {
    var id = node.id.substring(3);
    var value = $(node).find(".fu-value").html();
    $(node).find(".fu-value").html(generateFuValueHtml(value));
    $(".fu-row").removeAttr("ondblclick");
}

function confirmModifyInst(node) {
    var parents = $(node).parents(".inst-row");
    console.log("confirm");
    var parent = parents[0];
    var id = parent.id.substring(5);
    var instType = $(parent).find(".inst-type").find("select").val();
    var src0 = $(parent).find(".inst-src0").find("input").val();
    var src1 = $(parent).find(".inst-src1").find("input").val();
    var src2 = $(parent).find(".inst-src2").find("input").val();
    $(parent).find(".inst-type").html(instType);
    $(parent).find(".inst-src0").html(src0);
    $(parent).find(".inst-src1").html(src1);
    $(parent).find(".inst-src2").html(src2);
    $(parent).find(".inst-modify-btns-panel").remove();
    $(parent).append(generateInstResultPart());
    $(".inst-row").attr("ondblclick", 'modifyInst(this)');
}

function confirmDeleteInst(node) {
    var table = $('#inst-table').DataTable();
    var parents = $(node).parents(".inst-row");
    var parent = parents[0];
    table.row(parent).remove().draw();
    $(".inst-row").attr("ondblclick", 'modifyInst(this)');

}

function confirmModifyMemValue(node) {
    var parents = $(node).parents(".mem-row");
    console.log("confirm");
    var parent = parents[0];
    var id = parent.id.substring(4);
    var value = $(parent).find(".mem-value").find("input").val();
    $(parent).find(".mem-value").html(value);
    $(".mem-row").attr("ondblclick", 'modifyMem(this)');
}

function confirmModifyFuValue(node) {
    var parents = $(node).parents(".fu-row");
    console.log("confirm");
    var parent = parents[0];
    var id = parent.id.substring(3);
    var value = $(parent).find(".fu-value").find("input").val();
    $(parent).find(".fu-value").html(value);
    $(".fu-row").attr("ondblclick", 'modifyFu(this)');
}

$(document).ready(function () {
    selectInit();
    // updateBus(bus);
    // redrawMem(bus.memory, memStart, memNum);
     bus.addInst(new Instruction(iName.addd, 1, 2, 3));
     bus.addInst(new Instruction(iName.subd, 2, 1, 2));
     bus.addInst(new Instruction(iName.st, 2, 0, 0));
     updateBus(bus);
    // redrawMem(bus.memory, memStart, memNum);
    // /*bus.plusOneSecond();
    //  updateBus(bus,instList);
    //  redrawMem(bus.memory, memStart, memNum);*/
});

function runOneCycle() {
    bus.plusOneSecond();
    updateBus(bus);
}

function clearInstTable() {
    $("#inst-table").dataTable().fnClearTable();
    $("#inst-table").dataTable().fnAddData([
        "0",
        "ADDD",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1"
    ]);

}


function confirmChangeBreakpoint(node) {

}
