this['onNode'] = (function (win) {
    var doc = win.document;

    // Provides MutationObserver, if it exists.
    var MutationObserver = (
        win.MutationObserver ||
        win.WebKitMutationObserver ||
        win.MozMutationObserver
    );

    // Provides Element.matches
    var matches = (function () {
        var matches;

        if (win.Element.prototype.matches) {
            matches = win.Element.prototype.matches;
        } else if (win.Element.prototype.matchesSelector) {
            matches = win.Element.prototype.matchesSelector;
        } else if (win.Element.prototype.mozMatchesSelector) {
            matches = win.Element.prototype.mozMatchesSelector;
        } else if (win.Element.prototype.msMatchesSelector) {
            matches = win.Element.prototype.msMatchesSelector;
        } else if (win.Element.prototype.oMatchesSelector) {
            matches = win.Element.prototype.oMatchesSelector;
        } else if (win.Element.prototype.webkitMatchesSelector) {
            matches = win.Element.prototype.webkitMatchesSelector;
        } else {
            matches = function (selector) {
                var node = this;
                var parent = node.parentNode || node.document;
                var nodes = parent.querySelectorAll(selector);
                var i = -1;
                while (nodes[++i] && nodes[i] != node);
                return !!nodes[i];
            };
        }

        return function (element, selector) {
            return matches.call(element, selector);
        }
    })();

    // Nodes that have already been processed
    var done = [];

    return function (cssSelector, callback) {
        // Function that runs the callback on matching nodes
        var run = function run(node) {
            if (!node) {
                return;
            }

            if (node instanceof win.Event) {
                if (node.target) {
                    node = node.target;
                } else {
                    return;
                }
            }

            // Skip nodes already done, scripts, stylesheets and templates.
            if (-1 !== done.indexOf(node)) {
                return;
            } else if (node instanceof win.HTMLScriptElement) {
                return;
            } else if (node instanceof win.HTMLStyleElement) {
                return;
            } else if (node instanceof win.HTMLTemplateElement) {
                return;
            } else {
                // Mark node as done
                done.push(node);
            }

            if ((node instanceof win.HTMLElement) && matches(node, cssSelector)) {
                callback(node);
            }

            if (node.querySelectorAll) {
                [].forEach.call(node.querySelectorAll(cssSelector), run);
            }
        };

        if (-1 !== ['complete', 'interactive'].indexOf(doc.readyState)) {
            run(doc);
        } else {
            doc.addEventListener('DOMContentLoaded', function () {
                run(doc);
            });
        }

        // `run` on inserted nodes
        // Use MutationObserver if possible, otherwise fall back to DOM events.
        if (MutationObserver) {
            new MutationObserver(function (mutations, observer) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes && mutation.addedNodes.length) {
                        [].map.call(mutation.addedNodes, run);
                    }
                });
            }).observe(doc, {
                subtree: true,
                attributes: false,
                characterData: false,
                childList: true
            });
        } else {
            // Also DOMNodeRemovedFromDocument, DOMCharacterDataModified,
            // DOMElementNameChanged, DOMNodeRemoved, DOMAttrModified
            var runTarget = function (e) { run(e.target); };
            doc.addEventListener('DOMNodeInserted', runTarget);
            doc.addEventListener('DOMNodeInsertedIntoDocument', runTarget);
            doc.addEventListener('DOMSubtreeModified', runTarget);
        }
    };
})(window);
