// =============================================================================
// Keyboard Controls
// =============================================================================
var key = {};
var keyMap = {32: 'space', 37: 'left', 38: 'up', 39: 'right', 40: 'down'};
$(document).keydown(function(e) {
    if(e.keyCode >= 37 && e.keyCode <= 40 || e.keyCode == 32)
        e.preventDefault();
    key[keyMap[e.keyCode]] = 'down';
    key.ctrl = e.ctrlKey;
    key.shift = e.shiftKey;
});
$(document).keyup(function(e) {
    if(e.keyCode >= 37 && e.keyCode <= 40 || e.keyCode == 32)
        e.preventDefault();
    key[keyMap[e.keyCode]] = 'up';
    key.ctrl = e.ctrlKey;
    key.shift = e.shiftKey;
});
// =============================================================================
// CLASS GENERATOR
// =============================================================================
function Class(methods) {
    var _ = function() {
        this.init.apply(this, arguments);
    };
    for (var property in methods) {
        _.prototype[property] = methods[property];
    }
    if (!_.prototype.init)
        _.prototype.init = function() {};
    return _;
}

// =============================================================================
// GOOGLE VISUALITION
// =============================================================================
google.load('visualization', '1', {packages: ['corechart']});