var ngPopup = angular.module("ngPopup",[])

ngPopup.factory("ngPopupBuilder", function($q, $http){
    var ngPopupBuilder = {
        layoutInit: function(option){
            var templateHtml = (option.template) ? option.template : '';
            var templateUrlHtml = '';
            var html = null;

            if(option.templateUrl) {
                var xmlHttpRequest = new XMLHttpRequest();
                xmlHttpRequest.onreadystatechange = function () {
                    if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
                        templateUrlHtml = xmlHttpRequest.responseText;
                    }
                }
                xmlHttpRequest.open("GET", option.templateUrl, false);
                xmlHttpRequest.send(null);
            }
            html = '<div class="container">' +
            '<div class="resizeCorner">' +
            '<div class="left-top-corner"></div>' + '<div class="left-bottom-corner"></div>' + '<div class="right-top-corner"></div>' + '<div class="right-bottom-corner"></div>' +
            '</div>' +
            '<div class="resizeBar">' +
            '<div class="top-bar"></div>' + '<div class="right-bar"></div>' + '<div class="bottom-bar"></div>' + '<div class="left-bar"></div>' +
            '</div>' +
            '<div class="titleBar">' +
            '<div class="iconGroup">' +
            '<span class="glyphicon glyphicon-plus" ng-click=' + option.modelName + '.maximize()></span>' +
            '<span class="glyphicon glyphicon-minus" ng-click=' + option.modelName + '.minimize()></span>' +
            '<span class="glyphicon glyphicon-resize-small" ng-click=' + option.modelName + '.togglePin($event)></span>' +
            '<span class="glyphicon glyphicon-remove" ng-click= ' + option.modelName + '.close()></span>' +
            '</div>' +
            '</div>' +
            '<div class="content">' +
            templateHtml +
            templateUrlHtml +
            '</div>' +
            '</div>';

            return html;


        },
        getDefaultMethods: function(element){
            var $element = element[0];
            var fun = {
                open: function(newPosition){
                    if(newPosition != null){
                        $element.style.top = newPosition.top + "px";
                        $element.style.left = newPosition.left + "px";
                    }
                    $element.style.display = 'block';
                },
                close: function(){
                    $element.style.display = 'none';
                },
                maximize: function(){
                    $element.getElementsByClassName('content')[0].style.display = 'block';
                    $element.style.top = window.screenTop ? window.screenTop : window.screenY +10 + "px";
                    $element.style.left = window.screenLeft ? window.screenLeft : window.screenX +10 + "px";
                    $element.style.width = window.innerWidth - 30+ "px";
                    $element.style.height = window.innerHeight - 30 + "px";
                },
                minimize: function(){
                    $element.getElementsByClassName('content')[0].style.display = 'none';
                    $element.style.height = $element.getElementsByClassName('titleBar')[0].style.height;
                    $element.style.width = '200px';
                },
                togglePin: function(event){
                    if($option.pinned != true){
                        $element.style.position = 'fixed';
                        angular.element(event.target).removeClass('glyphicon-resize-small');
                        angular.element(event.target).addClass('glyphicon-resize-full');
                        $option.pinned = true;
                    }
                    else{
                        $element.style.position = 'absolute';
                        angular.element(event.target).removeClass('glyphicon-resize-full');
                        angular.element(event.target).addClass('glyphicon-resize-small');
                        $option.pinned = false;
                    }

                },
                isOpened: function(){
                    return ($element.style.display != 'none') ? true : false;
                },
                isMaximized: function(){

                },
                isMinimized: function(){
                    return ($element.getElementsByClassName('content')[0].style.display != 'none') ? false : true;
                }
            };

            return fun;
        },
        getDefaultOptions: function(){
            var defaultOption = {
                modelName : "",
                width : 100,
                height : 100,
                template: "123",
                templateUrl : "",
                resizable : true,
                draggable : true,
                position : {
                    top : 100,
                    left : 100
                },
                title : "",
                modal : false,
                pinned : false,
                onOpen : function(){},
                onClose  : function(){},
                onDragStart : function(){},
                onDragEnd : function(){},
                onResize : function(){}

            };

            return defaultOption;
        }
    };

    return ngPopupBuilder;
});
ngPopup.directive("ngPopUp",function($parse,$document,$templateCache, $compile, ngPopupBuilder){

    return{
        restrict: "EA",
        scope:{
            option:"="
        },
        replace:true,
        template:'<div class="ngPopup"></div>',
        link: function(scope, element, attrs){

            var $element = element[0];
            var $option = ngPopupBuilder.getDefaultOptions();
            $option = scope.option;

            scope.$parent.$watch(attrs.option,function(value){
                $element.style.position = 'absolute';
                $element.style.width = $option.width + 'px';
                $element.style.height = $option.height + 'px';
                $element.style.top = $option.position.top + 'px';
                $element.style.left = $option.position.left + 'px';
            },true)

            var modelName = $parse($option.modelName);
            modelName.assign(scope.$parent, ngPopupBuilder.getDefaultMethods(element));



            var html = ngPopupBuilder.layoutInit($option);
            var compiledHtml = $compile(html)(scope.$parent);
            element.append(compiledHtml);

            element.bind("mousedown", function(event){

                var target = angular.element(event.target);
                var targetTop = $element.offsetTop;
                var targetLeft = $element.offsetLeft;
                var targetHeight = parseInt($element.style.height, 10);
                var targetWidth = parseInt($element.style.width,10);
                var origY = event.pageY;
                var origX = event.pageX;

                if(target.hasClass('titleBar')) {
                    if($option.draggable == false) return;

                    $document.find('body').addClass('unselectable');
                    $document.bind("mousemove", function (event) {

                        $element.style.top = event.pageY - origY + targetTop + "px";
                        $element.style.left = event.pageX - origX + targetLeft + "px";

                    })
                }

                if(target.parent().hasClass('resizeCorner')){
                    if($option.resizable == false) { $document.find('body').removeClass('unselectable'); return;}

                    $document.find('body').addClass('unselectable');
                    if(target.hasClass("right-bottom-corner")){
                        $document.bind("mousemove", function (event) {

                            $element.style.height = event.pageY - $element.offsetTop  + "px";
                            $element.style.width =  event.pageX - $element.offsetLeft + "px";

                        })
                    }
                    else if(target.hasClass("right-top-corner")){
                        $document.bind("mousemove", function (event) {

                            $element.style.top = event.pageY + "px";
                            $element.style.width = targetWidth + event.pageX - origX + "px";
                            $element.style.height = targetHeight - event.pageY + origY + "px";

                        })
                    }
                    else if(target.hasClass("left-top-corner")){
                        $document.bind("mousemove", function (event) {

                            $element.style.left = event.pageX + "px";
                            $element.style.top = event.pageY + "px";
                            $element.style.width = targetWidth - event.pageX + origX + "px";
                            $element.style.height = targetHeight - event.pageY + origY + "px";

                        })
                    }
                    else if(target.hasClass("left-bottom-corner")){
                        $document.bind("mousemove", function (event) {

                            $element.style.left = event.pageX + "px";
                            $element.style.width = targetWidth - event.pageX + origX + "px";
                            $element.style.height = targetHeight + event.pageY - origY + "px";

                        })
                    }
                }

                if(target.parent().hasClass('resizeBar')){
                    if($option.resizable == false)  { $document.find('body').removeClass('unselectable'); return;}

                    $document.find('body').addClass('unselectable');
                    if(target.hasClass('left-bar')){
                        $document.bind("mousemove", function (event) {
                            $element.style.left = targetLeft + event.pageX - origX + "px";
                            $element.style.width = targetWidth - event.pageX + origX + "px";
                        })
                    }
                    else if(target.hasClass('right-bar')){
                        $document.bind("mousemove", function (event) {

                            $element.style.width = targetWidth + event.pageX - origX + "px";
                        })
                    }
                    else if(target.hasClass('top-bar')){
                        $document.bind("mousemove", function (event) {
                            $element.style.top = event.pageY + "px";
                            $element.style.height = targetHeight - event.pageY + origY + "px";
                        })
                    }
                    else if(target.hasClass('bottom-bar')){
                        $document.bind("mousemove", function (event) {
                            $element.style.height = targetHeight + event.pageY - origY + "px";
                        })
                    }
                }



            });

            element.bind("mouseup", function(event){
                $document.find('body').removeClass('unselectable');
                $document.unbind("mousemove");
            })







        }

    }
});