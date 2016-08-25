(function() {

    "use strict";

    var logsUI;
    var dialogUI;
    var TRANSITION_FALLBACK_DURATION = 500;
    var hideElement = function(el) {
        if (! el) {
            return;
        }

        var removeThis = function() {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        };

        removeClass(el, "show");
        addClass(el, "hide");
        //el.classList.remove("show");
        //el.classList.add("hide");
        el.addEventListener("transitionend", removeThis);

        // Fallback for no transitions.
        setTimeout(removeThis, TRANSITION_FALLBACK_DURATION);
    };

    function centerDialog(node) {
        var nodeRect = node.getBoundingClientRect();
        var bodyRect = document.body.getBoundingClientRect();
        node.style.top = (bodyRect.height / 2 - nodeRect.height / 2) + "px";
    }

    function createElementFromHtml(html) {
        var dummy = document.createElement("div");
        dummy.innerHTML = html;
        return dummy.firstChild;
    }

    function findElementByData(node, name) {
        var nodes = node.length ? node : [node];
        for(var i =0; i < nodes.length; i++){
            if (nodes[i].getAttribute("data-" + name) !== null) {
                return nodes[i];
            }
            if (nodes[i].childNodes.length) {
                return findElementByData(nodes[i].childNodes, name);
            }
        }
    }

    function removeClass(node, className) {
        var classList = node.getAttribute("class").split(' ');
        var classIndex = classList.indexOf(className);
        if(classIndex !== -1) {
            classList.splice(classIndex, 1);
        }
        node.className = classList.join(' ');
    }

    function addClass(node, className) {
        var classList = node.getAttribute("class").split(' ');
        classList.push(className);
        node.className = classList.join(' ');
    }


    function Alertify() {

        var _defaults = {
            parent: document.body,
            // dialog options
            dialogWidth: '400px',
            dialogPersistent: true,
            dialogContainerClass: "alertify",
            dialogButtonsDefinition: [],
            // log options
            logDelay: 5000,
            logMaxItems: 2,
            logPosition: "bottom left",
            logCloseOnClick: false,
            logContainerClass: "alertify-logs",
            logTemplateMethod: null,

            dialogs: {
                buttons: {
                    holder: '<nav data-alertify-btn-holder></nav>',
                    ok: {
                        label: "Ok",
                        autoClose: true,
                        template: '<button data-alertify-btn="ok" tabindex="1"></button>'
                    },
                    cancel: {
                        label: "Cancel",
                        autoClose: true,
                        template: '<button data-alertify-btn="cancel" tabindex="2"></button>'
                    },
                    default: {
                        label: "Default",
                        autoClose: false,
                        template: '<button data-alertify-btn tabindex="3"></button>'
                    }
                },
                message: '<div data-alertify-msg></div>',
                input: '<input data-alertify-input type="text">'
            }
        };

        /**
         * Alertify private object
         * @type {Object}
         */
        var _alertify = {

            version: "1.0.11",
            parent: _defaults.parent,
            dialogWidth: _defaults.dialogWidth,
            dialogPersistent: _defaults.dialogPersistent,
            dialogContainerClass: _defaults.dialogContainerClass,
            dialogButtonsDefinition: _defaults.dialogButtonsDefinition,
            promptValue: "",
            promptPlaceholder: "",
            logDelay: _defaults.logDelay,
            logMaxItems: _defaults.logMaxItems,
            logPosition: _defaults.logPosition,
            logCloseOnClick: _defaults.logCloseOnClick,
            logContainerClass: _defaults.logContainerClass,
            logTemplateMethod: _defaults.logTemplateMethod,
            dialogs: _defaults.dialogs,

            /**
             * Build the proper message box
             *
             * @param  {Object} item    Current object in the queue
             * @param  {Array} buttons  Buttons definition array
             *
             * @return {String}         An HTML string of the message box
             */
            build: function(item, buttons) {
                var dom = {};
                dom.wrapper = document.createElement("div");
                dom.wrapper.className = "dialog";

                dom.dialog = document.createElement("div");
                dom.dialog.style.width = this.dialogWidth;

                if(item.type === "dialog") {
                    dom.dialog.innerHTML = item.message;
                } else {
                    dom.messageWrapper = createElementFromHtml(this.dialogs.message);
                    dom.message = findElementByData(dom.messageWrapper, "alertify-msg");
                    dom.message.innerHTML = item.message;
                    dom.dialog.appendChild(dom.messageWrapper);
                }

                dom.buttonsWrapper = createElementFromHtml(this.dialogs.buttons.holder);
                dom.buttonsHolder = findElementByData(dom.buttonsWrapper, 'alertify-btn-holder');

                if (item.type === "prompt") {
                    var inputEl = createElementFromHtml(this.dialogs.input);
                    dom.input = findElementByData(inputEl, "alertify-input");
                    dom.label = findElementByData(inputEl, "alertify-input-label");
                    dom.dialog.appendChild(inputEl);
                }
                dom.wrapper.appendChild(dom.dialog);
                dom.dialog.appendChild(dom.buttonsWrapper);
                dom.buttonsHolder.innerHTML = "";

                dom.buttons = [];
                for (var i = 0; i < buttons.length; i++) {
                    var btnLabelEl = findElementByData(buttons[i].element, "alertify-btn");
                    btnLabelEl.innerHTML = buttons[i].label;
                    dom.buttonsHolder.appendChild(buttons[i].element);
                }

                return dom;
            },

            createButtonsDefinition: function(item) {
                var definitions = [],
                    dButtons = this.dialogs.buttons;

                if(item.type === "dialog" && this.dialogButtonsDefinition.length > 0) {
                    for (var i = 0; i < this.dialogButtonsDefinition.length; i++) {
                        var btn = this.buildButtonObject(this.dialogButtonsDefinition[i]);
                        definitions.push(btn);
                    }
                } else {
                    item.okButton.type = "ok";
                    item.cancelButton.type = "cancel";
                    var btnOk = this.buildButtonObject(item.okButton);
                    var btnCancel = this.buildButtonObject(item.cancelButton);

                    if(item.type === "alert") {
                        definitions.push(btnOk);
                    }
                    if(item.type === "confirm" || item.type === "prompt") {
                        definitions.push(btnCancel, btnOk);
                    }
                }

                for (var k = 0; k < definitions.length; k++) {
                    var definition = definitions[k];
                    definition.element = createElementFromHtml(definition.template);
                }

                return definitions;
            },

            buildButtonObject: function(obj) {
                var btn = {};
                var type = obj.type || "default";
                var db = this.dialogs.buttons;

                btn.type = type;
                btn.label = (typeof obj.label !== "undefined") ? obj.label : db[type].label;
                btn.autoClose = (typeof obj.autoClose !== "undefined") ? obj.autoClose : db[type].autoClose;
                btn.template = (typeof obj.template !== "undefined") ? obj.template : db[type].template;
                btn.click = (typeof obj.click !== "undefined") ? obj.click : db[type].click;

                return btn;
            },

            setCloseLogOnClick: function(bool) {
                this.logCloseOnClick = bool;
            },

            /**
             * Close the log messages
             *
             * @param  {Object} elem    HTML Element of log message to close
             * @param  {Number} wait    [optional] Time (in ms) to wait before automatically hiding the message, if 0 never hide
             *
             * @return {undefined}
             */
            close: function(elem, wait) {

                if (this.logCloseOnClick) {
                    elem.addEventListener("click", function() {
                        hideElement(elem);
                    });
                }

                wait = wait && !isNaN(+wait) ? +wait : this.logDelay;

                if (wait < 0) {
                    hideElement(elem);
                } else if(wait > 0) {
                    setTimeout(function() {
                        hideElement(elem);
                    }, wait);
                }

            },

            /**
             * Create a dialog box
             *
             * @param  {String}   message      The message passed from the callee
             * @param  {String}   type         Type of dialog to create
             * @param  {Object}   okButton     [Optional] Callback function when clicked okay.
             * @param  {Object}   cancelButton [Optional] Callback function when cancelled.
             *
             * @return {Object}
             */
            dialog: function(message, type, okButton, cancelButton) {
                return this.setup({
                    type: type,
                    message: message,
                    okButton: okButton || {},
                    cancelButton: cancelButton || {}
                });
            },

            /**
             * Show a new log message box
             *
             * @param  {String} message    The message passed from the callee
             * @param  {String} type       [Optional] Optional type of log message
             * @param  {Function} click    [Optional] Callback function when clicked the log
             *
             * @return {Object}
             */
            log: function(message, type, click) {

                if (logsUI && logsUI.elements.length) {
                    var diff = logsUI.elements.length - this.logMaxItems;
                    if (diff >= 0) {
                        for (var i = 0, _i = diff + 1; i < _i; i++) {
                            this.close(logsUI.elements[i], -1);
                        }
                    }
                }

                this.notify(message, type, click);
            },

            setLogContainerClass: function(string) {
                this.logContainerClass = _defaults.logContainerClass + " " + string;
            },

            setLogPosition: function(string) {
                var position = string.split(' ');
                if( ["top", "bottom"].indexOf(position[0]) !== -1 &&
                    ["left", "right"].indexOf(position[1]) !== -1) {
                    this.logPosition = string;
                }
            },

            setupLogContainer: function() {

                var className = this.logContainerClass + " " + this.logPosition;
                var recreateContainer = (logsUI && logsUI.container.parentNode !== this.parent);

                if (! logsUI || recreateContainer) {
                    if(recreateContainer) {
                        hideElement(logsUI.container);
                    }
                    logsUI = {};
                    logsUI.container = document.createElement("div");
                    logsUI.container.className = className;
                    this.parent.appendChild(logsUI.container);
                }

                // Make sure it's positioned properly.
                if (logsUI.container.className !== className) {
                    logsUI.container.className = className;
                }
            },

            /**
             * Add new log message
             * If a type is passed, a class name "{type}" will get added.
             * This allows for custom look and feel for various types of notifications.
             *
             * @param  {String} message    The message passed from the callee
             * @param  {String} type       [Optional] Type of log message
             * @param  {Function} click    [Optional] Callback function when clicked the log
             *
             * @return {undefined}
             */
            notify: function(message, type, click) {

                this.setupLogContainer();
                var log = document.createElement("div");

                log.className = (type || "default");
                if (_alertify.logTemplateMethod) {
                    log.innerHTML = _alertify.logTemplateMethod(message);
                } else {
                    log.innerHTML = message;
                }

                // Add the click handler, if specified.
                if ("function" === typeof click) {
                    log.addEventListener("click", click);
                }

                if(!logsUI.elements) {
                    logsUI.elements = [];
                }
                logsUI.elements.push(log);
                logsUI.container.appendChild(log);
                setTimeout(function() {
                    log.className += " show";
                }, 10);

                this.close(log, this.logDelay);

            },

            /**
             * Initiate all the required pieces for the dialog box
             *
             * @return {undefined}
             */
            setup: function(item) {

                var buttons = this.createButtonsDefinition(item);
                dialogUI = this.build(item, buttons);

                dialogUI.container = document.createElement("div");
                dialogUI.container.className = this.dialogContainerClass + " hide";
                dialogUI.container.appendChild(dialogUI.wrapper);

                var btnOK;
                var input = dialogUI.input;
                var label = dialogUI.label;

                for (var i = 0; i < buttons.length; i++) {
                    if(buttons[i].type === "ok") {
                        btnOK = buttons[i].element;
                    }
                }

                // Set default value/placeholder of input
                if (input) {
                    if (typeof this.promptPlaceholder === "string") {
                        // Set the label, if available, for MDL, etc.
                        if (label) {
                            label.textContent = this.promptPlaceholder;
                        } else {
                            input.placeholder = this.promptPlaceholder;
                        }
                    }
                    if (typeof this.promptValue === "string") {
                        input.value = this.promptValue;
                    }
                }

                function setupHandlers(resolve) {
                    if ("function" !== typeof resolve) {
                        // promises are not available so resolve is a no-op
                        resolve = function () {};
                    }

                    for (var i = 0; i < buttons.length; i++) {
                        var btn = buttons[i];
                        var listener;

                        switch(btn.type) {
                            case "ok":
                                listener = (function (button) {return function(event) {
                                    if (button.click && "function" === typeof button.click) {
                                        if (input) {
                                            button.click(event, dialogUI, input.value);
                                        } else {
                                            button.click(event, dialogUI);
                                        }
                                    }

                                    if (input) {
                                        resolve({
                                            buttonClicked: "ok",
                                            inputValue: input.value,
                                            event: event
                                        });
                                    } else {
                                        resolve({
                                            buttonClicked: "ok",
                                            event: event
                                        });
                                    }

                                    if (button.autoClose === true) {
                                        hideElement(dialogUI.container);
                                    }
                                }}(btn));
                                break;

                            case "cancel":
                                listener = (function (button) {return function(event) {
                                    if (button.click && "function" === typeof button.click) {
                                        button.click(event, dialogUI);
                                    }

                                    resolve({
                                        buttonClicked: "cancel",
                                        event: event
                                    });

                                    if (button.autoClose === true) {
                                        hideElement(dialogUI.container);
                                    }
                                }}(btn));
                                break;

                            default:
                                listener = (function (button) {return function(event) {
                                    if (button.click && "function" === typeof button.click) {
                                        button.click(event, dialogUI);
                                    }

                                    resolve({
                                        buttonClicked: button.type,
                                        event: event
                                    });

                                    if (button.autoClose === true) {
                                        hideElement(dialogUI.container);
                                    }
                                }}(btn));
                        }

                        btn.element.addEventListener("click", listener);
                    }

                    if (input) {
                        input.addEventListener("keyup", function(event) {
                            if (event.which === 13) {
                                btnOK.click();
                            }
                        });
                    }
                }

                var promise;

                if (typeof Promise === "function") {
                    promise = new Promise(setupHandlers);
                } else {
                    setupHandlers();
                }

                if(this.dialogPersistent === false) {
                    dialogUI.container.addEventListener("click", function(e) {
                        if(e.target === this || e.target === dialogUI.wrapper) {
                            hideElement(dialogUI.container);
                        }
                    });
                }

                window.onresize = function(){
                    centerDialog(dialogUI.wrapper);
                };

                this.parent.appendChild(dialogUI.container);
                setTimeout(function() {
                    removeClass(dialogUI.container, "hide");
                    //dialogUI.container.classList.remove("hide");
                    centerDialog(dialogUI.wrapper);
                    if(input && item.type && item.type === "prompt") {
                        input.select();
                        input.focus();
                    } else {
                        if (btnOK) {
                            btnOK.focus();
                        }
                    }
                }, 100);

                return promise;
            },

            setDialogButtons: function(buttons) {
                this.dialogButtonsDefinition = (buttons instanceof Array) ? buttons : _defaults.dialogButtonsDefinition;
                return this;
            },

            setDelay: function(time) {
                time = time || 0;
                this.logDelay = isNaN(time) ? _defaults.logDelay : parseInt(time, 10);
                return this;
            },

            setLogMaxItems: function(num) {
                this.logMaxItems = parseInt(num || _defaults.logMaxItems);
            },

            setDialogWidth: function(width) {
                if(typeof width === "number") {
                    width += 'px';
                }
                this.dialogWidth = (typeof width === "string") ? width : _defaults.dialogWidth;
            },

            setDialogPersistent: function(bool) {
                this.dialogPersistent = bool;
            },

            setDialogContainerClass: function(string) {
                this.dialogContainerClass = _defaults.dialogContainerClass + " " + string;
            },

            theme: function(themeStr) {
                switch(themeStr.toLowerCase()) {
                    case "bootstrap":
                        this.dialogs.buttons.ok.template = '<button data-alertify-btn="ok" class="ok btn btn-primary" tabindex="1"></button>';
                        this.dialogs.buttons.cancel.template = '<button data-alertify-btn="cancel" class="cancel btn btn-default" tabindex="2"></button>';
                        this.dialogs.input = "<input data-alertify-input class='form-control' type='text'>";
                        break;
                    case "purecss":
                        this.dialogs.buttons.ok.template = '<button data-alertify-btn="ok" class="ok pure-button" tabindex="1"></button>';
                        this.dialogs.buttons.cancel.template = '<button data-alertify-btn="cancel" class="cancel pure-button" tabindex="2"></button>';
                        break;
                    case "mdl":
                    case "material-design-light":
                        this.dialogs.buttons.ok.template = '<button data-alertify-btn="ok" class="ok mdl-button mdl-js-button mdl-js-ripple-effect"  tabindex="1"></button>';
                        this.dialogs.buttons.cancel.template = '<button data-alertify-btn="cancel" class="cancel mdl-button mdl-js-button mdl-js-ripple-effect" tabindex="2"></button>';
                        this.dialogs.input = '<div class="mdl-textfield mdl-js-textfield"><input data-alertify-input class="mdl-textfield__input"><label data-alertify-input-label class="md-textfield__label"></label></div>';
                        break;
                    case "angular-material":
                        this.dialogs.buttons.ok.template = '"<button data-alertify-btn="ok" class="ok md-primary md-button" tabindex="1"></button>"';
                        this.dialogs.buttons.cancel.template = '<button data-alertify-btn="cancel" class="cancel md-button" tabindex="2"></button>';
                        this.dialogs.input = '<div layout="column"><md-input-container md-no-float><input data-alertify-input type="text"></md-input-container></div>';
                        break;
                    case "default":
                    default:
                        this.dialogs.buttons.ok.template = _defaults.dialogs.buttons.ok.template;
                        this.dialogs.buttons.cancel.template = _defaults.dialogs.buttons.cancel.template;
                        this.dialogs.input = _defaults.dialogs.input;
                        break;
                }
            },

            reset: function() {
                this.theme("default");
                this.parent = _defaults.parent;
                this.dialogWidth = _defaults.dialogWidth;
                this.dialogPersistent = _defaults.dialogPersistent;
                this.dialogContainerClass = _defaults.dialogContainerClass;
                this.dialogButtonsDefinition = _defaults.dialogButtonsDefinition;
                this.promptValue = "";
                this.promptPlaceholder = "";
                this.logDelay = _defaults.logDelay;
                this.logMaxItems = _defaults.logMaxItems;
                this.logPosition = _defaults.logPosition;
                this.logCloseOnClick = _defaults.logCloseOnClick;
                this.logContainerClass = _defaults.logContainerClass;
                this.logTemplateMethod = null;
            },

            injectCSS: function() {
                if (!document.querySelector("#alertifyCSS")) {
                    var head = document.getElementsByTagName("head")[0];
                    var css = document.createElement("style");
                    css.type = "text/css";
                    css.id = "alertifyCSS";
                    css.innerHTML = "/* style.css */";
                    head.insertBefore(css, head.firstChild);
                }
            },

            removeCSS: function() {
                var css = document.querySelector("#alertifyCSS");
                if (css && css.parentNode) {
                    css.parentNode.removeChild(css);
                }
            }

        };

        _alertify.injectCSS();

        return {
            _$$alertify: _alertify,
            parent: function(elem) {
                _alertify.parent = elem;
            },
            reset: function() {
                _alertify.reset();
                return this;
            },
            dialog: function(message) {
                return _alertify.dialog(message, "dialog", null, null) || this;
            },
            alert: function(message, okButton, cancelButton) {
                return _alertify.dialog(message, "alert", okButton , cancelButton) || this;
            },
            confirm: function(message, okButton, cancelButton) {
                return _alertify.dialog(message, "confirm", okButton, cancelButton) || this;
            },
            prompt: function(message, okButton, cancelButton) {
                return _alertify.dialog(message, "prompt", okButton, cancelButton) || this;
            },
            log: function(message, click, type) {
                _alertify.log(message, type, click);
                return this;
            },
            success: function(message, click) {
                _alertify.log(message, "success", click);
                return this;
            },
            error: function(message, click) {
                _alertify.log(message, "error", click);
                return this;
            },
            theme: function(themeStr) {
                _alertify.theme(themeStr);
                return this;
            },
            dialogWidth: function(width) {
                _alertify.setDialogWidth(width);
                return this;
            },
            dialogPersistent: function(bool) {
                _alertify.setDialogPersistent(bool);
                return this;
            },
            dialogContainerClass: function(str) {
                _alertify.setDialogContainerClass(str || "");
                return this;
            },
            dialogButtons: function(buttons) {
                _alertify.setDialogButtons(buttons);
                return this;
            },
            delay: function(time) {
                _alertify.setDelay(time);
                return this;
            },
            placeholder: function(str) {
                _alertify.promptPlaceholder = str;
                return this;
            },
            defaultValue: function(str) {
                _alertify.promptValue = str;
                return this;
            },
            maxLogItems: function(num) {
                _alertify.setLogMaxItems(num);
                return this;
            },
            closeLogOnClick: function(bool) {
                _alertify.setCloseLogOnClick(bool);
                return this;
            },
            logPosition: function(str) {
                _alertify.setLogPosition(str || "");
                return this;
            },
            logContainerClass: function(str) {
                _alertify.setLogContainerClass(str || "");
                return this;
            },
            setLogTemplate: function(templateMethod) {
                _alertify.logTemplateMethod = templateMethod;
                return this;
            },
            clearLogs: function() {
                if(logsUI) {
                    logsUI.container.innerHTML = "";
                }
                return this;
            },
            closeDialog: function() {
                if(dialogUI) {
                    hideElement(dialogUI.container);
                }
                return this;
            },
            version: _alertify.version
        };
    }

    // AMD, window, and NPM support
    if ("undefined" !== typeof module && !! module && !! module.exports) {
        // Preserve backwards compatibility
        module.exports = function() {
            return new Alertify();
        };
        var obj = new Alertify();
        for (var key in obj) {
            module.exports[key] = obj[key];
        }
    } else if (typeof define === "function" && define.amd) {
        define(function() {
            return new Alertify();
        });
    } else {
        window.alertify = new Alertify();
    }

}());
