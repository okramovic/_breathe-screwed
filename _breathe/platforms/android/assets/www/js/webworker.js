var i = 0
var timer
var self
//var active = true

onmessage = function(e){

        if (e.data === "pause") {
            console.log("pausing timer", self.name)  
            self.active = false 
            return 

        } else self = e.data
        console.log("__ worker started __", self)
        
        //postMessage(i)// * e.data[0] * e.data[1])
          
        timer = setInterval(function(smt){
                //console.log("smt",self.remains)

                if (self.remains <= 0) { 

                    clearInterval(timer); 
                    close()
                    return 
                }
                if (self.active){
                    self.remains --
                    postMessage(self)
                }
        }, self.interval)
      
      /*timer = setInterval(function(){
                  if (i >= 4) {
                    clearInterval(timer)
                    i = 0
                  } else { 
                      i++
                      postMessage(i)
                  }
      },4500)*/
}

// close()