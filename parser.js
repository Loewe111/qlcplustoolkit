
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

    get fixtureList() {
        return this.xml.querySelectorAll('Fixture');
    }
}