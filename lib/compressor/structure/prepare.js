function translate(node) {
    node.info.s = node.translate();
}

module.exports = {
    simpleselector: translate,

    declaration: translate,
    property: translate,
    value: translate,
    filter: translate,

    ruleset: function(node, root) {
        root.rulesetParents.add(node.parent.token);
    }
};