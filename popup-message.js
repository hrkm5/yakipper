var PopupMsg = (function() {
    // Singleton - so please call getInstance() to get an instance of this class.
    let _instance;

    function _constructor() {
        //
        // Check the browser
        //
        const _isFirefox = (navigator.userAgent.indexOf("Firefox") != -1);
        let _BROWSER = chrome;
        if(_isFirefox) {
            _BROWSER = browser;
        } else {
            _BROWSER = chrome;
        }

        const _MODNAME = "PMSG";

        let _deck = {
            number: 0,
            heights: {},
        }
        const _CARD = {
                topMargin: 5,
                offset: 15,
                prefix: "popupCard",
                msgPrefix: "popupCardMsg",
                width: 600,
                height: 47,
                timeout: 1000,
                z_index: 999999
            };

        function _fadeOut(__targetNode, __durationInMilliSecond, __callbackOnComplete) {
            if(!__targetNode) return;

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
            var position = __marginTop;
            for(var index in _deck.heights ) {
                position += _CARD.offset + _deck.heights[index];
            }
            return position;
        };

        function _saveCardHeight( __cardNumber, __cardHeight ) {
            console.log(`[${_MODNAME}] _saveCardHeight() _cardNumber:${__cardNumber} _cardHeight:${__cardHeight}`);
            _deck.heights[ __cardNumber ] = __cardHeight;
        }

        function _getUniqueCardNumber() {
            return _deck.number++;
        }
        function _deleteCardHeight( __cardNumber ) {
            delete _deck.heights[ __cardNumber ];
        }
        function _getCardHeights( __callback ) {
            __callback( _deck.heights );
        }

        function _fadeOutCard(__cardNumber, __timeout) {
            setTimeout( function(){
                var cardId = _CARD.prefix+__cardNumber;

                _fadeOut(document.getElementById(cardId), 200, (__targetNode) => {
                    console.log(`[${_MODNAME}] _fadeOutCard() Popup message #${ __cardNumber} is deleted.`);
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

        const _createCard = (__cardNumber, __message, __closable = true, __styles = {}) => {
            const cardWidth = _CARD.width;
            let topPosition = _CARD.topMargin;
            topPosition = _getTopPosition(topPosition);
            console.log(`[${_MODNAME}] _createCard() cardNumber = ${__cardNumber}`);

            // Create a card to show popup message
            const cardP = document.createElement("p");
            const cardId = _CARD.prefix + __cardNumber;
            cardP.setAttribute("id", cardId);

            const cardMsg = document.createElement("span");
            cardMsg.classList.add("msg");

            const cardMsgContent = document.createElement("span");
            const cardMsgContentId = _CARD.msgPrefix + __cardNumber;
            cardMsgContent.setAttribute("id", cardMsgContentId);
            cardMsgContent.innerHTML = __message;

            cardP.append(cardMsg);
            cardMsg.append(cardMsgContent);

            // Styles for each element
            // cardP
            //    cardMsg
            //      cardMsgContent
            cardP.style.cssText = `
                position: fixed;
                top: ${topPosition}px;
                margin-left: ${(window.innerWidth/2 - cardWidth/2)}px;
                z-index: ${_CARD.z_index};`;

            cardMsg.style.cssText = `
                display: block; 
                font: 14px/100% Meiryo, Verdana, Arial, Helvetica, sans-serif;
                color: white; 
                width: ${cardWidth}px; 
                display: block; 
                padding-top: 16px; 
                padding-left: 35px;
                padding-bottom: 17px;
                border-radius: 5px; 
                background-color: darkgreen;`;

            cardMsgContent.style.cssText = `
                display: inline-block;
                width: ${cardWidth - 60}px;`;

            // Show link in the message in different sytle
            if(cardMsg.querySelector("a")) cardMsg.querySelector("a").style.cssText = `
                text-decoration: none;
                font-weight: bold;
                font-style: italic;
                color: yellow; `;

            if(__closable) {
                const closeBtn = document.createElement("button");
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 2px;
                    padding: 0;
                    border: none;
                    font-size: 1.5em;
                    font-weight: bold;
                    background-color: inherit;
                    color: white;`;
                closeBtn.textContent = "×";
                
                cardMsg.append(closeBtn);
                cardMsg.style.border = "solid 2px orange";

                closeBtn.addEventListener("click", (e) => {
                    _fadeOutCard(__cardNumber, 0);
                });
            }
            
            // Override styles with provided styles
            if( __styles ) {
                for(style in __styles) {
                    cardMsg.style[style] = __styles[style];
                }
            }

            return cardP;
        }

        function _showPopupMessage(__message, __styles, __timeout) {
            const timeout = (__timeout === undefined)? _CARD.timeout: __timeout;
            const cardNumber = _getUniqueCardNumber();
            const cardP = _createCard(cardNumber, __message, false, __styles);
            if( document.getElementsByTagName("body").length > 0) {
                document.getElementsByTagName("body")[0].appendChild(cardP);
            } else {
                document.getElementsByTagName("head")[0].nextElementSibling.appendChild(cardP);
            }
            const clientRect = cardP.getBoundingClientRect();
            _saveCardHeight( cardNumber, clientRect.height);

            _fadeOutCard( cardNumber, timeout );
        }

        function _showPinnedMessage(__message, __styles) {
            const cardNumber = _getUniqueCardNumber();
            const cardP = _createCard(cardNumber, __message, true, __styles);
            if( document.getElementsByTagName("body").length > 0) {
                document.getElementsByTagName("body")[0].appendChild(cardP);
            } else {
                document.getElementsByTagName("head")[0].nextElementSibling.appendChild(cardP);
            }
            const clientRect = cardP.getBoundingClientRect();
            _saveCardHeight( cardNumber, clientRect.height);
        }
        // End of Private things.


        // Public
        return {
                getName: function() {
                    return _getModuleName();
                },
                showPopupMessage: function(__message, __styles, __timeout ) {
                    console.log(`[${_MODNAME}] showPopupMessage() called ${__message}`);
                    _showPopupMessage( __message, __styles, __timeout);
                },
                showPinnedMessage: function(__message, __styles) {
                    console.log(`[${_MODNAME}] showPinnedMessage() called ${__message}`);
                    _showPinnedMessage(__message, __styles);
                }
            };
    } // End of _constructor();

    return { 
        getInstance: function() {
            return (!_instance)? _constructor(): _instance;
        }
    };
})();