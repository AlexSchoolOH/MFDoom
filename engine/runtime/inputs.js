(function () {
    window.inputs = {
        keys: {},
    };

    window.addEventListener("keydown", (event) => {
        window.inputs.keys[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
        window.inputs.keys[event.key] = false;
    });
})();