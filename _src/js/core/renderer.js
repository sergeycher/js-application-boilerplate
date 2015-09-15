Mn.Renderer.render = function (template, data) {
    var t = _templates[template];
    if (t) {
        return Mustache.render(t, data);
    } else {
        return '';
    }
};