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

function generateInstTypeHtml(instType) {
    var html = "<select>";
    for(var i in iName) {
        if(iName[i] === instType) {
            html += "<option value='" + iName[i] + "' selected>" + iName[i] + "</option>";
        } else {
            html += "<option value='" + iName[i] + "'>" + iName[i] + "</option>";
        }
    }
    html += "</select>";
    return html;
}

function generateInstSrcHtml(src0) {
    return "<input type='text' class='inst-modify-input' value='" + src0 + "'>"
}

function generateInstModifyBtn() {
    var html = "<td class='inst-modify-btns-panel center-orientation' colspan='3'> <button class='btn inst-modify-btn btn-success' onclick='confirmModifyInst(this)'>Confirm</button> <button class='btn inst-modify-btn btn-warning' onclick='confirmDeleteInst(this)'>Delete</button></td>"
    return html;

}

function generateInstResultPart() {
    return '<td class="instructions-result-part">-1</td><td class="instructions-result-part">-1</td><td class="instructions-result-part">-1</td>'
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
    $(node).append(generateInstModifyBtn());
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
}

function confirmDeleteInst(node) {
    var parents = $(node).parents(".inst-row");
    var parent = parents[0];
    $(parent).remove();
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

