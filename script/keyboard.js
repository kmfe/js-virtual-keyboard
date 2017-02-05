;(function ($, window) {
    "use strict";
    if (typeof $ == 'undefined') {
        throw new Error('this plugin requires jQuery~');
    } else {
        $.fn.keyboard = function (o) {

            var d = {
                'debug': true,
                'id': 'keyboard',
                'repeat': true,
                'platform': 'iPad|android|iPhone',
                'dataname': 'keyboard',
                'keyboard': {
                    'normal': [
                        'q w e r t y u i o p {Backspace}',
                        'a s d f g h j k l',
                        '{Caps} z x c v b n m {hide}',
                        '{123} {up} {left} {space} {right} {down}'
                    ],
                    'caps': [
                        'Q W E R T Y U I O P {Backspace}',
                        'A S D F G H J K L',
                        '{Caps} Z X C V B N M {hide}',
                        '{123} {up} {left} {space} {right} {down}'
                    ],
                    'special': [
                        '1 2 3 4 5 6 7 8 9 0 {Backspace}',
                        '- / : ; ( ) $ & @',
                        '_ \\ " . , ? ! \' {hide}',
                        '{123} {up} {left} {space} {right} {down}'
                    ]
                },
                showHandler: null,
                hideHandler: null,
                beforeInput: function (data) {},
                inputing: function (data) {},
                afterInput: function (data) {}
            };

            var s = $.extend({}, d, o);

            var index = 0,   //detect caret's position
                caret = '<div class="caret"></div>',
                key = null,     //indicate keyboard when keyboard is created
                intervalId = null,  //keyboard action repeat interval
                timeoutId = null,
                currentEle = null,  //indicate current target
                $allEle = [],   // indicate all initialized element
                toggleDelayId = null,
                $lastEle = null,
                isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;

            //mock input event
            function mockInputHandler(e) {
                var caret = document.getElementsByClassName('caret')[0],
                    target = e.target;

                $.keyboardToggle({isShow: true});

                if (e.target.tagName.toLowerCase() == 'span') {
                    if (!isDescendant(currentEle, e.target)) {
                        currentEle = e.target.parentNode.parentNode;
                    }
                    index = $(target).index();
                } else if (e.target.className.indexOf('char-wrap') !== -1) {
                    currentEle = target.parentNode;
                } else if (e.target.className.indexOf('caret') !== -1) {
                    currentEle = target.parentNode;
                } else {
                    currentEle = target;
                    var len = currentEle.getElementsByTagName('span').length;
                    index = len ? len : 0;
                }
                if ($lastEle != null) {
                    if (!$lastEle[0].isEqualNode(currentEle)) {
                        $lastEle.trigger('mockblur', $lastEle[0]);
                        s.afterInput && s.afterInput({el: $lastEle[0]});
                    }
                }
                $lastEle = $(currentEle);
                caret && caret.parentNode.removeChild(caret);
                bindView(currentEle, $(currentEle).data(s.dataname), 'insert');
                $(currentEle).trigger('mockfocus', currentEle);
                s.beforeInput && s.beforeInput({el: currentEle})
            }

            //render data and view, caret
            function bindView(ele, arr, type, value) {
                if (s.debug) console.info('bindView paras [ele, arr, type, value]', ele, arr, type, value);

                var maxlen = ele.getAttribute('maxlength') ? ele.getAttribute('maxlength') : 999;
                if (type == 'delete' && arr.length <= 0) return;
                if (type == 'add' && arr.length >= maxlen) return;

                function renderData(index, arr, type, value) {
                    switch (type) {
                        case 'delete':
                            if (index <= 0) return arr;
                            arr.splice(index - 1, 1);
                            break;
                        case 'add':
                            if (!value) return arr;
                            // all filter string's logic
                            if (value == '&nbsp;') value = ' ';
                            arr.splice(index, 0, value);
                            break;
                        case 'insert':
                            break;
                    }
                    return arr;
                }

                function renderView(ele) {
                    var str = '';
                    for (var i = 0; i < arr.length; i++) {
                        var temp = arr[i] == '' ? '&nbsp;' : arr[i];
                        str += '<span class="char">' + temp + '</span>';
                    }
                    ele.innerHTML = '<div class="char-wrap">' + str + '</div>' + caret;
                }

                function renderCaret(ele, index) {
                    if (s.debug) console.info('renderCaret paras [ele, index]', ele, index);

                    var left = parseInt(getStyle(ele, 'padding-left')),
                        top = parseInt(getStyle(ele, 'padding-top')),
                        bottom = parseInt(getStyle(ele, 'padding-bottom')),
                        height = parseInt(getStyle(ele, 'height')),
                        fontSize = parseInt(getStyle(ele, 'font-size')) || 14,  //default fontSize 14px
                        pos = [],  //to store every character's width
                        wrapWidth = parseInt(ele.offsetWidth),
                        caret = document.getElementsByClassName('caret')[0],
                        caretWrap = ele.children[0],
                        lastMargin = 0;

                    var aSpan = ele.getElementsByTagName('span'),
                        leftPos = 0;

                    if (aSpan.length != 0) {
                        for (var i = 0; i < index; i++) {
                            var posItem = parseFloat(getStyle(aSpan[i], 'width'));
                            pos.push(posItem);
                            leftPos += posItem;
                        }
                    }

                    if (leftPos > wrapWidth) lastMargin = parseInt(wrapWidth) - left - leftPos - 5;
                    caretWrap && (caretWrap.style.cssText = 'margin-left:' + lastMargin + 'px');
                    caret && (caret.style.cssText = 'left:' + Math.min(leftPos + left, wrapWidth - 5) + 'px; ' +
                        'top:' + (height - fontSize - 2) / 2 + 'px; ' +
                        'height:' + (fontSize + 4) + 'px;');

                    return pos;
                }

                index <= 0 && (index = 0);

                renderData(index, arr, type, value);

                if (type == 'delete') {
                    index--;
                    $(ele).trigger('mocktype', [currentEle, 'delete']);
                    s.inputing && s.inputing({el: currentEle, type: 'delete'})
                } else if (type == 'add') {
                    index++;
                    $(ele).trigger('mocktype', [currentEle, value]);
                    s.inputing && s.inputing({el: currentEle, type: 'add', value: value})
                }

                renderView(ele);
                renderCaret(ele, index);
            }

            //create keyboard and key action
            function keyboardInit(type) {
                var layout = s.keyboard[type],
                    keyboard = null;

                if (!document.getElementById(s.id)) {
                    keyboard = document.createElement('div');
                    keyboard.id = s.id;
                    keyboard.innerHTML = initKeys();
                    document.body.appendChild(keyboard);
                } else {
                    keyboard = document.getElementById(s.id);
                    $(keyboard).off('touchstart.mockKeyboard touchend.mockKeyboard');
                    keyboard.innerHTML = initKeys();
                }

                key = $(keyboard);

                //parse keyboard value
                function initKeys() {
                    var keys = '';

                    function combineDom(className, value, isIcon) {
                        var str = '<div class="key ' + className + '">',
                            strEnd = '</span></div>';
                        if (isIcon) {
                            str += '<span class="iconfont">' + value;
                        } else {
                            str += '<span>' + value;
                        }
                        str += strEnd;
                        return str;
                    }

                    for (var i = 0; i < layout.length; i++) {
                        keys += '<div class="row">';
                        for (var j = 0, arr = layout[i].split(' '); j < arr.length; j++) {
                            var match = arr[j].match(/{(\w+)}/) ? arr[j].match(/{(\w+)}/)[1] : '';
                            switch (match) {
                                case 'Caps':
                                    keys += combineDom('gray key-caps', '&#xe619;', true);
                                    break;
                                case 'space':
                                    keys += combineDom('gray key-space', '&nbsp;', true);
                                    break;
                                case 'Backspace':
                                    keys += combineDom('gray key-backspace', '&#xe696;', true);
                                    break;
                                case 'hide':
                                    keys += combineDom('gray key-hide', '&#xe60b;', true);
                                    break;
                                case '123':
                                    keys += combineDom('gray key-special', '123', false);
                                    break;
                                case 'up':
                                    keys += combineDom('gray key-up', '&#xe600;', true);
                                    break;
                                case 'down':
                                    keys += combineDom('gray key-down', '&#xe605;', true);
                                    break;
                                case 'left':
                                    keys += combineDom('gray key-left', '&#xe608;', true);
                                    break;
                                case 'right':
                                    keys += combineDom('gray key-right', '&#xe609;', true);
                                    break;
                                default:
                                    keys += combineDom('white key-normal', arr[j], false);
                                    break;
                            }
                        }
                        keys += '</div>';
                    }
                    return keys;
                }

                //all key action
                function keyboardActionRepeat() {
                    intervalId && clearInterval(intervalId);
                    timeoutId && clearTimeout(timeoutId);
                }

                function keyboardAction(ele) {
                    keyboardActionRepeat();
                    if (currentEle == null) return;
                    var className = ele[0].className;
                    if (className.indexOf('key-backspace') != -1) {
                        bindView(currentEle, $(currentEle).data(s.dataname), 'delete');
                        if (s.repeat) {
                            timeoutId = setTimeout(function () {
                                intervalId = setInterval(function () {
                                    bindView(currentEle, $(currentEle).data(s.dataname), 'delete');
                                }, 100);
                            }, 200)
                        }
                    } else if (className.indexOf('key-caps') != -1) {
                        keyActionCaps(ele[0]);
                    } else if (className.indexOf('key-up') != -1) {
                        keyActionMove(currentEle, 'down');
                    } else if (className.indexOf('key-down') != -1) {
                        keyActionMove(currentEle, 'up');
                    } else if (className.indexOf('key-left') != -1) {
                        keyActionMove(currentEle, 'left');
                        if (s.repeat) {
                            timeoutId = setTimeout(function () {
                                intervalId = setInterval(function () {
                                    keyActionMove(currentEle, 'left');
                                }, 100);
                            }, 200)
                        }
                    } else if (className.indexOf('key-right') != -1) {
                        keyActionMove(currentEle, 'right');
                        if (s.repeat) {
                            timeoutId = setTimeout(function () {
                                intervalId = setInterval(function () {
                                    keyActionMove(currentEle, 'right');
                                }, 100);
                            }, 200)
                        }
                    } else if (className.indexOf('key-hide') != -1) {
                        $.keyboardToggle({isShow: false});
                    } else if (className.indexOf('key-special') != -1) {
                        keyActionSpecial(ele[0]);
                    } else {
                        var value = '';
                        value = ele.find('span').html();
                        bindView(currentEle, $(currentEle).data(s.dataname), 'add', value);
                        if (s.repeat) {
                            timeoutId = setTimeout(function () {
                                intervalId = setInterval(function () {
                                    value = ele.find('span').html();
                                    bindView(currentEle, $(currentEle).data(s.dataname), 'add', value);
                                }, 100);
                            }, 200)
                        }
                    }
                }

                function keyActionCaps(ele) {
                    var caps = null;
                    if (ele.classList.contains('caps-on')) {
                        keyboardInit('normal');
                        caps = document.getElementsByClassName('key-caps')[0];
                        caps.classList.remove('caps-on');
                        caps.children[0].innerHTML = '&#xe619;';
                    } else {
                        keyboardInit('caps');
                        caps = document.getElementsByClassName('key-caps')[0];
                        caps.classList.add('caps-on');
                        caps.children[0].innerHTML = '&#xe628;';
                    }
                }

                function keyActionSpecial(ele) {
                    var special = null;
                    if (ele.classList.contains('special-on')) {
                        keyboardInit('normal');
                        special = document.getElementsByClassName('key-special')[0];
                        special.classList.remove('special-on');
                        special.innerHTML = '123';
                    } else {
                        keyboardInit('special');
                        special = document.getElementsByClassName('key-special')[0];
                        special.classList.add('special-on');
                        special.innerHTML = 'ABC';
                    }
                }

                function keyActionMove(ele, type) {
                    var inputs = $allEle,  //get all mockInput
                        caret = document.getElementsByClassName('caret')[0],
                        len = inputs.length,
                        currentIndex = ele.getAttribute('tabindex');

                    caret && caret.parentNode.removeChild(caret);

                    function moveIndex() {
                        if (type == 'up') {
                            currentIndex++;
                            currentIndex > len - 1 && (currentIndex = len - 1);
                        } else if (type == 'down') {
                            currentIndex--;
                            currentIndex < 0 && (currentIndex = 0);
                        }
                        currentEle = inputs[currentIndex].get(0);
                        while ($(currentEle).attr('isdisabled') == 'true') moveIndex();
                    }

                    function movePosIndex() {
                        var len = $(currentEle).find('span').length;
                        if (type == 'right') {
                            index++;
                            index >= len && (index = len);
                        } else if (type == 'left') {
                            index--;
                            index < 0 && (index = 0);
                        }
                    }

                    switch (type) {
                        case 'up':
                        case 'down':
                            $lastEle.trigger('mockblur', $lastEle[0]);
                            s.afterInput && s.afterInput({el: $lastEle[0]});
                            moveIndex();
                            $lastEle = $(currentEle);
                            index = $(currentEle).find('span').length;
                            bindView(currentEle, $(currentEle).data(s.dataname), 'insert');
                            $(currentEle).trigger('mockfocus', currentEle);
                            s.beforeInput && s.beforeInput({el: currentEle});
                            break;
                        case 'left':
                        case 'right':
                            movePosIndex();
                            bindView(currentEle, $(currentEle).data(s.dataname), 'insert');
                            break;
                    }
                }

                //add event response
                key.on('touchstart.mockKeyboard', '.key', function (e) {
                    isAndroid && $(this).addClass("fake-active");
                    keyboardAction($(this));
                    e.preventDefault();
                    return false;
                });

                key.on('touchend.mockKeyboard', '.key', function () {
                    isAndroid && $(this).removeClass("fake-active");
                    keyboardActionRepeat();
                });

                key.on('touchmove.mockKeyboard', function (e) {
                    e.preventDefault();
                    return false;
                });

                var startX = 0, startY = 0,
                    touchMoved = false;

                function detectTouchStart(event) {
                    touchMoved = false;
                    var touch = event.originalEvent.changedTouches[0];
                    startX = touch.screenX;
                    startY = touch.screenY;
                }

                function detectTouchMove(event) {
                    var touch = event.originalEvent.changedTouches[0];
                    var moveX = touch.screenX;
                    var moveY = touch.screenY;
                    if (Math.abs(moveX - startX) > 20 || Math.abs(moveY - startY) > 20) {
                        touchMoved = true;
                    }
                }

                function detectTouchEnd() {
                    if (touchMoved) touchMoved = false;
                    else {
                        if ($(event.target).closest($(keyboard)).length > 0) return;
                        $.keyboardToggle({isShow: false});
                    }
                }

                $(document).on('touchstart.mockKeyboard', detectTouchStart);
                $(document).on('touchmove.mockKeyboard', detectTouchMove);
                $(document).on('touchend.mockKeyboard', detectTouchEnd);

                if (s.debug) console.info('Keyboard init done');
            }

            //component utils
            function isDescendant(parent, child) {
                var node = child.parentNode;
                while (node != null) {
                    if (node == parent) {
                        return true;
                    }
                    node = node.parentNode;
                }
                return false;
            }

            function getStyle(ele, name) {
                return window.getComputedStyle ? getComputedStyle(ele, false)[name] : ele.currentStyle[name];
            }

            //interface api
            $.extend({
                mockInputRefresh: function (ele) {
                    //make sure create visual keyboard first
                    if (!new RegExp(s.platform, 'i').test(navigator.userAgent)) return;
                    keyboardInit('normal');
                    $allEle.length = 0;
                    ele.each(function (i) {
                        var $this = $(this);
                        $this.addClass('mock-input')
                            .attr('tabindex', i);

                        if (!$this.data(s.dataname)) {
                            if ($this.text() == '') {
                                $this.data(s.dataname, []);
                            } else {
                                $this.data(s.dataname, $this.text().split(''));
                                bindView($this[0], $this.data(s.dataname), 'insert');
                                $('.caret').remove();
                            }
                        }
                        $allEle.push($this);

                        if ($this.attr('isdisabled')) return;

                        $this
                            .off('touchstart.mockKeyboard touchend.mockKeyboard')
                            .on('touchstart.mockKeyboard', function (e) {
                                mockInputHandler(e);
                                return false;
                            })
                            .on('touchend.mockKeyboard', function () {
                                return false;
                            });

                        if (s.debug) console.warn('init entry element ==>' + i, $(this));
                    });
                },
                mockInputDestory: function () {
                    key && key.remove();
                    $('.caret').remove();
                    $allEle.forEach(function (ele) {
                        $(ele).off('touchstart.mockKeyboard touchend.mockKeyboard');
                    });
                    $(document).off('touchstart.mockKeyboard touchmove.mockKeyboard touchend.mockKeyboard')
                },
                keyboardToggle: function (options) {
                    var defaults = {
                        isShow: false,
                        hideHandler: null,
                        showHandler: null
                    };
                    var toggleOptions = $.extend(defaults, options);

                    toggleOptions.isShow = toggleOptions.isShow || false;

                    toggleDelayId = setTimeout(function () {
                        key.off('transitionend webkitTransitionEnd');
                        if (toggleOptions.isShow) {
                            if ($.keyboardStatus == true) return;
                            key.css('willChange', 'transform');
                            key.css('display', 'block').height(); //force layout
                            key.css({
                                'transform': 'translate3d(-50%, 0, 0)',
                                '-webkit-transform': 'translate(-50%, 0, 0)'
                            });
                            $.keyboardStatus = true;
                            s.showHandler && s.showHandler();
                            toggleOptions.showHandler && toggleOptions.showHandler();
                            clearTimeout(toggleDelayId);
                        } else {
                            if ($.keyboardStatus == false) return;
                            $('.caret').remove();
                            clearTimeout(toggleDelayId);  //must clearTimeout first !!
                            $.keyboardStatus = false;
                            s.hideHandler && s.hideHandler();
                            toggleOptions.hideHandler && toggleOptions.hideHandler();
                            if ($lastEle != null) {
                                $(currentEle).trigger('mockblur', currentEle);
                                s.afterInput && s.afterInput({el: currentEle});
                                $lastEle = null;
                            }
                            key.css({
                                'transform': 'translate3d(-50%,' + key.height() + 'px, 0)',
                                '-webkit-transform': 'translate(-50%,' + key.height() + 'px, 0)'
                            });
                            key.on('webkitTransitionEnd transitionend', function () {
                                key.css('display', 'none');
                                $(this).css('willChange', 'auto');
                            });
                        }
                        toggleDelayId && clearTimeout(toggleDelayId);
                        return $.keyboardStatus || false;
                    }, 200);
                }
            });

            $.mockInputRefresh(this);

            return $(this);
        };
    }
})(jQuery, window);


