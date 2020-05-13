let lz4 = require("lz4js");

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d", { alpha: false });
const size = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width = size;

let people = [];
let count = 1;
let hue = 0;
let last_time = 0;
let delta = 0;

message("Chargement en cours…");

function message(text) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size, size);
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2);
}

function Person(images) {
    this.path = random(1, 4);
    this.hue = random(0, 360);
    this.step = 0;
}

Person.prototype.update = function (images) {
    if (!this.isDead()) {
        ctx.drawImage(images[this.imageIndex()], 0, 0, size, size);
        this.step += 1;
        if (delta > 50) {
            this.step += 1;
        }
        if (delta > 100) {
            this.step += 1;
        }
        if (delta > 150) {
            this.step += 1;
        }
    }
};

Person.prototype.isDead = function () {
    if (this.step > lastStep(this.path)) {
        return true;
    } else {
        return false;
    }
};

Person.prototype.imageIndex = function () {
    let index = this.step;
    if (this.path > 1) {
        index += lastStep(1) + 1;
    }
    if (this.path > 2) {
        index += lastStep(2) + 1;
    }
    if (this.path > 3) {
        index += lastStep(3) + 1;
    }
    return index;
};

function lastStep(path) {
    //return 20;
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

// function to generate random number
function random(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}

function loadData() {
    console.log("Téléchargement de l'archive…");
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest("./data.lz4");
        xhr.open("GET", "./data.lz4", true); // url is the url of a PNG/JPG image.
        xhr.responseType = "arraybuffer";
        xhr.callback = resolve;
        xhr.onload = function () {
            console.log("Décompression de l'archive…");
            const array = lz4.decompress(new Uint8Array(this.response)); // convert BLOB to base64
            const json = new TextDecoder("utf-8").decode(array);
            const base64 = JSON.parse(json);
            resolve(base64);
        };
        xhr.onerror = function () {
            reject(src);
        };
        xhr.send();
    });
}

function loadImages(data) {
    function loadImage(base64) {
        console.log("Préchargement des images…");
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = function () {
                resolve(img);
            };
            img.onerror = img.onabort = function () {
                reject(base64);
            };
            img.src = "data:image/jpg;base64," + base64;
        });
    }
    let promises = [];
    for (let i = 0; i < data.length; i++) {
        promises.push(loadImage(data[i]));
    }
    return Promise.all(promises);
}

function loop(images, time) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "difference";
    for (let i = 0; i < people.length; i++) {
        people[i].update(images);
    }
    hue++;
    ctx.globalCompositeOperation = "hue";
    ctx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
    ctx.fillRect(0, 0, size, size);
    delta = time - last_time;
    last_time = time;
    requestAnimationFrame((t) => {
        loop(images, t);
    });
}

function hospital(images) {
    console.info(Math.floor(1000 / delta) + " images/seconde");
    if (delta < 60) {
        count++;
    } else if (count > 1) {
        count--;
    }

    if (people.length > count) {
        for (let i = 0; i < people.length; i++) {
            if (people[i].isDead()) {
                people.splice(i, 1);
                return;
            }
        }
    } else {
        for (let i = 0; i < people.length; i++) {
            if (people[i].isDead()) {
                people[i] = new Person(images);
                return;
            }
        }
        if (people.length < count) {
            const person = new Person(images);
            people.push(person);
            return;
        }
    }
}

loadData()
    .then(loadImages)
    .then(
        function (images) {
            hospital(images);
            window.setInterval(hospital, 4000, images);
            let last_time = performance.now();
            loop(images, last_time);
        }
        /*, function (err) {
            console.error("Something went wrong: " + err);
        }*/
    );
