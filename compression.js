var lz4 = require("lz4js");

function lastStep(path) {
    switch (path) {
        case 1:
            return 1631;
        case 2:
            return 2009;
        case 3:
            return 2982;
        case 4:
            return 1793;
    }
}

let loaded = 0;

function loadImages() {
    var converterEngine = function (input) {
        var uInt8Array = new Uint8Array(input),
              i = uInt8Array.length;
        var biStr = []; //new Array(i);
        while (i--) { biStr[i] = String.fromCharCode(uInt8Array[i]);  }
        var base64 = window.btoa(biStr.join(''));
        return base64;
    };
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest(src), img64;
            xhr.open('GET', src, true); // url is the url of a PNG/JPG image.
            xhr.responseType = 'arraybuffer';
            xhr.callback = resolve;
            xhr.onload  = function(){
                img64 = converterEngine(this.response); // convert BLOB to base64
                loaded += 1;
                console.log("Loaded: ", loaded);
                resolve(img64);
            };
            xhr.onerror = function(){ reject(src); };
            xhr.send();
        });
    }
    let promises = [];
    for (let path = 1; path <= 4; path++) {
        for (let step = 0; step <= lastStep(path); step++) {
            const src =
                "./perso" + path + "/" + ("0000" + step).slice(-4) + ".jpg";
            promises.push(loadImage(src));
        }
    }
    return Promise.all(promises);
}

loadImages().then(function (images) {
    const json = JSON.stringify(images);
    const array = new TextEncoder("utf-8").encode(json);
    const compressed = lz4.compress(array);
    download(compressed.buffer, "data.lz4");
});

function download(body, filename) {
    const blob = new Blob([body]);

    const link = document.createElement("a");
    // Browsers that support HTML5 download attribute
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
