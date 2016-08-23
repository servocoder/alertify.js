(function() {

    "use strict";

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

        el.classList.remove("show");
        el.classList.add("hide");
        el.addEventListener("transitionend", removeThis);

        // Fallback for no transitions.
        setTimeout(removeThis, TRANSITION_FALLBACK_DURATION);
    };

    function centerDialog(el) {
        var elRect = el.getBoundingClientRect();
        var bodyRect = document.body.getBoundingClientRect();
        el.style.top = (bodyRect.height / 2 - elRect.height / 2) + 'px';
    }

    function createElementFromHtml(html) {
        var dummy = document.createElement('div');
        dummy.innerHTML = html;
        return dummy.firstChild;
    }

    function findElementByPlaceholder(node, text) {
        var nodes = node.length ? node : [node];
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].innerHTML == text) {
                return nodes[i];
            }
            if (nodes[i].childNodes.length) {
                return findElementByPlaceholder(nodes[i].childNodes, text);
            }
        }
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
                    holder: "<nav>{{buttons}}</nav>",
                    ok: {
                        label: "Ok",
                        template: "<button class='ok' tabindex='1'>{{label}}</button>"
                    },
                    cancel: {
                        label: "Cancel",
                        template: "<button class='cancel' tabindex='2'>{{label}}</button>"
                    },
                    default: {
                        label: "Default",
                        template: "<button class='default' tabindex='3'>{{label}}</button>"
                    }
                },
                input: "<input type='text'>",
                message: "<div class='msg'>{{message}}</div>",
                log: "<div class='{{class}}'>{{message}}</div>"
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
                dom.dialog = document.createElement("div");
                dom.dialog.className = "dialog";

                dom.wrapper = document.createElement("div");
                dom.wrapper.style.width = this.dialogWidth;

                dom.messageWrapper = createElementFromHtml(this.dialogs.message);
                dom.message = findElementByPlaceholder(dom.messageWrapper, '{{message}}');
                dom.message.innerHTML = item.message;

                dom.buttonsWrapper = createElementFromHtml(this.dialogs.buttons.holder);
                dom.buttonsHolder = findElementByPlaceholder(dom.buttonsWrapper, '{{buttons}}');

                dom.wrapper.appendChild(dom.messageWrapper);
                if (item.type === "prompt") {
                    dom.input = createElementFromHtml(this.dialogs.input);
                    dom.label = dom.input.querySelector("label");
                    dom.wrapper.appendChild(dom.input);
                }
                dom.dialog.appendChild(dom.wrapper);
                dom.wrapper.appendChild(dom.buttonsWrapper);
                dom.buttonsHolder.innerHTML = "";

                for (var i = 0; i < buttons.length; i++) {
                    var btnLabelEl = findElementByPlaceholder(buttons[i].element, '{{label}}');
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
                        var btn = this.dialogButtonsDefinition[i];

                        switch(btn.type) {
                            case "ok":
                                if (!btn.label) btn.label = dButtons.ok.label;
                                if (!btn.template) btn.template = dButtons.ok.template;
                                if (!btn.click) btn.click = item.onOkay;
                                break;
                            case "cancel":
                                if (!btn.label) btn.label = dButtons.cancel.label;
                                if (!btn.template) btn.template = dButtons.cancel.template;
                                if (!btn.click) btn.click = item.onCancel;
                                break;
                            default:
                                if (!btn.label) btn.label = dButtons.default.label;
                                if (!btn.template) btn.template = dButtons.default.template;
                                if (!btn.type) btn.type = "custom";
                        }
                        definitions.push(btn);
                    }
                } else {
                    var definitionOk = {
                        type: "ok",
                        label: dButtons.ok.label,
                        template: dButtons.ok.template,
                        click: item.onOkay
                    };
                    var definitionCancel = {
                        type: "cancel",
                        label: dButtons.cancel.label,
                        template: dButtons.cancel.template,
                        click: item.onCancel
                    };

                    if(item.type === "alert") {
                        definitions.push(definitionOk);
                    }
                    if(item.type === "confirm" || item.type === "prompt") {
                        definitions.push(definitionCancel, definitionOk);
                    }
                }

                for (var k = 0; k < definitions.length; k++) {
                    var definition = definitions[k];
                    definition.element = createElementFromHtml(definition.template);
                    if(typeof definition.closeOnClick === "undefined") {
                        definition.closeOnClick = true;
                    }
                }

                return definitions;
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
             * @param  {Function} onOkay       [Optional] Callback function when clicked okay.
             * @param  {Function} onCancel     [Optional] Callback function when cancelled.
             *
             * @return {Object}
             */
            dialog: function(message, type, onOkay, onCancel) {
                return this.setup({
                    type: type,
                    message: message,
                    onOkay: onOkay,
                    onCancel: onCancel
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

                var existing = document.querySelectorAll(".alertify-logs > div");
                if (existing) {
                    var diff = existing.length - this.logMaxItems;
                    if (diff >= 0) {
                        for (var i = 0, _i = diff + 1; i < _i; i++) {
                            this.close(existing[i], -1);
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
                if( ['top', 'bottom'].indexOf(position[0]) !== -1 &&
                    ['left', 'right'].indexOf(position[1]) !== -1) {
                    this.logPosition = string;
                }
            },

            setupLogContainer: function() {

                var elLog = document.querySelector(".alertify-logs");
                var className = this.logContainerClass + " " + this.logPosition;
                var recreateContainer = (elLog && elLog.parentNode !== this.parent);

                if (! elLog || recreateContainer) {
                    if(recreateContainer) {
                        hideElement(elLog);
                    }
                    elLog = document.createElement("div");
                    elLog.className = className;
                    this.parent.appendChild(elLog);
                }

                // Make sure it's positioned properly.
                if (elLog.className !== className) {
                    elLog.className = className;
                }

                return elLog;

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

                var elLog = this.setupLogContainer();
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

                elLog.appendChild(log);
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
                var dialogElements = this.build(item, buttons);

                dialogElements.popup = document.createElement("div");
                dialogElements.popup.className = this.dialogContainerClass + " hide";
                dialogElements.popup.appendChild(dialogElements.dialog);

                var btnOK;
                var input = dialogElements.input;
                var label = dialogElements.label;

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
                                listener = (function (button) {return function(ev) {
                                    if (button.click && "function" === typeof button.click) {
                                        if (input) {
                                            button.click(input.value, ev);
                                        } else {
                                            button.click(ev);
                                        }
                                    }

                                    if (input) {
                                        resolve({
                                            buttonClicked: "ok",
                                            inputValue: input.value,
                                            event: ev
                                        });
                                    } else {
                                        resolve({
                                            buttonClicked: "ok",
                                            event: ev
                                        });
                                    }

                                    if (button.closeOnClick === true) {
                                        hideElement(dialogElements.popup);
                                    }
                                }}(btn));
                                break;

                            case "cancel":
                                listener = (function (button) {return function(ev) {
                                    if (button.click && "function" === typeof button.click) {
                                        button.click(ev);
                                    }

                                    resolve({
                                        buttonClicked: "cancel",
                                        event: ev
                                    });

                                    if (button.closeOnClick === true) {
                                        hideElement(dialogElements.popup);
                                    }
                                }}(btn));
                                break;

                            default:
                                listener = (function (button) {return function(ev) {
                                    if (button.click && "function" === typeof button.click) {
                                        button.click(ev);
                                    }

                                    resolve({
                                        buttonClicked: button.type,
                                        event: ev
                                    });

                                    if (button.closeOnClick === true) {
                                        hideElement(dialogElements.popup);
                                    }
                                }}(btn));
                        }

                        btn.element.addEventListener("click", listener);
                    }

                    if (input) {
                        input.addEventListener("keyup", function(ev) {
                            if (ev.which === 13) {
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
                    dialogElements.popup.addEventListener("click", function(e) {
                        if(e.target === this || e.target === dialogElements.dialog) {
                            hideElement(dialogElements.popup);
                        }
                    });
                }

                window.onresize = function(){
                    centerDialog(dialogElements.dialog);
                };

                this.parent.appendChild(dialogElements.popup);
                setTimeout(function() {
                    dialogElements.popup.classList.remove("hide");
                    centerDialog(dialogElements.dialog);
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

            okBtn: function(label) {
                this.dialogs.buttons.ok.label = label;
                return this;
            },

            cancelBtn: function(str) {
                this.dialogs.buttons.cancel.label = str;
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
                if(typeof width === 'number') {
                    width += 'px';
                }
                this.dialogWidth = (typeof width === 'string') ? width : _defaults.dialogWidth;
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
                        this.dialogs.buttons.ok.template = "<button class='ok btn btn-primary' tabindex='1'>{{ok}}</button>";
                        this.dialogs.buttons.cancel.template = "<button class='cancel btn btn-default' tabindex='2'>{{cancel}}</button>";
                        this.dialogs.input = "<input type='text' class='form-control'>";
                        break;
                    case "purecss":
                        this.dialogs.buttons.ok.template = "<button class='ok pure-button' tabindex='1'>{{ok}}</button>";
                        this.dialogs.buttons.cancel.template = "<button class='cancel pure-button' tabindex='2'>{{cancel}}</button>";
                        break;
                    case "mdl":
                    case "material-design-light":
                        this.dialogs.buttons.ok.template = "<button class='ok mdl-button mdl-js-button mdl-js-ripple-effect'  tabindex='1'>{{ok}}</button>";
                        this.dialogs.buttons.cancel.template = "<button class='cancel mdl-button mdl-js-button mdl-js-ripple-effect' tabindex='2'>{{cancel}}</button>";
                        this.dialogs.input = "<div class='mdl-textfield mdl-js-textfield'><input class='mdl-textfield__input'><label class='md-textfield__label'></label></div>";
                        break;
                    case "angular-material":
                        this.dialogs.buttons.ok.template = "<button class='ok md-primary md-button' tabindex='1'>{{ok}}</button>";
                        this.dialogs.buttons.cancel.template = "<button class='cancel md-button' tabindex='2'>{{cancel}}</button>";
                        this.dialogs.input = "<div layout='column'><md-input-container md-no-float><input type='text'></md-input-container></div>";
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
                this.okBtn(_defaults.dialogs.buttons.ok.label);
                this.cancelBtn(_defaults.dialogs.buttons.cancel.label);
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
            alert: function(message, onOkay, onCancel) {
                return _alertify.dialog(message, "alert", onOkay, onCancel) || this;
            },
            confirm: function(message, onOkay, onCancel) {
                return _alertify.dialog(message, "confirm", onOkay, onCancel) || this;
            },
            prompt: function(message, onOkay, onCancel) {
                return _alertify.dialog(message, "prompt", onOkay, onCancel) || this;
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
            cancelBtn: function(label) {
                _alertify.cancelBtn(label);
                return this;
            },
            okBtn: function(label) {
                _alertify.okBtn(label);
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
                _alertify.setupLogContainer().innerHTML = "";
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
