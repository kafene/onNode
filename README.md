# onNode

bind persistent events to css selectors

This script provides a function called `onNode`, called with two arguments,
the first being a CSS selector, and the second being a callback function to
be applied against a matching element.

When the function is called, if the document has already loaded, the callback
is applied immediately to all matching nodes in the document. If it hasn't loaded,
then it is applied after the `DOMContentLoaded` event fires.

In either case, a MutationObserver is created, or for browsers without MutationObserver,
some DOM events are used, and when elements are added or changed which match the given
CSS selector, the callback is applied to them as well.

I've found this useful for many things, watching for elements which may be dynamically
injected after the document has loaded, but I still want to modify. In browsers
that support MutationObserver, it seems to respond very quickly and not introduce
significant overhead.

# Example

### Watch for any elements with the class name 'bold', and bold them:

```js
onNode('.bold', function (el) {
    el.style.fontWeight = 'bold';
});
```

Inject some `.bold` elements:

```js
var a = document.createElement('a');
var s = document.createElement('span');
a.className = 'bold';
s.className = 'bold';
a.textContent = 'I am a bold <A>';
s.textContent = 'I am a bold <SPAN>';

// Insert them right at the top of the body
document.body.insertAdjacentElement('AFTERBEGIN', a);
document.body.insertAdjacentElement('AFTERBEGIN', s);
```

### Give all external links a `noreferrer` attribute:

```js
onNode('a[href^=http]:not([rel~=noreferrer])', function (a) {
    if (a.hostname !== location.hostname) {
        var rel = a.rel.trim().split(/\s+/).concat('noreferrer').join(' ').trim();
        a.setAttribute('rel', rel);
    }
});
```

