
function loadFile(event) {
    let fileInput = event.target;
    let file = fileInput.files[0];
    console.log(file);

    $('#btn-open').hide();
    $('#txt-filename').text(file.name).show();
    $('#btn-save').show();
    document.title = file.name;

    let reader = new FileReader();
    reader.onload = function(e) {
        let content = e.target.result;
        $('#file-data').text(content);
        console.log(content);
    };
    reader.readAsText(file);
}

function openFile() {
    $('#qlcfile').click();
}