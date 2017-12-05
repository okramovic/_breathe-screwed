var alarm = 0
var timers = {}
var workers = {}

function success(){
        //alert('yes')
}
function error(er){
        alert("er" + JSON.stringify(er) +"<")
}


/*if ('serviceWorker' in navigator){
  
        //alert('browser has service worker');
        //console.log('serviceWorker available');
          
        navigator.serviceWorker
            .register('sw.js')
            .then(function(reg){
          
                    console.log('sw registered', reg);
        })
  
} else {
    alert('serviceWorker not available in this browser');
}*/
document.addEventListener("deviceready", function(){

        cordova.plugins.notification.local.schedule({
            title: 'My first notification',
            text: 'Thats pretty easy.. fuck',
            foreground: true
        });  
        
        alert(">\n" + JSON.stringify(cordova.plugins.notification.local.getDefaults() ) + "\n<"   )
        
        cordova.plugins.backgroundMode.enable();

        //alert(">\n" + JSON.stringify(window.wakeuptimer) + "\n<")
        
        setTimeout(function(){
                //var testsound22 = new Media('/assets/www/res/mynoise_korimako_new_zealand_1.mp3')//success,error) 

                
                //cordova.plugins.backgroundMode.moveToForeground();
                navigator.notification.alert(   'test alert', 
                                                ()=>{
                                                alert('this is callback')},
                                                'my title'
                )

                //testsound22.play()

                //cordova.backgroundapp.show()
        },7000)

        setTimeout(function(){
                
                // Turn screen on 
                cordova.plugins.backgroundMode.wakeUp();
                alert('wake up')
                //testsound22.play()

                //cordova.backgroundapp.show()
        },15000)

        setTimeout(function(){
                // Turn screen on and show app even locked 
                cordova.plugins.backgroundMode.unlock();
                alert('unlock')
                //testsound22.play()
        },25000)
        setTimeout(function(){

                alert(">" + JSON.stringify(cordova.plugins.backgroundMode) + "<")     
        },45000)
        /*window.wakeuptimer.wakeup(successWake, errorWake,
                {
                  "alarms":[{
                        "type":"repeating",
                        "time":{"minutes": 1 },
                        "message" : "M Alarm has expired M"
                  }]      
                }
        )*/
        //extra : { message : 'json containing app-specific information to be posted when alarm triggers' },

        function successWake(result){
                alert("sukces \n" + result.type + "\n" + JSON.stringify(result))
        }
        function errorWake(er){
                alert("-- error \n" + JSON.stringify(er));
        }
});

document.addEventListener('DOMContentLoaded',function(ev){
        
        /*
                setTimeout(function(){
                //var testdva = document.getElementById('testdva')
                //testdva.play()
                //alert('init 2')
                },8500)
        */
      // consoling
      let cons = document.getElementById('cons')
      cons.addEventListener('click',()=>{

        if (cons.innerHTML ==='v phngp 1'){
                cons.innerHTML = 'v phngp 1' + '<br/>' +
                                JSON.stringify(window.timers) + 
                                '<br/>' + 
                                'workers:' + '<br/>' +
                                JSON.stringify(window.workers)
        } else cons.innerHTML = 'v phngp 1'
      })

      let timerAdd = document.getElementById('timerAdd')

      timerAdd.addEventListener('click', function(){

                //let timerSettings = document.getElementById('newTimerSettings')
                var Sound = null

                let node = document.getElementById('newTimerSettings')

                // prevent button to open more than 1 timer
                if (node.innerHTML != '') return

                    
                createTimerMenu.call(node,'test string')


                // preview sound 
                document.getElementById('soundSelection').addEventListener('change',(ev)=>{
                                
                            //console.log(ev)
                            
                            let choice = ev.srcElement.selectedIndex// + 1 // +1 bcs there is woodblock demo sound as 0th element 
                            
                            console.log("choice index",choice, ev.srcElement.selectedOptions[0].value)


                            let demo = document.querySelectorAll('audio')//.children
                            
                            Sound = demo[choice].firstChild.src
                            if (Sound.startsWith('file://')) Sound = Sound.replace('file://','')

                            let src = '/www' + Sound.toString()

                            var testsound = new Media(src,success,error)    /*'/www' + Sound,*/
                                                        

                            testsound.play()
                            //alert("src" + src)

                            setTimeout(()=>{ testsound.pause();
                                             testsound.stop()
                            }, 5000)
                            //Sound.play()

                            /*let arr = nodesToArr.call(demo,demo.length)
                                //console.log(arr, Array.isArray(arr));

                                // contains mp3 file names
                                arr = arr.map((item)=>{ 
                                                let origin = item.children[0].baseURI
                                                let relPath = item.children[0].src.replace(origin + "resources/", "")
                                                return relPath})

                                //console.log(arr, Array.isArray(arr));

                                let xxx = arr.find((item)=>{ return item === choice })
                            */

                })
                // form validation => adding new timer
                document.getElementById('confirmNewTimer').addEventListener('click', ()=>{
                            let newMenu = document.getElementById('newTimerSettings')

                            // check if maximum amount of timers 5 hasnt been reached
                                    let props = 0
                                    for (var prop in window.timers){
                                            console.log("prop", prop)
                                            if (prop) props ++
                                    }
                                    if (props > 5){
                                        alert('you have too many timers set, 3 is max')
                                        let newMenu = document.getElementById('newTimerSettings')
                                        newMenu.parentNode.removeChild(newMenu)
                                        return
                                    }
                                    //console.log('props', props)
                            
                            
                            // set timer name
                                let timerName = document.getElementById('newTimerText').value
                                if (!timerName || timerName.trim()===""){   alert('there has to be some text set')
                                                                            // set focus on that element
                                                                            return
                                }
                                timerName = timerName.replace(/\s/g,"_")
                            // check that this name isnt used already = prevent duplicities & bugs

                                if (window.timers.hasOwnProperty(timerName)){
                                        alert('choose different timer name')
                                        // focus on element
                                        return
                                }    

                            
                            // set interval number in minutes

                                let units = parseInt(document.querySelector('input[name="timeUnits"]:checked').value)
                                
                                let interval =  parseInt(document.getElementById('newTimerInterval').value) * units
                                if (isNaN(interval) || interval <= 0 ){
                                            alert('set proper interval')
                                            // set focus on that element
                                            return
                                }
                                console.log("interval",interval, typeof interval)
                                document.getElementById('newTimerInterval').value = interval

                            // set repeats
                                let repeats = null
                                // if indef is checked
                                if (document.getElementById('indefiniteRepeat').checked){
                                        console.log("indefinite repeats")
                                        repeats = -2

                                } else {
                                        //console.log("indefinite NOT")
                                        if (  document.getElementById('newTimerRepeats').value < 1  ||  
                                                isNaN(parseInt(document.getElementById('newTimerRepeats').value))) {

                                                alert('repeats must be higher than 0')
                                                // focus element
                                                return
                                        }
                                        repeats = parseInt(document.getElementById('newTimerRepeats').value) || 5
                                        console.log("repeats", repeats)

                                }
                            // set loud daytime
                                
                                let from = parseInt( document.getElementById('loudMin').value ) || 10
                                let till = parseInt( document.getElementById('loudMax').value ) || 23

                                if ( till <= from) {
                                        alert('"From" must be earlier time than "To"')
                                        return
                                }
                                
                            // 
                               //alert('setting sound')
                            // set sound
                                let sounds = document.querySelectorAll('audio'),
                                    index = document.getElementById('soundSelection').selectedIndex


                                //let Sound = 
                            toMedia(sounds[index], (audio)=>{

                                    let myArgs = []; myArgs[0] = audio

                                        //console.log("Sound", Sound, "\n")
                                        // create interval 
                                    window.timers[timerName] = {}
                                        window.timers[timerName].name = timerName
                                        window.timers[timerName].active = true
                                        window.timers[timerName].soundName = sounds[index].getAttribute('id')
                                        window.timers[timerName].loud = true
                                        window.timers[timerName].from = from
                                        window.timers[timerName].till = till
                                        window.timers[timerName].units = (units===1)? " sec":" min"
                                        window.timers[timerName].interval = interval * 1000
                                        window.timers[timerName].repeats = repeats
                                        window.timers[timerName].remains = repeats//( (repeats === -1)? : )
                                        //window.timers[timerName].endDate = getEndDate()
                                        window.timers[timerName].timer = 
                                                        myTimer.apply(window.timers[timerName], [myArgs])
                                        
                                        //console.log("new timer\n", window.timers[timerName])
                                        //newMenu.parentNode.removeChild(newMenu)   
                                        addTimerToList(window.timers[timerName])

                                        newMenu.innerHTML = '' 
                                        newMenu.style.display = 'none'
                                        // add this timer to active timers div    
                                })
                                

                            
                            

                            
                })
      })

      //if (window.Worker){
        //window.worker = new Worker('scripts/webworker.js')

        //window.worker.onmessage = function(e){
        //        console.log("received result from Worker", e.data)
        //        console.log(e)
                //if (e.data % 2===0) 
        //        woodblock.play()
                //alarm = 0
        //}*/
        

       /*} else {
        document.getElementById('interval').innerHTML = "NO WEB WORKER"
        alert('web worker no available')
       }*/
  })
function myTimer(args){
            //console.log("this", this)
            //console.log("args")
            //console.log(Array.isArray(args), args)
                //alert('ok')
            let self = this, sound = args[0]
            // clone = Object.assign({}, self)
                // delete clone.sound
            
                //let myInterval = setInterval.bind(self)
                //console.log( myInterval)

            if (window.Worker){
                
                //let 
                workers[this.name] = {}

                workers[this.name].worker = new Worker('./js/webworker.js')
        
                workers[this.name].worker.onmessage = function(e){
                        //console.log("timer name", e.data)
                        //console.log(e)
                        //if (e.data % 2===0) 
                        updateTimerInfo(e.data)
                        playSound( sound )
                        //alarm = 0
                }
                //console.log(this.worker)
                workers[this.name].worker.postMessage(self)        
            }else alert('no web workers available, timer wont work')



}
function updateTimerInfo(timer){

        console.log("timer to update", timer)//, "\n", el)

        //let el = document.getElementById(timer.name)
        let ch = document.getElementById(timer.name).childNodes
        //console.log("children", ch)

        let remains = getEl('remains')
        //console.log("remains",remains)
        remains.innerHTML = 'remains: ' + timer.remains

        let status = getEl('status')
        if (timer.remains === 0) status.innerHTML = 'finished'


        function getEl(classname){

                for (let i=0;i<ch.length; i++){
                        //console.log("child class", ch[i].getAttribute('class'))
                        if (ch[i].getAttribute('class').includes(classname)) return ch[i]
                }
        }
}
function addTimerToList(timer){

        if (document.getElementById('setTimersHeader').innerHTML == '')
                document.getElementById('setTimersHeader').innerHTML = 'your timers'

        let div = document.createElement('div')  //'<div class="timerLI">' + 
        div.setAttribute('class', 'timerLIExpanded') 
        div.id = timer.name.toString()

        div.innerHTML = '<h5 class="reminder">' + timer.name.replace(/_/g," ") + '</h5>' + 
                        '<p class="sound"> sound:' + timer.soundName + '</p>' + 
                        '<p class="interval"> interval:' + timer.interval/1000 + " " + timer.units + '</p>' + 
                        '<p class="remains"> remains:' + timer.remains + '</p>' + 
                        '<p class="from"> from:' + timer.from + '</p>' + 
                        '<p class="till"> till:' + timer.till + '</p>' 

        if (timer.active) div.innerHTML += '<p class="status">active</p>'
        else div.innerHTML += '<p class="status">switched off</p>'
                        
        div.innerHTML += '<button class="pause"  >pause</button>' + 
                         '<button class="delete" onclick="deleteTimer('+ timer.name +')">delete</button>'

        //div += '</div>'

        return document.getElementById('setTimers').appendChild(div)


}
function deleteTimer(timer){
        let timername = timer.id
        
        delete window.timers[timername]

        let w = workers[timername].worker.terminate()
        //console.log("worker", w)
        //w.terminate()
        delete workers[timername]

        let el = document.getElementById(timername)
        el.parentNode.removeChild(el)

        if( document.getElementById('setTimers').innerHTML==='' ){ document.getElementById('setTimersHeader').innerHTML = ''}
        console.log("deleteed", timer.id)
}

function playSound(sound){
        //console.log("sound to play id", sound.id)
        return sound.play()
}
function toMedia(audioEl, cb){

        let src = audioEl.firstChild.src
        if (src.startsWith('file://')) src = src.replace('file://','')

        src = '/www' + src//.toString()

        //alert('src=>' + src + "<")
        let m = new Media(src, success,error)
        //m.play()
        //
        if (cb) cb(m)
        else return new Media(src, success,error)
        //return m

}
function setMyInterval(){
    //if (woodblock) woodblock.play()
    
    if (alarm === 0){
        //alarm = 1
        window.worker.postMessage([2,3])

    } else {
        //alarm = 0

    }

}

function testTimer(){
        //console.log(falcon)
        

        let node = document.createElement('p')
        node.innerHTML = 'timer set';
        node.setAttribute('id', "announce")

        document.getElementById('cons').appendChild(node)

        setTimeout(function(){
            let node = document.getElementById('announce')
            node.innerHTML = 'timeout passed';
            
            console.log('timer passed')
            falcon.play();
            
        },15000)
}

// node.innerHTML = new timerMenu()
function createTimerMenu(node){

        //console.log(node)

        //console.log(this)
        this.setAttribute('style', 'display: flex;') //flex-direction: column; align-items: center')

        this.innerHTML = 
                    '<h5 class="cancel" id="cancelAddTimer">cancel</h5>' +
                    //'<div>' +        
                    //'</div>' + 

                    '<h3>setting new timer</h3>' +

                    '<h4>remind me to:</h4>' +
                    '<input id="newTimerText" type="text" value="breathe in deeply" placeholder="sit with my back straight">' +
                    '<br/>' +

                    '<h4>choose sound</h4>'+
                    '<select id="soundSelection">'+
                        '<option value="mynoise_korimako_new_zealand_1.mp3" ' +
                                '>korimako</option>' + 
                        '<option value="mynoise_birds_random_palmgarden.mp3" ' +
                                '>garden</option>' + 
                        '<option value="mynoise_birds_coockoo.mp3" ' +
                                '>cuckoo</option>' + 
                        '<option value="mynoise_frogs_crickets_ricefield_mycookie.mp3" ' +
                                '>crickets</option>' + 
                        '<option value="soundsnap_bird_MYEDIT_LESSER_SHORT_TOED_LARK_SONG_KAZ_200502.mp3" '+
                                '>lark</option>' + 
                        '<option value="soundsnap_caxixi_BPM_130_12_SHRIEK_2011.mp3"'+
                                '>caxixi</option>' + 
                        '<option value="soundsnap_MODEM_DIAL_LOGON_AND_CONNECT_2_MYEDIT.mp3" ' +
                                '>modem</option>' + 
                        '<option value="soundsnap_fax_11507101_receiving.mp3" '+
                                '>fax</option>' + 
                        '<option value="soundsnap_MYEDIT_CRYSTAL_WAND_ON_SINGING_BOWL.mp3" '+
                                '>bowl light</option>' + 
                        '<option value="soundsnap_MYEDIT_WINE_CORK_MALLET_DINGING_ON_SINGING_BOWL_LONG_HOLD.mp3" ' +
                                '>bowl deep</option>' + 
                        '<option value="soundsnap_TIBETAN_BOWL_SINGING_MYEDIT.mp3" '+
                                '>bowl gradual</option>' + 
                        '<option value="soundsnap_woodblock_BPM_100_5_SHRIEK_2011.mp3" '+
                                '>woodblock cool</option>' + 
                        '<option value="soundsnap_woodblock_BPM_100_9_SHRIEK_2011_MYEDIT.mp3" '+
                                '>woodblock simple</option>' + 
                        '<option value="soundsnap_woodblock_BPM_100_18_SHRIEK_2011.mp3" '+
                                '>woodblock thoughtful</option>' + 
                        '<option value="soundsnap_woodblock_BPM_100_26_SHRIEK_2011.mp3" '+
                                '>woodblock master-plan</option>' + 
                        '<option value="soundsnap_woodblock_BPM_100_27_SHRIEK_2011.mp3" '+
                                '>woodblock rascal</option>' + 
                        '<option value="soundsnap_woodblock_BPM_120_5_SHRIEK_2011.mp3" '+
                                '>woodblock chinese</option>' + 
                        '<option value="soundsnap_woodblock_WOODBLUCK_BPM_120_3_MYEDIT.mp3" '+
                                '>woodblock intermezzo</option>' + 
                    '</select>' + 
                    '<br/>' +

                    '<h4>repeats</h4>'+
                    '<div class="full horiz around botMar25" style="border: 1px solid">' + 

                        '<div class="vert" style="padding: 15px 0px">' +
                            '<label >interval</label >' + 
                            '<input id="newTimerInterval" type="number" min="1" value="1">' +
                            '<form id="timeUnits">'+
                                '<input type="radio" name="timeUnits" value="1" checked >sec' + 
                                '<input type="radio" name="timeUnits" value="60">mins' + 
                            '</form>' +
                        '</div>' +   


                        '<div class="vert" style="padding: 15px 0px">' +   
                            '<div id="repeatsNumber">' + 
                                '<label id="repeatLabel">repeats</label >' + 
                                '<input id="newTimerRepeats" type="number" min="1" value="1">' +
                            '</div>' + 
                        
                            '<div class="horiz topMar15">' +
                                '<label >indefinite</label >' + 
                                '<input id="indefiniteRepeat" type="checkbox" disabled>' +
                            '</div>' +       
                        '</div>' +       
                    '</div>' + 


                    '<div class="full horiz around botMar25" style="border: 1px solid">' + 
                        '<h4>sounds only</h4>'+
                        '<input id="loudMin" type="number" min="0" max="23" value="10">' +
                        '<span>till</span>' +
                        '<input id="loudMax" type="number" min="0" max="23" value="23">' +
                    '</div>' + 

                    '<button id="confirmNewTimer">set timer</button>' 

        ;
        // cancelling new timer
        document.getElementById('cancelAddTimer').addEventListener('click',(ev)=>{
                document.getElementById('newTimerSettings').innerHTML = ''
                document.getElementById('newTimerSettings').style.display = 'none'
        })
        // inifinite repeat chanage
        document.getElementById('indefiniteRepeat').addEventListener('change',(ev)=>{
                        console.log("checked?",ev.srcElement.checked)
                        let active = ev.srcElement.checked
                        if (active){
                                document.getElementById('newTimerRepeats').disabled = true;  
                                //document.getElementById('repeatsNumber').style.textDecoration = 'line-through'
                                document.getElementById('repeatLabel').style.color = 'gray'

                                
                        } else {
                                document.getElementById('newTimerRepeats').disabled = false;
                                //document.getElementById('repeatsNumber').style.textDecoration = 'none'
                                document.getElementById('repeatLabel').style.color = 'black'
                        }
        })

        /*document.getElementById('soundSelection').addEventListener('change',()=>{
                    let demo = document.querySelectorAll('audio').children

                    console.log(demo);
            })

            document.getElementById('confirmNewTimer').addEventListener('click', ()=>{

                let soundHref = document.getElementById('soundSelection').selectedOptions[0].value

        })*/
}

function getEndDate(){

}
/*function nodesToArr(len){

        let result = [];
        // i=1 to skip first woodblock audio

        for (var i=1; i<len; i++){

            result.push(this[i])
        }
        return result
}*/

/**
 * 
 * //                              /android_asset/...
        var testsound = new Media('/android_asset/www/res/mynoise_korimako_new_zealand_1.mp3'
                                ,success,error
                                //,function success(){ alert('media sukces');}
                                //function fail(){  alert('media error') }
                        );
                        testsound.play()
 */
