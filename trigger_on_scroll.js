var scrollPlugin = document.getElementById("ceros-trigger-on-scroll-plugin");
var slideHeight = scrollPlugin.getAttribute("slide-height");
var pageWidth = 1280;
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

                experience.on(CerosSDK.EVENTS.PAGE_CHANGED, pageChangedCallback);
                function pageChangedCallback(){
                    var scrollObjects = experience.findLayersByTag("scroll-effect").layers;
                    var pageContainer = document.querySelector(".page-viewport.top > .page-container");
                    pageContainer.addEventListener("scroll", function(){triggerOnScroll(this,scrollObjects,pageContainer)});
                }
            })
    });
})();
var triggerOnScroll = ($this, scrollObj, page) =>{
    let pageScroll = $(page).children().first();
    let anchors = $(pageScroll).find(".scranchor").toArray();

    for(let i = 0;i<scrollObj.length;i++){
        let tags = scrollObj[i].getTags();
        let obj = document.getElementById(scrollObj[i].id);
        const objX = scrollObj[i].getX();
        const objY = scrollObj[i].getY();
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
                let dur = 'top ' + duration + 'ms linear, left ' + duration + 'ms linear';
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

        //dynamic changes
        let scrollPosition = $this.scrollTop;
        let differencePos = scrollPosition-minScroll;

        //scroll position is between Ceros anchors
        if($this.scrollTop >= minScroll && $this.scrollTop <= maxScroll){
            obj.style.setProperty('left',(objX+(differencePos*(pageWidth/slideHeight)*scrollX))+'px');
            obj.style.setProperty('top',(objY+(differencePos*scrollY))+'px');
        }
        //scroll position is above first Ceros anchor
        else if($this.scrollTop < minScroll){
            obj.style.setProperty('left',objX+'px');
            obj.style.setProperty('top',objY+'px');
        }
        //scroll position is below second Ceros anchor
        else{
            obj.style.setProperty('left',(objX+(scrollRange*(pageWidth/slideHeight)*scrollX))+'px');
            obj.style.setProperty('top',(objY+(scrollRange*scrollY))+'px');
        }
    }
}