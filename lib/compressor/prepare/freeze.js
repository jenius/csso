var allowedPseudoClasses = {
    'after': 1,
    'before': 1
};
var nonFreezePreudoElements = {
    'first-letter': true,
    'first-line': true
};
var nonFreezePseudoClasses = {
    'link': true,
    'visited': true,
    'hover': true,
    'active': true,
    'first-letter': true,
    'first-line': true
};

function containsPseudo(sselector) {
    return sselector.some(function(node) {
        switch (node.type) {
            case 'pseudoc':
            case 'pseudoe':
            case 'nthselector':
                if (node.name.value in nonFreezePseudoClasses === false) {
                    return true;
                }
        }
    });
}

function selectorSignature(selector) {
    // looks wrong and non-efficient
    return selector.map(function(node) {
        return node.info.s;
    }).sort().join(',');
}

function freezeNeeded(selector) {
    return selector.some(function(simpleSelector) {
        return simpleSelector.some(function(node) {
            switch (node.type) {
                case 'pseudoc':
                    if (node.name.value in nonFreezePseudoClasses === false) {
                        return true;
                    }
                    break;

                case 'pseudoe':
                    if (node.name.value in nonFreezePreudoElements === false) {
                        return true;
                    }
                    break;

                case 'nthselector':
                    return true;
            }
        });
    });
}

function composePseudoID(selector) {
    var pseudos = [];

    selector.each(function(simpleSelector) {
        if (containsPseudo(simpleSelector)) {
            pseudos.push(simpleSelector.info.s);
        }
    });

    return pseudos.sort().join(',');
}

function pseudoSelectorSignature(selector, exclude) {
    var pseudos = {};
    var wasExclude = false;

    selector.each(function(simpleSelector) {
        simpleSelector.each(function(node) {
            switch (node.type) {
                case 'pseudoc':
                case 'pseudoe':
                case 'nthselector':
                    if (!exclude.hasOwnProperty(node.name.value)) {
                        pseudos[node.name.value] = 1;
                    } else {
                        wasExclude = true;
                    }
                    break;
            }
        });
    });

    return Object.keys(pseudos).sort().join(',') + wasExclude;
}

function markSimplePseudo(selector) {
    var hash = {};

    selector.each(function(simpleSelector) {
        var info = simpleSelector.info;

        info.pseudo = containsPseudo(simpleSelector);
        info.sg = hash;
        hash[info.s] = true;
    });
}

module.exports = function freeze(node) {
    var selector = node.selector;
    var freeze = freezeNeeded(selector);

    if (freeze) {
        var info = node.info;

        info.freeze = freeze;
        info.freezeID = selectorSignature(selector);
        info.pseudoID = composePseudoID(selector);
        info.pseudoSignature = pseudoSelectorSignature(selector, allowedPseudoClasses);
        markSimplePseudo(selector);
    }
};