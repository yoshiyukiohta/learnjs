'use strict';

function googleSignIn(googleUser) {

    var id_token = googleUser.getAuthResponse().id_token;
    console.log('id_token', id_token);

    AWS.config.update({
        region: "us-east-1",
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: learnjs.poolId,
            Logins: {
                'accounts.google.com': id_token
            }
        })
    });

    function refresh() {
        console.log('refresh called');
        return gapi.auth2.getAuthInstance().signIn({
            prompt: 'login'
        }).then(function(userUpdate) {
            console.log('userUpdate', userUpdate);
            var creds = AWS.config.credentials;
            var newToken = userUpdate.getAuthResponse().id_token;
            creds.params.Logins['accounts.google.com'] = newToken;
            return learnjs.aswRefresh();
        })
    }

    learnjs.awsRefresh().then(function(id) {
        console.log('id', id);
        learnjs.identity.resolve({
            id: id,
            email: googleUser.getBasicProfile().getEmail(),
            refresh: refresh
        })
    });

}

var learnjs = {
    poolId: 'us-east-1:83db3dbd-6446-4e9d-a679-5831104bff07',
    identity: new $.Deferred()
};


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

learnjs.awsRefresh = function() {
    var deferred = new $.Deferred();
    console.log('awsRefresh called');
    console.log('AWS.config.credentials', AWS.config.credentials);
    console.log('AWS.config.credentials.identityId', AWS.config.credentials.identityId);

    AWS.config.credentials.refresh(function(err) {
        console.log('err', err);
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(AWS.config.credentials.identityId)
        }
    });
    return deferred.promise();
};

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

learnjs.profileView = function() {
    return learnjs.template('profile-view');
    learnjs.identity.done(function(identity) {
        view.find('.email').text(identity.email);
    });
}

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
        '#profile': learnjs.profileView,
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

learnjs.addProfileLink = function(profile) {
    var link = learnjs.template('profile-link');
    link.find('a').text(profile.email);
    console.log('profile.email', profile.email);
    $('.signin-bar').prepend(link);
};

learnjs.appOnReady = function() {
    window.onhashchange = function() {
        learnjs.showView(window.location.hash);
    };
    learnjs.showView(window.location.hash);
    learnjs.identity.done(learnjs.addProfileLink);
};
