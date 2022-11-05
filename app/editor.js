const display = document.querySelector("display");
const editor = document.querySelector("editor");
const saveBtn = document.querySelector("[save]");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let w = canvas.width;
let h = canvas.height;
const img = new Image();
let imgName = "image";

const dfltState = defaultState();

console.log("default ImgData: ",dfltState);

canvas.addEventListener("dragover", e=>{ dragImage(e) });
canvas.addEventListener("dragleave", e=>{ display.style.border = "none" });
canvas.addEventListener("drop", e=>{ dropImage(e) });

saveBtn.addEventListener("click", ()=>{
    save();
    console.log("ImgData: ",ctx.getImageData(0, 0, w, h));
})

function defaultState(){
    const placeholder = new Image();
    placeholder.src = "src/imgs/placeholder.png";
    placeholder.onload = ()=>{ drawImage(placeholder) };
    return ctx.getImageData(0, 0, w, h);
}


function dragImage(e){
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    display.style.border = "2px dashed var(--color)";
    console.log("image draged");
}

function dropImage(e){
    e.stopPropagation();
    e.preventDefault();
    const img = new Image();
    const IMG = e.dataTransfer.files[0];
    imgName = IMG.name.substr(0, IMG.name.indexOf('.'));
    const reader = new FileReader();
    reader.onload = ()=>{
        img.src = reader.result;
        drawImage(img);
        console.log("image dropped");
    }
    reader.readAsDataURL(IMG);
    display.style.border = "none";
    editor.setAttribute("on", "");
}

function drawImage(img){
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);
    // img.onload = ()=>{ ctx.drawImage(img, 0, 0) };
    console.log(img);
}


function save(){
    const suffix = "YB";
    saveBtn.href = canvas.toDataURL("image/png");
    saveBtn.download = imgName +"-"+ suffix;
}