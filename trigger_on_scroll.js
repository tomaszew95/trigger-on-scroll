var scrollPlugin = document.getElementById("ceros-trigger-on-scroll-plugin");
var slideHeight = scrollPlugin.getAttribute("slide-height");
var pageWidth = 1280;
var anchors;
var objX = [], objY = [];
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
                let scrollObjects = experience.findLayersByTag("scroll-effect").layers;

                experience.on(CerosSDK.EVENTS.PAGE_CHANGED, pageChangedCallback);
                function pageChangedCallback(){
                    var pageContainer = document.querySelector(".page-viewport.top > .page-container");
                    var scrollObjs = scrollObjects.filter(($object) =>{
                        let $obj = document.getElementById($object.id);
                        if(pageContainer.contains($obj)){
                            return $object;
                        }
                    });

                    objX.length = scrollObjs.length;
                    objY.length = scrollObjs.length;
                    definingDefaultObjectPosition;

                    let pageScroll = $(pageContainer).children().first();
                    anchors = $(pageScroll).find(".scranchor").toArray();
                    for(let y=0; y<anchors.length;y++){
                        if(pageScroll[0] != anchors[y].parentNode){
                            let anchorParent = parseFloat($(anchors[y]).parent().get(0).style.top);
                            let anchorTopPosition = parseFloat(anchors[y].style.top);
                            anchorTopPosition += anchorParent;
                            anchors[y].style.top = (anchorTopPosition + 'px');
                            $(anchors[y]).insertAfter(anchors[y-1]);
                        }
                    }
                    pageContainer.addEventListener("scroll", function(){triggerOnScroll(this,scrollObjs)});
                }
            })
    });
})();

var triggerOnScroll = ($this, scrollObj) =>{
    for(let i = 0;i<scrollObj.length;i++){
        let obj = document.getElementById(scrollObj[i].id);
        let tags = scrollObj[i].getTags();
        let direction;
        let directions = [];
        let firstAnchor = 0;
        let lastAnchor = ((anchors.length)-1);

        _.forEach(tags, function(value, key){
            if(value.indexOf("move-direction:") > -1){
                direction = value.slice(15,value.length);
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
        let minScroll = parseInt(anchors[firstAnchor].style.top, 10);
        let maxScroll = parseInt(anchors[lastAnchor].style.top, 10);
        let scrollRange = maxScroll-minScroll;
        let scrollX = 0;
        let scrollY = 0;

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
            obj.style.setProperty('left',(objX[i]+(differencePos*(pageWidth/slideHeight)*scrollX))+'px');
            obj.style.setProperty('top',(objY[i]+(differencePos*scrollY))+'px');
        }
        //scroll position is above first Ceros anchor
        else if(scrollPosition < minScroll){
            obj.style.setProperty('left',objX[i]+'px');
            obj.style.setProperty('top',objY[i]+'px');
        }
        //scroll position is below second Ceros anchor
        else{
            obj.style.setProperty('left',(objX[i]+(scrollRange*(pageWidth/slideHeight)*scrollX))+'px');
            obj.style.setProperty('top',(objY[i]+(scrollRange*scrollY))+'px');
        }
    }
}
var definingDefaultObjectPosition = () =>{
    for(let x=0; x<scrollObjs.length;x++){
        let obj = document.getElementById(scrollObjs[x].id);
        if(scrollObjs[x].isGroup()){
            objX[x] = parseFloat(obj.style.left);
            objY[x] = parseFloat(obj.style.top);
        }
        else{
            objX[x] = scrollObjs[x].getX();
            objY[x] = scrollObjs[x].getY();
        }
    }
}
