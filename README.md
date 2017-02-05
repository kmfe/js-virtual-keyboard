### Why use Virtual Keyboard

- iPad's keyboard pops up can't trigger resize event, and force broswer to show scrollBar,
 so it's difficult to get the keyboard's height, but Android emit resize event;
	
- webPage in iPad's broswer, when click body element area except input element, 
the keyboard will not fall away, but Android's behavior is different;

- When click keyboardDown of iPad's keyboard, will emit focusout event, 
at the same time, input will be blur status, but on Android, the input remain focus status;

- In iPad10↑, if user don't operation interface，even though you use javaScript to make input focus, it still doesn't work;

- When use iScroll in iPad, the focused input in scroll area will go after iScroll's scrollBar, 
this behavior will cause input and caret no longer in same place; 

- and so on...


### jQuery Virtual Keyboard

     😳 A jQuery virtual keyboard plugin that works in the iPad, Android Pad, and more mobile tablet browser.
        use DIV element mock HTML input element feature and behavior.
      
     iPad mini [ios9.3.6]  ✔️
     iPad 4 [ios 10.1.1]  ✔️
     iPad mini [ios9.2] ✔️
     Samsung SM-T560 [Android 4.4.4] Chrome ✔️
     Huawei honor [Android 6.0]  ✔️
     iPhone6 [ios10.0.2]  ✔️
      
### How to use 

- Required
    - jQuery 3.1.1+
    - keyboard.scss 
    - iconfont for special characters  [iconfont official website](http://www.iconfont.cn/plus)

- Setup
    
```js
/**
* @param {Boolean} debug: true, whether open dubug mode  
* @param {Boolean} repeat: true, whether allow touch key auto-repeat
* @param {String} id:'keyboard', create virtual keyboard's id
* @param {RegExp} platform: /iPad|android|iphone/, support platform
* @param {String} dataname: 'keyboard', the namespace for mockInput
* @param {Object} keyboard: {}, default keyboard layout
* @param {Function} showHandler: keyboard show callback
* @param {Function} hideHandler: keyboard hide callback
*/

$('your element').keyboard({
    debug: true,
    repeat: true,
    id: 'string',
    platform: //,
    dataname:'keyboard',
    keyboard: {
                'normal': [
                    'q w e r t y u i o p',
                    'a s d f g h j k l',
                    '{Caps} z x c v b n m {Backspace}',
                    '{123} {up} {space} {hide} {down}'
                ],
                'caps': [
                    'Q W E R T Y U I O P',
                    'A S D F G H J K L',
                    '{Caps} Z X C V B N M {Backspace}',
                    '{123} {up} {space} {hide} {down}'
                ],
                'special': [
                    '1 2 3 4 5 6 7 8 9 0',
                    '- / : ; ( ) $ & @',
                    '_ \\ " . , ? ! \' {Backspace}',
                    '{123} {up} {space} {hide} {down}'
                ]
            },
    showHandler: null,
    hideHandler: null,
    beforeInput: function (data) {},
    inputing: function (data) {},
    afterInput: function (data) {}
})
```

- All interfaces and feature

    - when you add or del some mock-input element, you should run this func
    
        ```$.mockInputRefresh('your jQuery element');```
        
    - and when you don't need virtual keyboard, you can run this func
    
        ```$.mockInputDestory(); ```
        
    - toggle keyboard, by boolean paras to show or hide keyboard
    
        ```$.keyboardToggle({isShow: Boolean});```
    
    - beforeInput: function(data){}
    - inputing: function(data){}
    - afterInput: function(data){}
     
- Api with mockInput(had initialized your query element)
    
	**Attribute**
			
	1. `maxlength: [Number]  set this mockInput can fill characters at most;`
	
	2. `isdisabled: [Boolean]  set whether current element is available`

	3. `tabindex: [Number] like input tabindex`
	
	4. `data('namespace') [Array] get if you want get mockInput's data, just get the element's data('namespace') attribute`
		
	**Custom event**
		
	1. `mockFocus`: function(e, arg1){} like input's behavior `onfocus`, when mock-input is focused
			
	2. `mockBlur`: function(e, arg1){}  like input's behavior `onblur`, when mock-input is blured
			
	3. `mockType`: function(e, arg1, arg2){} like input's behavior `onkeydown`, when mock-input is focused, and virtual keyboard normal key(exclude 'backspace, caps, up, down, left, right' and more) is typed.
    
	> all of those funcs' arguments list：
	
		e: means event Object
		arg1: current element exactly
		arg2: when one key was typed, this argument indicate the key's value
	     
- Run demo

    - open terminal, run `npm install` to install all dependencies
    - then run gulp serve  `gulp serve`
    - open broswer in any mobile tablet by url [demo link](http://localhost:3000/index.html)
 

### To Do

- Dynamic change 'char-wrap' position to allow caret display all the time  ✔️
- By detect the distance of touchmove to enhance keyboard toggle precision  ✔️
- Build project with iScroll...  and more the third-party plug-ins  ✔️
- add simple automation tool ✔️
- May be more...

### Issues





