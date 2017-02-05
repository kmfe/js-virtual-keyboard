window.onload = function () {

    //add virtual keyboard
    //add iScroll
    var myScroll = null;
    setTimeout(function () {
        myScroll = new IScroll('#wrap', {
            mouseWheel: true,
            click: true     //open click event
        });
    }, 0);

    var $wrap = $('#wrap');

    $('div[name=appleWatch]').keyboard({
        'debug': true,
        showHandler: function () {
            $wrap.height(window.innerHeight - $('#keyboard').outerHeight(true) + 'px');
            myScroll.refresh();
        },
        hideHandler: function () {
            $wrap.height(window.innerHeight + 'px');
            myScroll.refresh();
        },
        beforeInput: function (data) {
            $(data.el).css({'border': '1px solid #cd0000'});
            myScroll && setTimeout(function () {
                myScroll.scrollToElement('.caret', 200, true, true);
            }, 200)
        },
        inputing: function (data) {
            console.log(data.type, data.el, data.value);
        },
        afterInput: function (data) {
            $(data.el).css({'border': '1px solid lightseagreen'});
            console.log(data.el, 'afterInput');
        }
    });

    var $place = $('#place'),
        $showKeyboard = $('#show-keyboard'),
        $hideKeyboard = $('#hide-keyboard'),
        $destory = $('#destory');

    $wrap.height(window.innerHeight + 'px');

    window.onresize = function () {
        setTimeout(function () {
            if ($('#keyboard :visible').length <= 0) {
                $wrap.height(window.innerHeight + 'px');
            } else {
                $wrap.height(window.innerHeight - $('#keyboard').outerHeight(true) + 'px');
            }
            setTimeout(function () {
                myScroll.refresh();
            }, 0)
        }, 200)
    };

    //bind custom event via Event delegate, make sure dynamic element efficient
    // $(document)
    //     .on('mockfocus', 'div[name=appleWatch]', function (e, el) {
    //         console.log('focus');
    //         $(this).css({'border': '1px solid #cd0000'});
    //         myScroll && setTimeout(function () {
    //             myScroll.scrollToElement('.caret', 200, true, true);
    //         }, 200)
    //     })
    //     .on('mocktype', 'div[name=appleWatch]', function (e, el, value) {
    //         console.log('type', e, el, value);
    //     })
    //     .on('mockblur', 'div[name=appleWatch]', function (e, el) {
    //         $(this).css({'border': '1px solid blue'});
    //         console.log('blur');
    //     });

    $destory.on('touchstart', function () {
        $.mockInputDestory();
    });

    $showKeyboard.on('touchend', function (e) {
        e.stopPropagation();
        $('[name=appleWatch]').eq(5).trigger('touchstart');
    });

    $hideKeyboard.on('touchend', function (e) {
        e.stopPropagation();
        $.keyboardToggle({
            isShow: false,
            hideHandler: function () {
                console.log('run callback');
            }
        });
        return false;
    });

    //dynamic add or remove
    var $add = $('#add'), $addData = $('#addData');
    $add.on('touchstart', function () {
        $place.append('<div name="appleWatch"></div>');
        $.mockInputRefresh($('div[name=appleWatch]'));
    });

    $addData.on('touchstart', function () {
        $place.append('<div name="appleWatch">had data before -------> </div>');
        $.mockInputRefresh($('div[name=appleWatch]'));
    });
};