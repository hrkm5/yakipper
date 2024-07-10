var PopupMsg = (function() {
    // Singleton
    let _instance;

    function _constructor() {

    //
    // Check the browser
    //
    let _isFirefox = (navigator.userAgent.indexOf("Firefox") != -1);
    let _BROWSER = chrome;
    if( _isFirefox ) {
        _BROWSER = browser;
    } else {
        _BROWSER = chrome;
        _isFirefox = false;
    }


    ///
    /// Private things
    const _moduleName = "PopupMsg";
    const _moduleSName = "PMSG";

    let _debug = false;
    let _verbose = false;

    let _CARD = {
            topMargin: 5,
            offset: 15,

            number: 0,
            heights: {},
            prefix: "popupCard",
            msgPrefix: "popupCardMsg",
            width: 490,
            height: 34,
            timeout: 1000,
            z_index: 999999
        };

    let _insertDetect = {
            uniqueId: 0,
            uniquePrefix: "insertNode"
    }

    let _options = {}; // options to sync.

    function _getModuleName() {
        return _moduleName;
    }
    function _fadeOut(__targetNode, __durationInMilliSecond, __callbackOnComplete) {
        let granularity = 10;
        let easing = 1.0 / (__durationInMilliSecond/granularity);
        let opacity = 1;
        let repeat = Math.max(parseInt(__durationInMilliSecond/granularity), 1);
        
        __targetNode.style.opacity = opacity;

        let animateId = setInterval(function() {
            opacity -= easing;
            __targetNode.style.opacity = opacity;
            repeat--;

            // Termination condition
            if(repeat <= 0) {
                clearInterval(animateId);
                __targetNode.style.opacity = "";
                __targetNode.style.display = "none";
                __callbackOnComplete(__targetNode);
            }
        }, granularity);
    }
    function _animateMoveToTop(__targetNode, __targetTopPx, __durationInMilliSecond) {
        let granularity = 10;
        let startPosi = (!__targetNode.style.top)? 0: parseInt(__targetNode.style.top);
        let moveDirection = startPosi - __targetTopPx;
        let begin = new Date() - 0;
        let animateId = setInterval(function() {
            var current = new Date() - begin;
            if (current > __durationInMilliSecond) {
                clearInterval(animateId);
                current = __durationInMilliSecond;
            }
            __targetNode.style.top = startPosi - moveDirection * (current / __durationInMilliSecond) + "px";
        }, granularity);
    }

    //////
    //////
    function _getTopPosition( __marginTop ) {
        var topPosi = __marginTop;
        for(var index in _CARD.heights ) {
            topPosi += _CARD.offset + _CARD.heights[index];
        }
        return topPosi;
    };

    function _saveCardHeight( __cardNumber, __cardHeight ) {
        if(_debug) console.log("["+_moduleSName+"] _saveCardHeight() _cardNumber:"+__cardNumber + " _cardHeight:"+__cardHeight);
        _CARD.heights[ __cardNumber ] = __cardHeight;
        for(var key in _CARD.heights) {
            if(_verbose) console.log("["+_moduleSName+"] _saveCardHeight() key = " + key +" Height = " + _CARD.heights[key]);
        }
    }

    function _getAndIncCardNumber() {
        if(_verbose) console.log("["+_moduleSName+"] _getAndIncCardNumber()  _cardNumber = " + _CARD.number);
        return _CARD.number++;
    }
    function _deleteCardHeight( __cardNumber ) {
        delete _CARD.heights[ __cardNumber ];
    }
    function _getCardHeights( __callback ) {
        __callback( _CARD.heights );
    }

    function _fadeOutCard(__cardNumber, __timeout) {
        setTimeout( function(){
            var cardId = _CARD.prefix+__cardNumber;

            _fadeOut( document.getElementById(cardId), 200, (__targetNode) => {
                if(_debug) console.log("["+_moduleSName+"] _fadeOutCard() THE ELEMENT IS DELETED :" + __cardNumber);
                _deleteCardHeight( __cardNumber );
                __targetNode.remove();

                var sumOfHeights = _CARD.topMargin;
                
                _getCardHeights( function( heights ) {
                    for(var key in heights ) {
                        _animateMoveToTop(document.getElementById(_CARD.prefix+key), sumOfHeights, 250);
                        sumOfHeights += _CARD.offset + heights[ key ];
                    }
                });
            });

        }, __timeout);
    }
    function _showPopupMessage( __message, __styles, __timeout ) {
        var timeout = (__timeout === undefined)? _CARD.timeout: __timeout;

        var cardWidth = _CARD.width;
        var cardHeight = _CARD.height;
        var cardNumber = _getAndIncCardNumber();
        if(_debug) console.log("["+_moduleSName+"] _showPopupMessage() cardNumber = "+ cardNumber);

        if( __styles != undefined && __styles.height != undefined ) { 
            if(_verbose) console.log("["+_moduleSName+"] _showPopupMessage()  _styles.height = "+  __styles.height);
            cardHeight = parseInt( __styles.height );
        } else {
            if(_verbose) console.log("["+_moduleSName+"] _showPopupMessage() height is not set in the argument.");
        }

        var topPosi = _CARD.topMargin;
        topPosi = _getTopPosition(topPosi);
        if(_verbose) console.log("["+_moduleSName+"] _showPopupMessage() topPosi = "+ topPosi);

        _saveCardHeight( cardNumber, cardHeight); 

        var cardId = _CARD.prefix + cardNumber;
        let cardMsgId = _CARD.msgPrefix + cardNumber;
        let cardP = document.createElement("p");
        cardP.setAttribute("id", cardId);
        cardP.innerHTML = "<span><a><span id='"+cardMsgId+"'>"+__message+"</span></a></span>";

        if( document.getElementsByTagName("body").length > 0) {
            document.getElementsByTagName("body")[0].appendChild(cardP);
        } else {
            document.getElementsByTagName("head")[0].nextElementSibling.appendChild(cardP);
        }

        document.getElementById(cardId).style.cssText = "position: fixed; top: "+topPosi+"px; margin-left: "+ (window.innerWidth/2 - cardWidth/2) + "px; z-index: "+_CARD.z_index +";";
        // $("#"+cardId).css({
        //     "position":"fixed", 
        //     "top":topPosi+"px", 
        //     "margin-left": ($(window).width()/2 - cardWidth/2) + "px",
        //     "z-index": _CARD.z_index});
        document.querySelector("#"+cardId+" a").style.cssText = "display: block; font: 14px/100% Meiryo, Verdana, Arial, Helvetica, sans-serif; text-decoration: none; color: white; ";
        // $("#"+cardId+" a").css({
        //     "display":"block",
        //     "font":"12px/100% Verdana, Arial, Helvetica, sans-serif",
        //     "text-decoration":"none",
        //     "color":"white"});
        document.querySelector("span#"+cardMsgId).style.cssText = "width: "+cardWidth+ "px; height: "+cardHeight+"px; display: block; padding-top: 10px; padding-left: 15px; border-radius: 5px; background-color: darkgreen;";
        // $("span#"+cardMsgId).css({
        //     "width": cardWidth+"px",
        //     "height": cardHeight+"px",
        //     "display": "block",
        //     "padding-top": "10px",
        //     "padding-left": "15px",
        //     "border-radius": "5px",
        //     "background-color": "darkgreen"});
        if( __styles ) {
            let card = document.querySelector("span#"+cardMsgId);
            for(style in __styles) {
                card.style[style] = __styles[style];
            }
        }

        _fadeOutCard( cardNumber, timeout );
    }

    // End of Private things.


    // Public things
    return {
        getName: function() {
            return _getModuleName();
        },
        showPopupMessage: function( __message, __styles, __timeout ) {
            if(_debug) console.log("["+_moduleSName+"] showPopupMessage() called "+ __message);
            _showPopupMessage( __message, __styles, __timeout);
        }
    };
    // End of Public things.


    } // End of _constructor();

    // To use this, call getInstance to get singleton
    return { 
        getInstance: function(__debug) {
            if( !_instance ) {
                _instance = _constructor();
            }
            if( !__debug ) {
                _instance._debug = __debug;
            }
            return _instance;
        }
    };

})();
