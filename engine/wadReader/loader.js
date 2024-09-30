(function(){
    //Read our wad
    const wadInput = document.getElementById("wadInput");
    wadInput.onchange = () => {
        let wadReader = new FileReader();
        wadReader.onloadend = function (evt) {
            if (evt.target.readyState == FileReader.DONE) {
                window.wad.file = new Uint8Array(evt.target.result);
                try {
                    window.wadRead();
                } catch (error) {
                    console.error(error);
                }
            }
        }
        wadReader.readAsArrayBuffer(wadInput.files[0]);
    }
})()