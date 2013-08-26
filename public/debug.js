define(function (require) {
    "use strict";

    var $ = require('jquery');

    return function () {

        this.addImage = function (image, position) {
            var id = "#debug" + position;
            if ($(id) === undefined) {
                $('#debug').append("<div id=" + id + "></div>");
            } else {
            }
        };
    };
})