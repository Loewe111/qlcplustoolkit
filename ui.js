
const parser = new QLCParser((content) => {
    $('#file-data').text(content);
});

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
        console.log(fixture);
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