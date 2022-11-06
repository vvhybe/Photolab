const display = document.querySelector("display");
const editor = document.querySelector("editor");
const saveBtn = document.querySelector("[save]");

// Elements:
const Brightness = document.querySelector("[brightness]");
const Contrast = document.querySelector("[contrast]");
const Sturation = document.querySelector("[sturation]");
const Invert = document.querySelector("[invert]");

const Filters = ["brightness", "contrast", "sturation", "hue", "blur", "grayscale", "sepia", "invert"];

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", {willReadFrequently: true});
let w = canvas.width;
let h = canvas.height;



const img = new Image();
let imgData = null;
let originalpxs = null;
let currentpxs = null;

const localImg = localStorage.getItem("imgsrc");

let imgName = "image";
let download = "image/png";

initEditor();
if(localImg){
    img.src = localImg;
    drawImage(img);
    editor.setAttribute("on", "");
}else{
    defaultState();
}

canvas.addEventListener("dragover", e=>{ dragImage(e) });
canvas.addEventListener("dragleave", ()=>{ display.style.border = "none" });
canvas.addEventListener("drop", e=>{ dropImage(e) });
canvas.addEventListener("contextmenu", e=>{
    e.stopPropagation();
    e.preventDefault();
});

Brightness.addEventListener("change", e=>{
    console.log("inpt BR direction: ", Brightness.style.direction);
    brightness(e.target.valueAsNumber);
    // commitChanges();
    // runFilters()
})

Contrast.addEventListener("change", e=>{
    contrast(e.target.valueAsNumber);
    // commitChanges();
    // runFilters()
})

Sturation.addEventListener("change", e=>{
    sturation(e.target.valueAsNumber);
    // commitChanges();
    // runFilters()
})



Invert.addEventListener("change", e=>{
    invert(e.target.valueAsNumber);
    // commitChanges();
    // runFilters()
})

saveBtn.addEventListener("click", save);

function initEditor(){
    Filters.forEach(filter => {
        const filterInpt = document.querySelector(`input[${filter}]`);
        const filterVal = document.querySelector(`input[${filter}] + [filval]`);
        filterInpt.style.backgroundSize = `${filterInpt.value}% 100%`;
        filterVal.value = filterInpt.value;
        filterInpt.addEventListener("input", ()=>{
            filterInpt.style.backgroundSize = `${filterInpt.value}% 100%`;
            filterVal.value = filterInpt.value;
        });
    })
}

function defaultState(){
    const placeholder = new Image();
    placeholder.src = "src/imgs/placeholder.png";
    placeholder.onload = ()=>{ drawImage(placeholder) };
}

function dragImage(e){
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    display.style.border = "2px dashed var(--color)";
}

function dropImage(e){
    e.stopPropagation();
    e.preventDefault();
    const IMG = e.dataTransfer.files[0];
    imgName = IMG.name.substr(0, IMG.name.indexOf('.'));
    download = IMG.type;
    console.log(download);
    const reader = new FileReader();
    reader.onload = ()=>{
        img.src = reader.result;
        localStorage.setItem("imgsrc", reader.result);
        drawImage(img);
    }
    reader.readAsDataURL(IMG);
    display.style.border = "none";
    editor.setAttribute("on", "");
}

function drawImage(img){
    ctx.clearRect(0, 0, w, h);
    img.onload = ()=>{
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        originalpxs = imgData.data.slice();
        // console.log(originalpxs);
    };
}

function runFilters(){
    const BRIGHTNESS = Brightness.valueAsNumber;
    const CONTRAST = Brightness.valueAsNumber;
    const INVERT = Brightness.valueAsNumber;

    currentpxs = originalpxs.slice();

    brightness(BRIGHTNESS);
    contrast(CONTRAST);
    invert(INVERT);
    commitChanges();
}


function commitChanges(){
    const data = imgData.data;
    for (let px = 0; px < data.length; px+=4) {
        data[px] = originalpxs[px];
        data[px+1] = originalpxs[px+1];
        data[px+2] = originalpxs[px+2];
    }
    ctx.putImageData(imgData, 0, 0);
}

/// filters algo: in every px val 
function brightness(val){
    const br = (val * 2) / 100;
    // console.log("Brightness: ", br);
    const data = imgData.data;
    // const data = originalpxs;

    for (let px = 0; px < data.length; px+=4) {
        if(br !== 0){
            data[px] *= br; //red
            data[px+1] *= br; //green
            data[px+2] *= br; //blue
        }else{
            data[px]  = originalpxs[px];
            data[px+1] = originalpxs[px+1];
            data[px+2] = originalpxs[px+2];
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

function contrast(val){
    const alpha = (val + 255) / 255;
    const data = imgData.data;
    // const data = originalpxs;
    for (let px = 0; px < data.length; px+=4) {
        if(val !== 0){
            data[px] = alpha * (data[px] - 128) + 128;
            data[px+1] = alpha * (data[px+1] - 128) + 128;
            data[px+2] = alpha * (data[px+2] - 128) + 128;
        }else{
            data[px]  = originalpxs[px];
            data[px+1] = originalpxs[px+1];
            data[px+2] = originalpxs[px+2];
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

function sturation(val){
    const sv  = (val * 2) / 100;
    const LR = 0.3086;  // constant to determine luminance of red. Similarly, for green and blue
    const LG = 0.6094;
    const LB = 0.0820;

    const srv = (1 - sv) * LR + sv;
    const sgv = (1 - sv) * LG + sv;
    const sbv = (1 - sv) * LB + sv;
    const rv = (1 - sv) * LR;
    const gv = (1 - sv) * LG;
    const bv = (1 - sv) * LB;

    const data = imgData.data;
    for (let px = 0; px < data.length; px+=4) {
        if(sv !== 0){
            data[px] = (data[px] * srv + data[px+1] * gv + data[px+2] * bv);
            data[px+1] = (data[px] * rv + data[px+1] * sgv + data[px+2] * bv);
            data[px+1] = (data[px] * rv + data[px+1] * gv + data[px+2] * sbv);
        }else{
            data[px]  = originalpxs[px];
            data[px+1] = originalpxs[px+1];
            data[px+2] = originalpxs[px+2];
        }
    }
    ctx.putImageData(imgData, 0, 0);

}

function hue(val){
    
}

function invert(val){
    const inv = (val * 255) / 100;
    // console.log("Invert: ",inv);
    const data = imgData.data;
    for (let px = 0; px < data.length; px+=4) {
        let r = originalpxs[px];
        let g = originalpxs[px+1];
        let b = originalpxs[px+2];
        if(inv !== 0){
            data[px] ^= inv; //red
            data[px+1] ^= inv; //green
            data[px+2] ^= inv; //blue
        }else{
            data[px] = r; //red
            data[px+1] = g; //green
            data[px+2] = b; //blue
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

function save(){
    const suffix = "YB";
    saveBtn.href = canvas.toDataURL(download);
    saveBtn.download = imgName +"-"+ suffix;
}

function validImage(img){
    const ImgTypes = ["image/bmp","image/gif","image/jpeg","image/pjpeg","image/png","image/svg+xml","image/webp","image/x-icon"];
    return ImgTypes.includes(img.type);
}

// function scaleImg(img){
//     // const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
//     // let x = (w / 2) - (img.naturalWidth / 2) * scale;
//     // let y = (h / 2) - (img.naturalHeight / 2) * scale;
//     // img.onload = ()=>{ ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale) };
// }
