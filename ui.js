
const parser = new QLCParser((content) => {
    $('#file-data').text(content);
});

function loadFile(event) {
    let fileInput = event.target;
    let file = fileInput.files[0];

    $('#btn-open').hide();
    $('#txt-filename').text(file.name).show();
    $('#btn-save').show();
    document.title = file.name;

    let reader = new FileReader();
    reader.onload = function(e) {
        parser.content = e.target.result;
        onFileLoaded();
    };
    reader.readAsText(file);
}

function openFile() {
    $('#qlcfile').click();
}

function onFileLoaded() {
    updateFixtures();
}

function updateFixtures() {
    $('#fixtures').empty();
    let fixtures = parser.fixtureList;
    for (let fixture of fixtures) {
        let name = fixture.querySelector('Name').textContent;
        let id = fixture.querySelector('ID').textContent;
        let address = fixture.querySelector('Address').textContent;
        let fixtureHTML = `
            <div class="fixture" id="fixture-${id}">
                <span class="fixture-id">${id}</span>
                <span class="fixture-name">${name}</span>
                <span class="fixture-address">${address}</span>
            </div>
        `;
        $('#fixtures').append(fixtureHTML);
    }
}

function saveAs(blob, filename) {
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

$(document).ready(function() {
    $('#btn-sort-fixtures').click(function() {
        parser.sortFixtures();
        updateFixtures();
    });

    $('#btn-save').click(function() {
        let content = $('#file-data').text();
        let filename = $('#txt-filename').text();
        let blob = new Blob([content], {type: 'text/xml'});
        saveAs(blob, filename);
    });

    $('#btn-update-groups').click(function() {
        parser.updateChannelgroups();
    });
});