'use strict';

var learnjs = {};

learnjs.problemView = function(problemNumber) {
    var title = "Problem #" + problemNumber + " Coming soon!";
    return $('<div>').addClass('problem-view').text(title);
};

learnjs.showView = function(hash) {
    var routes = {
        '#problem': learnjs.problemView
    };
    var hashParts = hash.split('-');
    var viewFunc = routes[hashParts[0]];
    if (viewFunc) {
        $('.view-container').empty().append(viewFunc(hashParts[1]));
    }
};

learnjs.appOnReady = function() {
    window.onhashchange = function() {
        console.log('here');
        learnjs.showView(window.location.hash);
    };
    learnjs.showView(window.location.hash);
};
