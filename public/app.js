'use strict';

var learnjs = {};

learnjs.problems = [
    {
        description: "What is truth?",
        code: "function problem() { return __; }"
    },
    {
        description: "Simple Math",
        code: "function problem() { return 42 === 6 * __; }"
    }
];

learnjs.flashElement = function(elem, content) {
    elem.fadeOut('fast', function() {
        elem.html(content);
        elem.fadeIn();
    });
};

learnjs.triggerEvent = function(name, args) {
    console.log('triggerEvent', name, args);
    $('.view-container > *').trigger(name, args);
};

learnjs.applyObject = function(obj, elem) {
    for(var key in obj) {
        elem.find('[data-name="' + key + '"]').text(obj[key]);
    }
};

learnjs.template = function(name) {
    console.log('name', name);
    return $('.templates .' + name).clone();
};

learnjs.landingView = function() {
    return learnjs.template('landing-view');
};

learnjs.buildCorrectFlash = function(problemNumber) {
    var correctFlash = learnjs.template('correct-flash');
    var link = correctFlash.find('a');
    if (problemNumber < learnjs.problems.length) {
        link.attr('href', '#problem-' + (problemNumber + 1));
    } else {
        link.attr('href', '');
        link.text("You're Finished!");
    }
    return correctFlash;
};

learnjs.problemView = function(data) {
    var problemNumber = parseInt(data, 10);
    var view = $('.templates .problem-view').clone();

    var problemData = learnjs.problems[problemNumber - 1];
    var resultFlash = view.find('.result');

    function checkAnswer() {
        var answer = view.find('.answer').val();
        var test = problemData.code.replace('__', answer) + '; problem();';
        return eval(test);
    };

    function checkAnswerClick() {
        if (checkAnswer()) {
            var correctFlash = learnjs.buildCorrectFlash(problemNumber);
            learnjs.flashElement(resultFlash, correctFlash);
        } else {
            learnjs.flashElement(resultFlash, 'Incorrect!');
        }
        return false;
    }

    // check button bind event
    view.find('.check-btn').click(checkAnswerClick);
    // set Title
    view.find('.title').text("Problem #" + problemNumber);

    learnjs.applyObject(problemData, view);

    if (problemNumber < learnjs.problems.length) {

        var buttonItem = learnjs.template('skip-btn');

        buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));

        $('.nav-list').append(buttonItem);

        view.bind('removingView', function() {
            console.log('removingView called');
            buttonItem.remove();
        });

    }

    return view;
};

learnjs.showView = function(hash) {
    var routes = {
        '#problem': learnjs.problemView,
        '#': learnjs.landingView,
        '': learnjs.landingView
    };
    var hashParts = hash.split('-');
    var viewFunc = routes[hashParts[0]];
    if (viewFunc) {
        learnjs.triggerEvent('removingView', []);
        $('.view-container').empty().append(viewFunc(hashParts[1]));
    }
};

learnjs.appOnReady = function() {
    window.onhashchange = function() {
        learnjs.showView(window.location.hash);
    };
    learnjs.showView(window.location.hash);
};
