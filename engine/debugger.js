(function(){
    const debugPanel = document.createElement("div");
    debugPanel.style.visibility = "visible";
  
    document.body.appendChild(debugPanel);
  
    debugPanel.style.backgroundColor = "#bbbbbb"
    debugPanel.style.width = "50%";
    debugPanel.style.height = "25%";
    debugPanel.style.position = "absolute";
  
    debugPanel.style.top = "100%"
    debugPanel.style.transform = "translate(0%,-100%)"
  
    debugPanel.style.overflowY = "scroll";
  
    const oldCC = console.clear;
  
    console.clear = () => {
      oldCC();
      debugPanel.innerHTML = '';
    }
  
    const oldCW = console.warn;
  
    console.warn = (...args) => {
      args.forEach(arg => {
        const info = document.createElement("p")
        info.style.visibility = "visible";
        info.style.backgroundColor = "#efef1f";
        info.style.padding = "0px";
        info.style.margin = "0px"
  
        info.style.width = "100%";
  
        info.innerHTML = arg;
  
        debugPanel.appendChild(info);
        oldCW(arg);
      });
    }
  
    const oldCL = console.log;
  
    console.log = (...args) => {
      args.forEach(arg => {
        const info = document.createElement("p")
        info.style.visibility = "visible";
        info.style.backgroundColor = "#eeeeee";
        info.style.padding = "0px";
        info.style.margin = "0px"
  
        info.style.width = "100%";
  
        info.innerHTML = arg;
  
        debugPanel.appendChild(info);
        oldCL(arg);
      });
    }
  
    const oldCE = console.error;
  
    console.error = (...args) => {
      args.forEach(arg => {
        const info = document.createElement("p")
        info.style.visibility = "visible";
        info.style.backgroundColor = "#ee0000";
        info.style.padding = "0px";
        info.style.margin = "0px"
  
        info.style.width = "100%";
  
        info.innerHTML = arg;
  
        debugPanel.appendChild(info);
        oldCE(arg);
      });
    }

    window.addEventListener("error", (event) => {
      //The one thing we need from the event
      const { message, lineno, colno } = event;

      const info = document.createElement("p")
        info.style.visibility = "visible";
        info.style.backgroundColor = "#ee0000";
        info.style.padding = "0px";
        info.style.margin = "0px"
  
        info.style.width = "100%";
  
        info.innerHTML = `${message} | ${lineno}:${colno}`;
  
        debugPanel.appendChild(info);
        oldCE(arg);
    });
  })();
  
  console.log("Debug console on.");
