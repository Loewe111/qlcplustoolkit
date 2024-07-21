
class QLCParser {
    constructor(updateCallback) {
        this._updateCallback = updateCallback;
        this._content = null;
        this.parser = new DOMParser();
        this.xml = null;
    }
    
    set content(content) {
        this._content = content;
        this._updateCallback(content);
        this.xml = this.parser.parseFromString(content, 'text/xml');
    }

    get content() {
        return this._content;
    }

    set fixtureList(fixtures) {
        let parent = this.xml.querySelector('Engine');
        this.xml.querySelectorAll('Engine > Fixture').forEach((fixture) => {
            fixture.remove();
        });
        for (let fixture of fixtures) {
            parent.appendChild(fixture);
        }
        this.updateContent();
    }

    get fixtureList() {
        return this.xml.querySelectorAll('Engine > Fixture');
    }

    updateContent() {
        this._content = new XMLSerializer().serializeToString(this.xml).replace(/xmlns="[^"]*" ?/, '');
        this._updateCallback(this._content);
    }

    sortFixtures() {
        let fixtures = this.fixtureList;
        this.fixtureList = Array.from(fixtures).sort((a, b) => {
            let aID = parseInt(a.querySelector('ID').textContent);
            let bID = parseInt(b.querySelector('ID').textContent);
            return aID - bID;
        });
    }

    seperateIndexValue(text) {
        let values = {};
        let pairs = text.split(',');
        for (let i = 0; i < pairs.length; i+=2) {
            values[pairs[i]] = pairs[i+1];
        }
        return values;
    }

    updateChannelgroups() {
        let channelgroups = this.xml.querySelectorAll('ChannelsGroup');
        let scenes = this.xml.querySelectorAll('Function[Type="Scene"]:has(ChannelGroupsVal)');
        
        for (let scene of scenes) {
            let channelgroupsVal = scene.querySelector('ChannelGroupsVal');
            let values = this.seperateIndexValue(channelgroupsVal.textContent);
            let fixtureValues = scene.querySelectorAll('FixtureVal');
            for (let fixtureValue of fixtureValues) {
                fixtureValue.remove();
            }

            Object.entries(values).forEach(([fixturegroupid, value]) => {
                let devices = this.seperateIndexValue(channelgroups[fixturegroupid].textContent);
                Object.entries(devices).forEach(([deviceid, channel]) => {
                    let fixtureValue = scene.querySelector(`FixtureVal[ID="${deviceid}"]`) || this.xml.createElement('FixtureVal');
                    fixtureValue.setAttribute('ID', deviceid);
                    if (fixtureValue.textContent) {
                        fixtureValue.textContent += ',';
                    }
                    fixtureValue.textContent += `${channel},${value}`;
                    scene.appendChild(fixtureValue);
                });
            });

        }

        this.updateContent();
    }

    updateChannelgroupsSingle(id) {
        let channelgroups = this.xml.querySelectorAll('ChannelsGroup');
        let scenes = this.xml.querySelectorAll('Function[Type="Scene"]:has(ChannelGroupsVal)');
        
        for (let scene of scenes) {
            let channelgroupsVal = scene.querySelector('ChannelGroupsVal');
            let values = this.seperateIndexValue(channelgroupsVal.textContent);
            let fixtureValues = scene.querySelectorAll(`Function[ID="${id}"] > FixtureVal`);
            for (let fixtureValue of fixtureValues) {
                fixtureValue.remove();
            }

            Object.entries(values).forEach(([fixturegroupid, value]) => {
                let devices = this.seperateIndexValue(channelgroups[fixturegroupid].textContent);
                Object.entries(devices).forEach(([deviceid, channel]) => {
                    let fixtureValue = scene.querySelector(`FixtureVal[ID="${deviceid}"]`) || this.xml.createElement('FixtureVal');
                    fixtureValue.setAttribute('ID', deviceid);
                    if (fixtureValue.textContent) {
                        fixtureValue.textContent += ',';
                    }
                    fixtureValue.textContent += `${channel},${value}`;
                    scene.appendChild(fixtureValue);
                });
            });

        }

        this.updateContent();
    }

    get functionTree() {
        let xmlfunctions = this.xml.querySelectorAll('Engine > Function');
        let functions = {};
        for (let xmlfunction of xmlfunctions) {
            let type = xmlfunction.getAttribute('Type');
            let name = xmlfunction.getAttribute('Name');
            let id = xmlfunction.getAttribute('ID');
            let path = xmlfunction.getAttribute('Path') || '';

            let functionType = functions[type] || {};
            let pathArray = path.split('/');
            if (pathArray[0] === '') {
                pathArray.shift();
            }

            let current = functionType;
            for (let i = 0; i < pathArray.length; i++) {
                let pathPart = pathArray[i];
                if (!current[pathPart]) {
                    current[pathPart] = {};
                }
                current = current[pathPart];
            }

            current[name] = id;
            functions[type] = functionType;
        }
        return functions;
    }

    renameFunction(id, name) {
        let functionElement = this.xml.querySelector(`Engine > Function[ID="${id}"]`);
        functionElement.setAttribute('Name', name);
        this.updateContent();
    }

    addFolderInFunctionName(folderPath, folderName) {
        let functionElements = this.xml.querySelectorAll(`Engine > Function[Path="${folderPath}"]`);
        for (let functionElement of functionElements) {
            let name = functionElement.getAttribute('Name');
            if (name.includes(folderName)) {
                continue;
            }
            functionElement.setAttribute('Name', `${folderName}/${name}`);
        }
        this.updateContent();
    }
}