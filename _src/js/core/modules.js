(function (w) {
    var _modules = [];

    var Module = function () {
        this.exports = {};
        this._initialized = false;
    };

    Module.prototype = {
        init: function (closure) {
            closure.call(this, this);
        }
    };

    w.define = function (moduleName, closure) {
        var module = _modules[moduleName];

        if (module) {
            console.log('Cannot redefine module ' + moduleName);
            throw 'Cannot redefine module ' + moduleName;
        } else {
            module = _modules[moduleName] = new Module();
        }

        module.init(closure);

        return module;
    };

    w.require = function (moduleName) {
        if (_modules[moduleName]) {
            return _modules[moduleName].exports;
        } else {
            console.log('Module ' + moduleName + ' is undefined');
            throw 'Module ' + moduleName + ' is undefined';
        }
    };
})(this);