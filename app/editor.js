const display = document.querySelector("display");
const editor = document.querySelector("editor");
const resetBtn = document.querySelector("[reset-filters]");
const saveBtn = document.querySelector("[save]");

/** Filter Inputs **/
// filter range input:
const Brightness = document.querySelector("[brightness]");
const Contrast = document.querySelector("[contrast]");
const Saturation = document.querySelector("[saturation]");
const Grayscale = document.querySelector("[grayscale]");
const Sepia = document.querySelector("[sepia]");
const Invert = document.querySelector("[invert]");
const Swap = document.querySelector("[swap]");
const Reflect = document.querySelector("[reflect]");
/// getting RGB channels Inputs:
const Red = document.querySelector("[red]");
const Green = document.querySelector("[green]");
const Blue = document.querySelector("[blue]");

// filter num input for precise use:
const BrightnessVal = document.querySelector("[brightness] + [filval]");
const ContrastVal = document.querySelector("[contrast] + [filval]");
const SaturationVal = document.querySelector("[saturation] + [filval]");
const GrayscaleVal = document.querySelector("[grayscale] + [filval]");
const SepiaVal = document.querySelector("[sepia] + [filval]");
const InvertVal = document.querySelector("[invert] + [filval]");
const SwapVal = document.querySelector("[swap] + [filval]");
const ReflectVal = document.querySelector("[reflect] + [filval]");
/// getting RGB channels Inputs for precise use:
const RedVal = document.querySelector("[red] + [filval]");
const GreenVal = document.querySelector("[green] + [filval]");
const BlueVal = document.querySelector("[blue] + [filval]");

// init the default values for the filters in js obj;
// or we use the pre-asigned values to the localStorage
const Filters = { brightness: 50, contrast: 50, saturation: 50, grayscale: 0, sepia: 0, invert: 0, swap: 0, reflect: 0, red: 0, green: 0, blue: 0 };
const localFilters = JSON.parse(localStorage.getItem("Filters"));

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let w = canvas.width;
let h = canvas.height;


const img = new Image();
let imgData = null;
let originalpxs = null;
let currentpxs = null;

// return the img data src from localstorage if we set it;
const localImgDataSrc = localStorage.getItem("imgDataSrc");
const localOriginalImgDataSrc = localStorage.getItem("originalImgDataSrc");
const edited = localStorage.getItem("imgedited");

// obj for downloading the img:
const download = JSON.parse(localStorage.getItem("download")) || { name: "image", type: "image/png" };

// init the editor values by the local saved iput value or by deafult, 
//and draw localstorage img datasrc if exist draw the edited version or the standared version if not draw the placeholder img;
initEditor(localFilters || Filters);
if (localImgDataSrc) {
    img.src = localImgDataSrc;
    drawImage(img);
    editor.setAttribute("on", "");
} else {
    defaultState();
}

canvas.addEventListener("dragover", e => { dragImage(e) });
canvas.addEventListener("drop", e => { dropImage(e) });
canvas.addEventListener("contextmenu", e => {
    e.stopPropagation();
    e.preventDefault();
});


// applaying filter using range inputs:
Brightness.onchange = runFilters;
Contrast.onchange = runFilters;
Saturation.onchange = runFilters;
Grayscale.onchange = runFilters;
Sepia.onchange = runFilters;
Invert.onchange = runFilters;
Swap.onchange = runFilters;
Reflect.onchange = runFilters;
Red.onchange = runFilters;
Green.onchange = runFilters;
Blue.onchange = runFilters;

// applaying filter using number inputs:
BrightnessVal.onchange = runFilters;
ContrastVal.onchange = runFilters;
SaturationVal.onchange = runFilters;
GrayscaleVal.onchange = runFilters;
SepiaVal.onchange = runFilters;
InvertVal.onchange = runFilters;
SwapVal.onchange = runFilters;
ReflectVal.onchange = runFilters;
RedVal.onchange = runFilters;
GreenVal.onchange = runFilters;
BlueVal.onchange = runFilters;

// downloading the edited Image:
saveBtn.addEventListener("click", save);
// reset the filters and the editor:
resetBtn.addEventListener("click", reset);

function initEditor(Filters) {
    const filters = Object.keys(Filters);
    filters.forEach(filter => {
        const filterInpt = document.querySelector(`input[${filter}]`);
        const filterVal = document.querySelector(`input[${filter}] + [filval]`);
        filterInpt.style.backgroundSize = `${Filters[filter]}% 100%`;
        filterInpt.value = Filters[filter];
        filterVal.value = Filters[filter];
        // filter range grabbing effect;
        filterInpt.addEventListener("input", e => {
            filterInpt.style.backgroundSize = `${e.target.value}% 100%`;
            filterVal.value = e.target.value;
            Filters[filter] = e.target.valueAsNumber;
            localStorage.setItem("Filters", JSON.stringify(Filters));
        });
        filterVal.addEventListener("input", e => {
            filterInpt.style.backgroundSize = `${e.target.value}% 100%`;
            filterInpt.value = e.target.value;
            Filters[filter] = e.target.valueAsNumber;
            localStorage.setItem("Filters", JSON.stringify(Filters));
        });
    })
}

// running the default display for the first time, and for the empty workspase
function defaultState() {
    const placeholder = new Image();
    placeholder.src = "src/imgs/placeholder.png";
    drawImage(placeholder);
    display.style.border = "2px dashed var(--color)";
}

// visualise the draggine img event by blue border
function dragImage(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    display.style.border = "2px dashed var(--color)";
}

// draw the droped img and store 2 copies in localstorage one for reset other for the edited values;
function dropImage(e) {
    e.stopPropagation();
    e.preventDefault();
    display.style.border = "none";
    initEditor(Filters);
    localStorage.setItem("Filters", JSON.stringify(Filters));
    const IMG = e.dataTransfer.files[0];
    // if not supported img exit the programme: and alert the user;
    if (!validImage(IMG)) {
        alert(`this type of Image [${IMG.type}] not supported! 😓😥`);
        return;
    }
    // the download setting to download the input img with the same type and name we input it;
    download.name = IMG.name.substr(0, IMG.name.indexOf('.'));
    download.type = IMG.type;
    localStorage.setItem("download", JSON.stringify(download));
    const reader = new FileReader();
    reader.onload = () => {
        img.src = reader.result;
        reasonableSize(reader.result);
        drawImage(img);
    }

    reader.readAsDataURL(IMG);
    display.style.border = "none";
    editor.setAttribute("on", "");
}

function drawImage(img) {
    ctx.clearRect(0, 0, w, h);
    img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
    };
    getOriginalImgData();
}

// retrive the original imgdata;
function getOriginalImgData() {
    const img = new Image();
    img.src = localOriginalImgDataSrc;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        originalpxs = imgData.data.slice();
    };
}

function runFilters() {
    currentpxs = originalpxs.slice();

    const BRIGHTNESS = Brightness.valueAsNumber;
    const CONTRAST = Contrast.valueAsNumber;
    const SATURATION = Saturation.valueAsNumber;
    const GRAYSCALE = Grayscale.valueAsNumber;
    const SEPIA = Sepia.valueAsNumber;
    const INVERT = Invert.valueAsNumber;
    const SWAP = Swap.valueAsNumber;
    const REFLECT = Reflect.valueAsNumber;
    const RED = Red.valueAsNumber;
    const GREEN = Green.valueAsNumber;
    const BLUE = Blue.valueAsNumber;

    // loop over every px in the img WxH -> x,y;
    // and applay filter for every px;
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            (BRIGHTNESS > 0) ? brightness(x, y, BRIGHTNESS) : null;
            (CONTRAST > 0) ? contrast(x, y, CONTRAST) : null;
            (SATURATION > 0) ? saturation(x, y, SATURATION) : null;
            (GRAYSCALE > 0) ? grayscale(x, y, GRAYSCALE) : null;
            (SEPIA > 0) ? sepia(x, y, SEPIA) : null;
            (INVERT > 0) ? invert(x, y, INVERT) : null;
            (SWAP > 0) ? swap(x, y, SWAP) : null;
            (REFLECT > 0) ? reflect(x, y, REFLECT) : null;
            (RED > 0) ? red(x, y, RED) : null;
            (GREEN > 0) ? green(x, y, GREEN) : null;
            (BLUE > 0) ? blue(x, y, BLUE) : null;
        };
    }

    // commiting the changes for every px to the imgData; 
    commitChanges();
    localsave();
}


function commitChanges() {
    // ctx.clearRect(0, 0, w, h);
    const datapx = imgData.data;
    for (let px = 0; px < datapx.length; px += 4) {
        datapx[px] = currentpxs[px];
        datapx[px + 1] = currentpxs[px + 1];
        datapx[px + 2] = currentpxs[px + 2];
    }
    ctx.putImageData(imgData, 0, 0);
}

function save() {
    const suffix = "PL";
    saveBtn.href = canvas.toDataURL(download.type);
    saveBtn.download = download.name + "-" + suffix;
}

/// to save every edit we do to the img and prevent it from losing; 
function localsave() {
    const editedImgData = canvas.toDataURL(download);
    localStorage.setItem("imgDataSrc", editedImgData);
}

// reset the filters and also the editor input values and the localstorage for svaed edits;
function reset() {
    const Filters = { brightness: 50, contrast: 50, saturation: 50, grayscale: 0, sepia: 0, invert: 0, swap: 0, reflect: 0, red: 0, green: 0, blue: 0 };
    img.src = localOriginalImgDataSrc;
    drawImage(img);
    localStorage.setItem("imgDataSrc", localOriginalImgDataSrc);
    localStorage.setItem("Filters", JSON.stringify(Filters));
    initEditor(Filters);
}

/** Filter effects in every px val of img**/

// The image is stored as a 1d array with rgba value red then green then blue and last is alpha;
const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;
const A_OFFSET = 3;

function brightness(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const bright = (val * 2) / 100;

    currentpxs[ridx] = clamp(bright * currentpxs[ridx]);
    currentpxs[gidx] = clamp(bright * currentpxs[gidx]);
    currentpxs[bidx] = clamp(bright * currentpxs[bidx]);
}

function contrast(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const gama = (val + 255) / 255;

    currentpxs[ridx] = clamp(gama * (currentpxs[ridx] - 128) + 128);
    currentpxs[gidx] = clamp(gama * (currentpxs[gidx] - 128) + 128);
    currentpxs[bidx] = clamp(gama * (currentpxs[bidx] - 128) + 128);
}

// manipulate the aplha channel by increasse or decreasse;
function opacity(x, y, val) {
    const aidx = indexPX(x, y) + A_OFFSET;

    const alpha = clamp((val * 255) / 100);

    currentpxs[aidx] = alpha;
}

function saturation(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const sv = (val * 2) / 100;
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

    currentpxs[ridx] = clamp(currentpxs[ridx] * srv + currentpxs[gidx] * gv + currentpxs[bidx] * bv);
    currentpxs[gidx] = clamp(currentpxs[ridx] * rv + currentpxs[gidx] * sgv + currentpxs[bidx] * bv);
    currentpxs[bidx] = clamp(currentpxs[ridx] * rv + currentpxs[gidx] * gv + currentpxs[bidx] * sbv);
}


// in the grayscale function i'll stick with the luma (ITU-R) recommendation formula  (BT.709, specifically):
// Gray = (Red * 0.2126 + Green * 0.7152 + Blue * 0.0722)
// not the avg algorithme:
// Gray = (Red + Green + Blue) / 3
function grayscale(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const grv = (val * 0.2126) / 100;
    const ggv = (val * 0.7152) / 100;
    const gbv = (val * 0.0722) / 100;

    const gray = (currentpxs[ridx] * grv) + (currentpxs[gidx] * ggv) + (currentpxs[bidx] * gbv);

    currentpxs[ridx] = clamp(gray);
    currentpxs[gidx] = clamp(gray);
    currentpxs[bidx] = clamp(gray);
}

// Sepia Algorithm:
//  newRed =   0.393*R + 0.769*G + 0.189*B
//  newGreen = 0.349*R + 0.686*G + 0.168*B
//  newBlue =  0.272*R + 0.534*G + 0.131*B
function sepia(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const Rr = (val * 0.393) / 100;
    const Rg = (val * 0.769) / 100;
    const Rb = (val * 0.189) / 100;

    const Gr = (val * 0.349) / 100;
    const Gg = (val * 0.686) / 100;
    const Gb = (val * 0.168) / 100;

    const Br = (val * 0.272) / 100;
    const Bg = (val * 0.534) / 100;
    const Bb = (val * 0.131) / 100;

    currentpxs[ridx] = clamp(currentpxs[ridx] * Rr) + (currentpxs[gidx] * Rg) + (currentpxs[bidx] * Rb);
    currentpxs[gidx] = clamp(currentpxs[ridx] * Gr) + (currentpxs[gidx] * Gg) + (currentpxs[bidx] * Gb);
    currentpxs[bidx] = clamp(currentpxs[ridx] * Br) + (currentpxs[gidx] * Bg) + (currentpxs[bidx] * Bb);
}

// swaping or rotating RGB values is a filter that i try, swap red by green, green by blue, blue by red;
// r = g;
// g = b;
// b = t;
function swap(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    let temp = clamp((val * currentpxs[ridx]) / 100);
    currentpxs[ridx] = clamp((val * currentpxs[gidx]) / 100);
    currentpxs[gidx] = clamp((val * currentpxs[bidx]) / 100);
    currentpxs[bidx] = temp;
}

/// reflect is a filter i made baisicaly if the invert but in a swap way;
// r = 255 - g;  g = 255 - b;  b = 255 - r;
function reflect(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const rfl = (val * 255) / 100;

    let temp = clamp(rfl - currentpxs[ridx]);
    currentpxs[ridx] = clamp(rfl - currentpxs[gidx]);
    currentpxs[gidx] = clamp(rfl - currentpxs[bidx]);
    currentpxs[bidx] = temp;
}

// inverting the rgb value for every px data
// by subtracting 255 from every rgbpx value
// r = 255 - r;  g = 255 - g;  b = 255 - b;
function invert(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;
    const gidx = indexPX(x, y) + G_OFFSET;
    const bidx = indexPX(x, y) + B_OFFSET;

    const inv = (val * 255) / 100;

    currentpxs[ridx] = clamp(inv - currentpxs[ridx]); //red
    currentpxs[gidx] = clamp(inv - currentpxs[gidx]); //green
    currentpxs[bidx] = clamp(inv - currentpxs[bidx]); //blue  
}

/// manpulating the value of the rgb channels 
function red(x, y, val) {
    const ridx = indexPX(x, y) + R_OFFSET;

    const rv = clamp((val * 255) / 100);

    currentpxs[ridx] += rv;
}

function green(x, y, val) {
    const gidx = indexPX(x, y) + G_OFFSET;

    const gv = clamp((val * 255) / 100);

    currentpxs[gidx] += gv;
}

function blue(x, y, val) {
    const bidx = indexPX(x, y) + B_OFFSET;

    const bv = clamp((val * 255) / 100);

    currentpxs[bidx] += bv;
}
/// getting the index for px in the imgdata
function indexPX(x, y) {
    return (x + y * img.width) * 4;
}

/// clamping the value to prevent the overflow by controled to be [0-255] the allowd rgb values;
function clamp(val) {
    return Math.max(0, Math.min(Math.floor(val), 255))
}

function reasonableSize(datasrc) {
    try {
        localStorage.setItem("imgDataSrc", datasrc);
        localStorage.setItem("originalImgDataSrc", datasrc);
    } catch {
        console.warn("This image it too big to stored in localStorage!");
        alert("⚠️ This image it too big, it can't be saved or restored after you refresh the page 👀, but the previous image will restored instead 🧑🏻‍💻!");
    }
}

function validImage(img) {
    const ImgTypes = ["image/bmp", "image/gif", "image/jpeg", "image/pjpeg", "image/png", "image/svg+xml", "image/webp", "image/x-icon"];
    return ImgTypes.includes(img.type);
}