const display = document.querySelector("display");
const editor = document.querySelector("editor");
const saveBtn = document.querySelector("[save]");

/** Filter Inputs **/
// filter range input:
const Brightness = document.querySelector("[brightness]");
const Contrast = document.querySelector("[contrast]");
const Saturation = document.querySelector("[saturation]");
const Invert = document.querySelector("[invert]");

// filter num input for precice use:
const BrightnessVal = document.querySelector("[brightness] + [filval]");
const ContrastVal = document.querySelector("[contrast] + [filval]");
const SaturationVal = document.querySelector("[saturation] + [filval]");
const InvertVal = document.querySelector("[invert] + [filval]");

const Filters = {brightness: 50, contrast: 50, saturation: 50, hue: 0, blur:0, grayscale:0, sepia:0, invert:0};

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


// applaying filter using range inputs:
Brightness.onchange = runFilters;
Contrast.onchange = runFilters;
Saturation.onchange = runFilters;
Invert.onchange = runFilters;

// applaying filter using number inputs:
BrightnessVal.onchange = runFilters;
ContrastVal.onchange = runFilters;
SaturationVal.onchange = runFilters;
InvertVal.onchange = runFilters;

// downloading the edited Image:
saveBtn.addEventListener("click", save);

function initEditor(){
    const filters = Object.keys(Filters);
    filters.forEach(filter => {
        const filterInpt = document.querySelector(`input[${filter}]`);
        const filterVal = document.querySelector(`input[${filter}] + [filval]`);
        filterInpt.style.backgroundSize = `${Filters[filter]}% 100%`;
        filterInpt.value = Filters[filter];
        filterVal.value = Filters[filter];
        filterInpt.addEventListener("input", e=>{
            filterInpt.style.backgroundSize = `${e.target.value}% 100%`;
            filterVal.value = e.target.value;
        });
        filterVal.addEventListener("input", e=>{
            filterInpt.style.backgroundSize = `${e.target.value}% 100%`;
            filterInpt.value = e.target.value;
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
    initEditor();
    const IMG = e.dataTransfer.files[0];
    if(!validImage(IMG)) return;
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
    };
}

function runFilters(){
    currentpxs = originalpxs.slice();

    const BRIGHTNESS = Brightness.valueAsNumber;
    const CONTRAST = Contrast.valueAsNumber;
    const INVERT = Invert.valueAsNumber;
    const SATURATION = Saturation.valueAsNumber;

    // loop over every px in the img WxH -> x,y;
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            brightness(x, y, BRIGHTNESS);
            contrast(x, y, CONTRAST);
            saturation(x, y, SATURATION);
            if(INVERT > 0){
                invert(x, y, INVERT);
            }
        };
    }

    commitChanges();
}


function commitChanges(){
    const datapx = imgData.data;
    for (let px = 0; px < datapx.length; px+=4) {
        datapx[px] = currentpxs[px];
        datapx[px+1] = currentpxs[px+1];
        datapx[px+2] = currentpxs[px+2];
    }
    ctx.putImageData(imgData, 0, 0);
}

/** Filter effects in every px val of img**/

// The image is stored as a 1d array with rgba value red then green then blue and last is alpha;
const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;

function brightness(x, y, val){
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const bright = (val * 2) / 100;

    currentpxs[ridx] = clamp(bright * currentpxs[ridx]);
    currentpxs[gidx] = clamp(bright * currentpxs[gidx]);
    currentpxs[bidx] = clamp(bright * currentpxs[bidx]);
}

function contrast(x, y, val){
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const alpha = (val + 255) / 255;

    currentpxs[ridx] = clamp(alpha * (currentpxs[ridx] - 128) + 128);
    currentpxs[gidx] = clamp(alpha * (currentpxs[gidx] - 128) + 128);
    currentpxs[bidx] = clamp(alpha * (currentpxs[bidx] - 128) + 128);
}

function saturation(x, y, val){
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const sv  = (val * 2.23) / 100;
    // constant to determine luminance of red. Similarly, for green and blue
    const LR = 0.3086;  
    const LG = 0.6094;
    const LB = 0.0820;

    const srv = (1 - sv) * LR + sv;
    const sgv = (1 - sv) * LG + sv;
    const sbv = (1 - sv) * LB + sv;
    const rv = (1 - sv) * LR;
    const gv = (1 - sv) * LG;
    const bv = (1 - sv) * LB;

    currentpxs[ridx] = clamp(currentpxs[ridx] * srv + currentpxs[gidx]  * gv + currentpxs[bidx] * bv);
    currentpxs[gidx] = clamp(currentpxs[ridx] * rv + currentpxs[gidx]  * sgv + currentpxs[bidx] * bv);
    currentpxs[bidx] = clamp(currentpxs[ridx] * rv + currentpxs[gidx]  * gv + currentpxs[bidx] * sbv);
}

function hue(val){

}

function invert(x, y, val){
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const inv = (val * 255) / 100;

    currentpxs[ridx] = clamp(inv - currentpxs[ridx]); //red
    currentpxs[gidx] = clamp(inv - currentpxs[gidx]); //green
    currentpxs[bidx] = clamp(inv - currentpxs[bidx]); //blue  
}

function indexPX(x,y){
    return (x + y * img.width) * 4;
}

function clamp(val){
    return Math.max(0, Math.min(Math.floor(val), 255))
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