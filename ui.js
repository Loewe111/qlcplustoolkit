
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
    updateFunctions();
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

function updateFunctions() {
    $('#functions').empty();
    let functions = parser.functionTree;
    Object.entries(functions).forEach(([name, folder]) => {
        $('#functions').append(createFolder(folder, name, [name]));
    });
}

function createFolder(obj, name, path) {
    let folderHTML = $(`<div class="function-folder"><span class="folder-name"><span class="arrow"></span>${name}</span></div>`);
    Object.entries(obj).forEach(([name, value]) => {
        if (typeof value === 'object') {
            folderHTML.append(createFolder(value, name, path.concat([name])));
        } else {
            let functionHTML = $(`<div class="function"><span>${value}</span><span>${name}</span></div>`);
            folderHTML.append(functionHTML);
            functionHTML.click((event) => selectFunction(event, value, path.concat([name])));
        }
    });
    $(folderHTML).children('.folder-name').click(toggleFolder);
    return folderHTML;
}

function toggleFolder(event) {
    let folder = $(event.target).closest('.function-folder');
    folder.toggleClass('collapsed');
}

function selectFunction(event, id, path) {
    $('.function').removeClass('selected');
    $(event.target).closest('.function').addClass('selected');
    console.log(id, path);
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

    $('#tab-fixtures').click(function() {
        $('#fixtures').show();
        $('#functions').hide();
        $('#tab-fixtures').addClass('active');
        $('#tab-functions').removeClass('active');
    });

    $('#tab-functions').click(function() {
        $('#fixtures').hide();
        $('#functions').show();
        $('#tab-fixtures').removeClass('active');
        $('#tab-functions').addClass('active');
    });
});