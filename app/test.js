const imgloader = document.querySelector("input[imgloader]");
const loader = document.querySelector("[loader]");
const display = document.querySelector("display");
const editor = document.querySelector("editor");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const Brightness = document.querySelector(`input[brightness]`);
const Invert = document.querySelector(`input[inversion]`);
imgloader.addEventListener("change", ()=>{ workSpaceImgs(imgloader.files) });

let Imgs = [];


// Brightness.addEventListener("change", (e)=>{
//     // filter + input + img
//     e.target.style.backgroundSize = `${e.target.value}% 100%`;
//     brightness(e.target.valueAsNumber);
//     // drawImage(document.querySelector("photo").children[0]);
// })
Invert.addEventListener("input", (e)=>{
    // filter + input + img
    e.target.style.backgroundSize = `${(e.target.valueAsNumber * 100)/ 255}% 100%`;
    // invert(e.target.valueAsNumber);
    invert(127);
    console.log(e.target.valueAsNumber);
    // drawImage(document.querySelector("photo").children[0]);
})

function workSpaceImgs(imgs){
    // let localStorageImgs = [];
    if(imgs.length > 0){
        for (const img of imgs) {
            const Freader = new FileReader();
            /// creat the workspace Elmnt:
            const Photo = document.createElement("photo");
            const Img = document.createElement("img");
            if(validImage(img)){
                Freader.onload = ()=>{
                    // localStorageImgs.push(Freader.result);
                    Img.src = Freader.result;
                    Imgs.push(Img);
                    // drawImage(Img);
                    // localStorage.setItem("imgs",  JSON.stringify(Object.assign({}, localStorageImgs)));
                    // drawImage(Imgs[Imgs.length - 1])
                }
                Freader.readAsDataURL(img);
                Photo.appendChild(Img);
                loader.appendChild(Photo);
                displayTargetImg(Photo);
            }
        }
    }
}



function drawImage(img){
    canvas.height = img.naturalHeight;
    canvas.width = img.naturalWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    // invert(255);
    // pixelate();
}

function displayTargetImg(photo){
    photo.addEventListener("click", ()=>{
        drawImage(photo.children[0]);
        // invert();
        // grayscale();
        // brightness();
        console.log(photo.children[0]);
    })
}


function invert(val){
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let px = 0; px < data.length; px+=4) {
        data[px] = val - data[px]; // red
        data[px + 1] = val - data[px + 1]; // green
        data[px + 2] = val - data[px + 2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);

}

function grayscale(){
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let px = 0; px < data.length; px+=4) {
        const avg = (data[px] + data[px + 1] + data[px + 2]) / 3;
        data[px] = avg; // red
        data[px + 1] = avg; // green
        data[px + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
}

function brightness(val){
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let px = 0; px < data.length; px+=4) {
        data[px] += 255 * (val / 100); // red
        data[px + 1] += 255 * (val / 100); // green
        data[px + 2] += 255 * (val / 100); // blue
    }
    ctx.putImageData(imageData, 0, 0);
    console.log(imageData);
}
