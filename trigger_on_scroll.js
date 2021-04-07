var scrollPlugin = document.getElementById("ceros-trigger-on-scroll-plugin");
var slideHeight = scrollPlugin.getAttribute("slide-height");
var pageWidth = 1280;
var anchors, currentPageScrollObjects;
var objPosX = [], objPosY = [];
(function(){
    'use strict';
    require.config({
        paths: {
            CerosSDK: '//sdk.ceros.com/standalone-player-sdk-v5.min'
        }
    });
    require(['CerosSDK'], function (CerosSDK) {
        CerosSDK.findExperience()
            .fail(function (error) {
                console.error(error);
            })
            .done(function (experience) {
                window.myExperience = experience;
                pageWidth = experience.getCurrentPage().getWidth();
                var scrollObjects = experience.findLayersByTag("scroll-effect").layers;

                experience.on(CerosSDK.EVENTS.PAGE_CHANGED, pageChangedCallback);
                function pageChangedCallback(){
                    var pageContainer = document.querySelector(".page-viewport.top > .page-container");
                    //making new array of scrollObjects that are on current page 
                    currentPageScrollObjects = scrollObjects.filter(($object) =>{
                        let $obj = document.getElementById($object.id);
                        if(pageContainer.contains($obj)){
                            return $object;
                        }
                    });
                    objPosX.length = currentPageScrollObjects.length;
                    objPosY.length = currentPageScrollObjects.length;
                    definingDefaultObjectPosition();

                    var pageScroll = $(pageContainer).children().first();
                    anchors = $(pageScroll).find(".scranchor").toArray();
                    //checking if anchor is inside a group, if yes take it away
                    for(let y=0; y<anchors.length;y++){
                        if(pageScroll[0] != anchors[y].parentNode){
                            let anchorParentTopPos = parseFloat($(anchors[y]).parent().get(0).style.top);
                            let anchorTopPos = parseFloat(anchors[y].style.top);
                            anchorTopPos += anchorParentTopPos;
                            anchors[y].style.top = (anchorTopPos + 'px');
                            $(anchors[y]).insertAfter(anchors[y-1]);
                        }
                    }
                    pageContainer.addEventListener("scroll", function(){triggerOnScroll(this,currentPageScrollObjects)});
                }
            })
    });
})();

var triggerOnScroll = ($this, scrollObj) =>{
    for(let i = 0;i<scrollObj.length;i++){
        var obj = document.getElementById(scrollObj[i].id);
        var tags = scrollObj[i].getTags();
        var directions = [];
        var firstAnchor = 0;
        var lastAnchor = ((anchors.length)-1);

        _.forEach(tags, function(value, key){
            if(value.indexOf("move-direction:") > -1){
                var direction = value.slice(15,value.length);
                if(direction.search("&")>-1){
                    directions = direction.split("&");
                }
                else{
                    directions.push(direction);
                }
            }
            if(value.indexOf("min-scroll:") > -1){
                firstAnchor = parseInt(value.slice(11,value.length), 10);
            }
            if(value.indexOf("max-scroll:") > -1){
                lastAnchor = parseInt(value.slice(11,value.length), 10);
            }
            if(value.indexOf("scroll-delay:")>-1){
                let duration = parseFloat(value.slice(13,value.length));
                let dur = 'top ' + duration + 'ms ease, left ' + duration + 'ms ease';
                obj.style.setProperty("transition", dur);
            }
        })

        var minScroll = parseInt(anchors[firstAnchor].style.top, 10);
        var maxScroll = parseInt(anchors[lastAnchor].style.top, 10);
        var scrollRange = maxScroll-minScroll;
        var scrollX = 0, scrollY = 0;

        for(let y=0; y<directions.length;y++){
            switch(directions[y]){
                case "center":
                    scrollY = 1;
                    break;
                case "right":
                    scrollX = 1;
                    break;
                case "down":
                    scrollY = 2;
                    break;
                case "left": 
                    scrollX = -1;
                    break;
            }
        }

        let scrollPosition = $this.scrollTop;
        let differencePos = scrollPosition-minScroll;

        //scroll position is between Ceros anchors
        if(scrollPosition >= minScroll && scrollPosition <= maxScroll){
            obj.style.setProperty('left',(objPosX[i]+(differencePos*(pageWidth/slideHeight)*scrollX))+'px');
            obj.style.setProperty('top',(objPosY[i]+(differencePos*scrollY))+'px');
        }
        //scroll position is above first Ceros anchor
        else if(scrollPosition < minScroll){
            obj.style.setProperty('left',objPosX[i]+'px');
            obj.style.setProperty('top',objPosY[i]+'px');
        }
        //scroll position is below second Ceros anchor
        else{
            obj.style.setProperty('left',(objPosX[i]+(scrollRange*(pageWidth/slideHeight)*scrollX))+'px');
            obj.style.setProperty('top',(objPosY[i]+(scrollRange*scrollY))+'px');
        }
    }
}
var definingDefaultObjectPosition = () =>{
    for(let i=0; i<currentPageScrollObjects.length;i++){
        let obj = document.getElementById(currentPageScrollObjects[i].id);
        if(currentPageScrollObjects[i].isGroup()){
            if(currentPageScrollObjects[i].x == undefined || currentPageScrollObjects[i].y == undefined){
                currentPageScrollObjects[i].x = parseFloat(obj.style.left);
                currentPageScrollObjects[i].y = parseFloat(obj.style.top);
            }
            objPosX[i] = currentPageScrollObjects[i].getX();
            objPosY[i] = currentPageScrollObjects[i].getY();
        }
        else{
            objPosX[i] = currentPageScrollObjects[i].getX();
            objPosY[i] = currentPageScrollObjects[i].getY();
        }
    }
}
