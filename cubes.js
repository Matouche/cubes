const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d", { alpha: false });
const size = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width = size;

let people = [];
let count = 1;
let hue = 0;
let last_time = 0;
let delta = 0;
let loaded = 0;

function loading() {
    const total = lastStep(1) + lastStep(2) + lastStep(3) + lastStep (4) + 4;
    const percent = loaded / total * 100;
    if (percent < 99) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, size, size);
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 1 - loaded / total;
        ctx.fillText("Chargement ("+ Math.floor(percent) +"%)", size / 2, size / 2);
        requestAnimationFrame(loading);
        ctx.globalAlpha = 1;
    }
    else {
        ctx.globalAlpha = 1;
    }
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

function loadImages() {
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = function () {
                loaded +=1;
                resolve(img);
            };
            img.onerror = img.onabort = function () {
                reject(src);
            };
            img.src = src;
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

loading();

loadImages().then(
    function (images) {
        hospital(images);
        window.setInterval(hospital, 4000, images);
        let last_time = performance.now();
        loop(images, last_time);
    },
    function (err) {
        console.error("Something went wrong (Err2)");
    }
);
