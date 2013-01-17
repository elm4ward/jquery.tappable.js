/*
 * jquery.tappable.js version 0.2
 *
 * More responsive (iOS-like) touch behaviour for buttons and other 'tappable' UI
 * elements, instead of Mobile Safari's 300ms delay and ugly grey overlay:
 *
 *  - A 'touched' class is added to the element as soon as it is tapped (or, in
 *    the case of a "long tap" - when the user keeps their finger down for a
 *    moment - after a specified delay).
 *
 *  - The supplied callback is called as soon as the user lifts their finger.
 *
 *  - The class is removed, and firing of the callback cancelled, if the user moves
 *    their finger (though this can be disabled).
 *
 *  - If the browser doesn't support touch events, it falls back to click events.
 *
 * More detailed explanation of behaviour and background:
 * http://aanandprasad.com/articles/jquery-tappable/
 *
 * See it in action here: http://nnnnext.com
 *
 * I recommend that you add a `-webkit-tap-highlight-color: rgba(0,0,0,0)`
 * style rule to any elements you wish to make tappable, to hide the ugly grey
 * click overlay.
 *
 * Tested on iOS 4.3 and some version of Android, I don't know. Leave me alone.
 *
 * Basic usage:
 *
 *   $(element).tappable(function() { console.log("Hello World!") })
 *
 * Advanced usage:
 *
 *   $(element).tappable({
 *     callback:     function() { console.log("Hello World!") },
 *     cancelOnMove: false,
 *     touchDelay:   150,
 *     onlyIf:       function(el) { return $(el).hasClass('enabled') }
 *   })
 *
 * Options:
 *
 *   cancelOnMove: If truthy, then as soon as the user moves their finger, the
 *                 'touched' class is removed from the element. When they lift
 *                 their finger, the callback will *not* be fired. Defaults to
 *                 true.
 *
 *   touchDelay:   Time to wait (ms) before adding the 'touched' class when the
 *                 user performs a "long tap". Best employed on elements that the
 *                 user is likely to touch while scrolling. Around 150 will work
 *                 well. Defaults to 0.
 *   
 *   onlyIf:       Function to run as soon as the user touches the element, to
 *                 determine whether to do anything. If it returns a falsy value,
 *                 the 'touched' class will not be added and the callback will
 *                 not be fired.
 *
 *   selector:    css like selector used to handle delegated tappable events
 *                e.g. $('body').tappable({selector:'a.test'}, callback: function(){ console.log(" test link tapped") })
 *
 */

;
(function ($) {
    var touchSupported = ('ontouchstart' in window)

    $.fn.tappable = function (options) {
        var cancelOnMove = true,
            onlyIf = function () {
                return true
            },
            touchDelay = 0,
            callback,
            selector;

        switch (typeof options) {
            case 'function':
                callback = options
                break;
            case 'object':
                callback = options.callback

                if (typeof options.cancelOnMove != 'undefined') {
                    cancelOnMove = options.cancelOnMove
                }

                if (typeof options.onlyIf != 'undefined') {
                    onlyIf = options.onlyIf
                }

                if (typeof options.touchDelay != 'undefined') {
                    touchDelay = options.touchDelay
                }

                if (typeof options.selector != 'undefined') {
                    selector = options.selector
                }

                break;
        }

        var fireCallback = function (el, event) {
            if (typeof callback == 'function' && onlyIf(el)) {
                callback.call(el, event)
            }
        }

        if (touchSupported) {
            this.on('touchstart', selector, function (event) {
                var $that = $(this);

                if (onlyIf(this)) {
                    $that.addClass('touch-started')

                    window.setTimeout(function () {
                        if ($that.hasClass('touch-started')) {
                            $that.addClass('touched')
                        }
                    }, touchDelay)
                }

                return true
            })

            this.on('touchend', selector, function (event) {
                var that = this,
                    $that = $(that);

                if ($that.hasClass('touch-started')) {
                    $that
                        .removeClass('touched')
                        .removeClass('touch-started')

                    fireCallback(that, event)
                }

                return true
            })

            this.on('click', selector,  function (event) {
                event.preventDefault()
            })

            if (cancelOnMove) {
                this.on('touchmove', selector, function () {
                    $(this)
                        .removeClass('touched')
                        .removeClass('touch-started')
                })
            }
        } else if (typeof callback == 'function') {
            this.on('click', selector, function (event) {
                if (onlyIf(this)) {
                    callback.call(this, event)
                }
            })
        }

        return this
    }
})(jQuery);

