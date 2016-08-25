!function(){"use strict";function t(t){var e=t.getBoundingClientRect(),n=document.body.getBoundingClientRect();t.style.top=n.height/2-e.height/2+"px"}function e(t){var e=document.createElement("div");return e.innerHTML=t,e.firstChild}function n(t,e){for(var i=t.length?t:[t],o=0;o<i.length;o++){if(null!==i[o].getAttribute("data-"+e))return i[o];if(i[o].childNodes.length)return n(i[o].childNodes,e)}}function i(t,e){var n=t.getAttribute("class").split(" "),i=n.indexOf(e);i!==-1&&n.splice(i,1),t.className=n.join(" ")}function o(t,e){var n=t.getAttribute("class").split(" ");n.push(e),t.className=n.join(" ")}function a(){var o={parent:document.body,dialogWidth:"400px",dialogPersistent:!0,dialogContainerClass:"alertify",dialogButtonsDefinition:[],logDelay:5e3,logMaxItems:2,logPosition:"bottom left",logCloseOnClick:!1,logContainerClass:"alertify-logs",logTemplateMethod:null,dialogs:{buttons:{holder:"<nav data-alertify-btn-holder></nav>",ok:{label:"Ok",autoClose:!0,template:'<button data-alertify-btn="ok" tabindex="1"></button>'},cancel:{label:"Cancel",autoClose:!0,template:'<button data-alertify-btn="cancel" tabindex="2"></button>'},"default":{label:"Default",autoClose:!1,template:'<button data-alertify-btn tabindex="3"></button>'}},message:"<div data-alertify-msg></div>",input:'<input data-alertify-input type="text">'}},a={version:"1.0.11",parent:o.parent,dialogWidth:o.dialogWidth,dialogPersistent:o.dialogPersistent,dialogContainerClass:o.dialogContainerClass,dialogButtonsDefinition:o.dialogButtonsDefinition,promptValue:"",promptPlaceholder:"",logDelay:o.logDelay,logMaxItems:o.logMaxItems,logPosition:o.logPosition,logCloseOnClick:o.logCloseOnClick,logContainerClass:o.logContainerClass,logTemplateMethod:o.logTemplateMethod,dialogs:o.dialogs,build:function(t,i){var o={};if(o.wrapper=document.createElement("div"),o.wrapper.className="dialog",o.dialog=document.createElement("div"),o.dialog.style.width=this.dialogWidth,"dialog"===t.type?o.dialog.innerHTML=t.message:(o.messageWrapper=e(this.dialogs.message),o.message=n(o.messageWrapper,"alertify-msg"),o.message.innerHTML=t.message,o.dialog.appendChild(o.messageWrapper)),o.buttonsWrapper=e(this.dialogs.buttons.holder),o.buttonsHolder=n(o.buttonsWrapper,"alertify-btn-holder"),"prompt"===t.type){var a=e(this.dialogs.input);o.input=n(a,"alertify-input"),o.label=n(a,"alertify-input-label"),o.dialog.appendChild(a)}o.wrapper.appendChild(o.dialog),o.dialog.appendChild(o.buttonsWrapper),o.buttonsHolder.innerHTML="",o.buttons=[];for(var l=0;l<i.length;l++){var r=n(i[l].element,"alertify-btn");r.innerHTML=i[l].label,o.buttonsHolder.appendChild(i[l].element)}return o},createButtonsDefinition:function(t){var n=[];this.dialogs.buttons;if("dialog"===t.type&&this.dialogButtonsDefinition.length>0)for(var i=0;i<this.dialogButtonsDefinition.length;i++){var o=this.buildButtonObject(this.dialogButtonsDefinition[i]);n.push(o)}else{t.okButton.type="ok",t.cancelButton.type="cancel";var a=this.buildButtonObject(t.okButton),l=this.buildButtonObject(t.cancelButton);"alert"===t.type&&n.push(a),"confirm"!==t.type&&"prompt"!==t.type||n.push(l,a)}for(var r=0;r<n.length;r++){var s=n[r];s.element=e(s.template)}return n},buildButtonObject:function(t){var e={},n=t.type||"default",i=this.dialogs.buttons;return e.type=n,e.label="undefined"!=typeof t.label?t.label:i[n].label,e.autoClose="undefined"!=typeof t.autoClose?t.autoClose:i[n].autoClose,e.template="undefined"!=typeof t.template?t.template:i[n].template,e.click="undefined"!=typeof t.click?t.click:i[n].click,e},setCloseLogOnClick:function(t){this.logCloseOnClick=t},close:function(t,e){this.logCloseOnClick&&t.addEventListener("click",function(){d(t)}),e=e&&!isNaN(+e)?+e:this.logDelay,e<0?d(t):e>0&&setTimeout(function(){d(t)},e)},dialog:function(t,e,n,i){return this.setup({type:e,message:t,okButton:n||{},cancelButton:i||{}})},log:function(t,e,n){if(l&&l.elements.length){var i=l.elements.length-this.logMaxItems;if(i>=0)for(var o=0,a=i+1;o<a;o++)this.close(l.elements[o],-1)}this.notify(t,e,n)},setLogContainerClass:function(t){this.logContainerClass=o.logContainerClass+" "+t},setLogPosition:function(t){var e=t.split(" ");["top","bottom"].indexOf(e[0])!==-1&&["left","right"].indexOf(e[1])!==-1&&(this.logPosition=t)},setupLogContainer:function(){var t=this.logContainerClass+" "+this.logPosition,e=l&&l.container.parentNode!==this.parent;l&&!e||(e&&d(l.container),l={},l.container=document.createElement("div"),l.container.className=t,this.parent.appendChild(l.container)),l.container.className!==t&&(l.container.className=t)},notify:function(t,e,n){this.setupLogContainer();var i=document.createElement("div");i.className=e||"default",a.logTemplateMethod?i.innerHTML=a.logTemplateMethod(t):i.innerHTML=t,"function"==typeof n&&i.addEventListener("click",n),l.elements||(l.elements=[]),l.elements.push(i),l.container.appendChild(i),setTimeout(function(){i.className+=" show"},10),this.close(i,this.logDelay)},setup:function(e){function n(t){"function"!=typeof t&&(t=function(){});for(var e=0;e<o.length;e++){var n,i=o[e];switch(i.type){case"ok":n=function(e){return function(n){e.click&&"function"==typeof e.click&&(l?e.click(n,r,l.value):e.click(n,r)),t(l?{buttonClicked:"ok",inputValue:l.value,event:n}:{buttonClicked:"ok",event:n}),e.autoClose===!0&&d(r.container)}}(i);break;case"cancel":n=function(e){return function(n){e.click&&"function"==typeof e.click&&e.click(n,r),t({buttonClicked:"cancel",event:n}),e.autoClose===!0&&d(r.container)}}(i);break;default:n=function(e){return function(n){e.click&&"function"==typeof e.click&&e.click(n,r),t({buttonClicked:e.type,event:n}),e.autoClose===!0&&d(r.container)}}(i)}i.element.addEventListener("click",n)}l&&l.addEventListener("keyup",function(t){13===t.which&&a.click()})}var o=this.createButtonsDefinition(e);r=this.build(e,o),r.container=document.createElement("div"),r.container.className=this.dialogContainerClass+" hide",r.container.appendChild(r.wrapper);for(var a,l=r.input,s=r.label,u=0;u<o.length;u++)"ok"===o[u].type&&(a=o[u].element);l&&("string"==typeof this.promptPlaceholder&&(s?s.textContent=this.promptPlaceholder:l.placeholder=this.promptPlaceholder),"string"==typeof this.promptValue&&(l.value=this.promptValue));var c;return"function"==typeof Promise?c=new Promise(n):n(),this.dialogPersistent===!1&&r.container.addEventListener("click",function(t){t.target!==this&&t.target!==r.wrapper||d(r.container)}),window.onresize=function(){t(r.wrapper)},this.parent.appendChild(r.container),setTimeout(function(){i(r.container,"hide"),t(r.wrapper),l&&e.type&&"prompt"===e.type?(l.select(),l.focus()):a&&a.focus()},100),c},setDialogButtons:function(t){return this.dialogButtonsDefinition=t instanceof Array?t:o.dialogButtonsDefinition,this},setDelay:function(t){return t=t||0,this.logDelay=isNaN(t)?o.logDelay:parseInt(t,10),this},setLogMaxItems:function(t){this.logMaxItems=parseInt(t||o.logMaxItems)},setDialogWidth:function(t){"number"==typeof t&&(t+="px"),this.dialogWidth="string"==typeof t?t:o.dialogWidth},setDialogPersistent:function(t){this.dialogPersistent=t},setDialogContainerClass:function(t){this.dialogContainerClass=o.dialogContainerClass+" "+t},theme:function(t){switch(t.toLowerCase()){case"bootstrap":this.dialogs.buttons.ok.template='<button data-alertify-btn="ok" class="ok btn btn-primary" tabindex="1"></button>',this.dialogs.buttons.cancel.template='<button data-alertify-btn="cancel" class="cancel btn btn-default" tabindex="2"></button>',this.dialogs.input="<input data-alertify-input class='form-control' type='text'>";break;case"purecss":this.dialogs.buttons.ok.template='<button data-alertify-btn="ok" class="ok pure-button" tabindex="1"></button>',this.dialogs.buttons.cancel.template='<button data-alertify-btn="cancel" class="cancel pure-button" tabindex="2"></button>';break;case"mdl":case"material-design-light":this.dialogs.buttons.ok.template='<button data-alertify-btn="ok" class="ok mdl-button mdl-js-button mdl-js-ripple-effect"  tabindex="1"></button>',this.dialogs.buttons.cancel.template='<button data-alertify-btn="cancel" class="cancel mdl-button mdl-js-button mdl-js-ripple-effect" tabindex="2"></button>',this.dialogs.input='<div class="mdl-textfield mdl-js-textfield"><input data-alertify-input class="mdl-textfield__input"><label data-alertify-input-label class="md-textfield__label"></label></div>';break;case"angular-material":this.dialogs.buttons.ok.template='"<button data-alertify-btn="ok" class="ok md-primary md-button" tabindex="1"></button>"',this.dialogs.buttons.cancel.template='<button data-alertify-btn="cancel" class="cancel md-button" tabindex="2"></button>',this.dialogs.input='<div layout="column"><md-input-container md-no-float><input data-alertify-input type="text"></md-input-container></div>';break;case"default":default:this.dialogs.buttons.ok.template=o.dialogs.buttons.ok.template,this.dialogs.buttons.cancel.template=o.dialogs.buttons.cancel.template,this.dialogs.input=o.dialogs.input}},reset:function(){this.theme("default"),this.parent=o.parent,this.dialogWidth=o.dialogWidth,this.dialogPersistent=o.dialogPersistent,this.dialogContainerClass=o.dialogContainerClass,this.dialogButtonsDefinition=o.dialogButtonsDefinition,this.promptValue="",this.promptPlaceholder="",this.logDelay=o.logDelay,this.logMaxItems=o.logMaxItems,this.logPosition=o.logPosition,this.logCloseOnClick=o.logCloseOnClick,this.logContainerClass=o.logContainerClass,this.logTemplateMethod=null},injectCSS:function(){if(!document.querySelector("#alertifyCSS")){var t=document.getElementsByTagName("head")[0],e=document.createElement("style");e.type="text/css",e.id="alertifyCSS",e.innerHTML=".alertify-logs>*{padding:12px 24px;color:#fff;box-shadow:0 2px 5px 0 rgba(0,0,0,.2);border-radius:1px;transition:all .2s;display:block!important}.alertify-logs>*,.alertify-logs>.default{background:rgba(0,0,0,.8)}.alertify-logs>.error{background:rgba(244,67,54,.8)}.alertify-logs>.success{background:rgba(76,175,80,.9)}.alertify{position:fixed;background-color:rgba(0,0,0,.3);left:0;right:0;top:0;bottom:0;width:100%;height:100%;z-index:1}.alertify.hide{opacity:0;pointer-events:none}.alertify,.alertify.show{box-sizing:border-box;transition:all .33s cubic-bezier(.25,.8,.25,1)}.alertify,.alertify *{box-sizing:border-box}.alertify .alert,.alertify .dialog{width:100%;padding:0;margin:0 auto;position:relative;top:50%}.alertify .alert>*,.alertify .dialog>*{width:400px;max-width:95%;margin:0 auto;text-align:left;padding:18px;background:#fff;box-shadow:0 2px 4px -1px rgba(0,0,0,.14),0 4px 5px 0 rgba(0,0,0,.098),0 1px 10px 0 rgba(0,0,0,.084)}.alertify .alert [data-alertify-msg],.alertify .dialog [data-alertify-msg]{padding-bottom:12px;text-align:left}.alertify .alert input[data-alertify-input]:not(.form-control),.alertify .dialog input[data-alertify-input]:not(.form-control){margin-bottom:12px;width:100%;font-size:100%;padding:8px}.alertify .alert input[data-alertify-input]:not(.form-control):focus,.alertify .dialog input[data-alertify-input]:not(.form-control):focus{outline-offset:-2px}.alertify .alert [data-alertify-btn-holder],.alertify .dialog [data-alertify-btn-holder]{text-align:right}.alertify .alert [data-alertify-btn-holder] [data-alertify-btn]:not(.btn):not(.pure-button):not(.md-button):not(.mdl-button),.alertify .dialog [data-alertify-btn-holder] [data-alertify-btn]:not(.btn):not(.pure-button):not(.md-button):not(.mdl-button){background:transparent;box-sizing:border-box;color:rgba(0,0,0,.87);position:relative;outline:0;display:inline-block;-ms-flex-align:center;-ms-grid-row-align:center;align-items:center;padding:0 6px;margin:6px 0 0 15px;line-height:36px;min-height:36px;white-space:nowrap;min-width:88px;text-align:center;text-transform:uppercase;font-size:14px;text-decoration:none;cursor:pointer;border:1px solid #dbdbdb;border-radius:2px}.alertify .alert [data-alertify-btn-holder] [data-alertify-btn]:not(.btn):not(.pure-button):not(.md-button):not(.mdl-button):active,.alertify .alert [data-alertify-btn-holder] [data-alertify-btn]:not(.btn):not(.pure-button):not(.md-button):not(.mdl-button):hover,.alertify .dialog [data-alertify-btn-holder] [data-alertify-btn]:not(.btn):not(.pure-button):not(.md-button):not(.mdl-button):active,.alertify .dialog [data-alertify-btn-holder] [data-alertify-btn]:not(.btn):not(.pure-button):not(.md-button):not(.mdl-button):hover{background-color:rgba(0,0,0,.05)}.alertify .alert [data-alertify-btn-holder] [data-alertify-btn]:not(.btn):not(.pure-button):not(.md-button):not(.mdl-button):focus,.alertify .dialog [data-alertify-btn-holder] [data-alertify-btn]:not(.btn):not(.pure-button):not(.md-button):not(.mdl-button):focus{border:1px solid rgba(0,0,0,.1)}.alertify .alert [data-alertify-btn-holder] [data-alertify-btn].btn,.alertify .dialog [data-alertify-btn-holder] [data-alertify-btn].btn{margin:6px 4px}.alertify-logs{position:fixed;z-index:2}.alertify-logs.bottom,.alertify-logs:not(.top){bottom:16px}.alertify-logs.left,.alertify-logs:not(.right){left:16px}.alertify-logs.left>*,.alertify-logs:not(.right)>*{float:left;transform:translateZ(0);height:auto}.alertify-logs.left>.show,.alertify-logs:not(.right)>.show{left:0}.alertify-logs.left>*,.alertify-logs.left>.hide,.alertify-logs:not(.right)>*,.alertify-logs:not(.right)>.hide{left:-110%}.alertify-logs.right{right:16px}.alertify-logs.right>*{float:right;transform:translateZ(0)}.alertify-logs.right>.show{right:0;opacity:1}.alertify-logs.right>*,.alertify-logs.right>.hide{right:-110%;opacity:0}.alertify-logs.top{top:0}.alertify-logs>*{box-sizing:border-box;transition:all .4s cubic-bezier(.25,.8,.25,1);position:relative;clear:both;-webkit-backface-visibility:hidden;backface-visibility:hidden;perspective:1000;max-height:0;margin:0;padding:0;overflow:hidden;opacity:0;pointer-events:none}.alertify-logs>.show{margin-top:12px;opacity:1;max-height:1000px;padding:12px;pointer-events:auto}",t.insertBefore(e,t.firstChild)}},removeCSS:function(){var t=document.querySelector("#alertifyCSS");t&&t.parentNode&&t.parentNode.removeChild(t)}};return a.injectCSS(),{_$$alertify:a,parent:function(t){a.parent=t},reset:function(){return a.reset(),this},dialog:function(t){return a.dialog(t,"dialog",null,null)||this},alert:function(t,e,n){return a.dialog(t,"alert",e,n)||this},confirm:function(t,e,n){return a.dialog(t,"confirm",e,n)||this},prompt:function(t,e,n){return a.dialog(t,"prompt",e,n)||this},log:function(t,e,n){return a.log(t,n,e),this},success:function(t,e){return a.log(t,"success",e),this},error:function(t,e){return a.log(t,"error",e),this},theme:function(t){return a.theme(t),this},dialogWidth:function(t){return a.setDialogWidth(t),this},dialogPersistent:function(t){return a.setDialogPersistent(t),this},dialogContainerClass:function(t){return a.setDialogContainerClass(t||""),this},dialogButtons:function(t){return a.setDialogButtons(t),this},delay:function(t){return a.setDelay(t),this},placeholder:function(t){return a.promptPlaceholder=t,this},defaultValue:function(t){return a.promptValue=t,this},maxLogItems:function(t){return a.setLogMaxItems(t),this},closeLogOnClick:function(t){return a.setCloseLogOnClick(t),this},logPosition:function(t){return a.setLogPosition(t||""),this},logContainerClass:function(t){return a.setLogContainerClass(t||""),this},setLogTemplate:function(t){return a.logTemplateMethod=t,this},clearLogs:function(){return l&&(l.container.innerHTML=""),this},closeDialog:function(){return r&&d(r.container),this},version:a.version}}var l,r,s=500,d=function(t){if(t){var e=function(){t&&t.parentNode&&t.parentNode.removeChild(t)};i(t,"show"),o(t,"hide"),t.addEventListener("transitionend",e),setTimeout(e,s)}};if("undefined"!=typeof module&&module&&module.exports){module.exports=function(){return new a};var u=new a;for(var c in u)module.exports[c]=u[c]}else"function"==typeof define&&define.amd?define(function(){return new a}):window.alertify=new a}();