const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let img = new Image();
let border = 20;

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    img.onload = () => drawImage();
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

function drawImage() {
  const aspect = document.getElementById("aspectRatio").value;
  const [wRatio, hRatio] = aspect.split(":").map(Number);
  const size = 500; // you can scale this dynamically later
  canvas.width = size;
  canvas.height = (size * hRatio) / wRatio;

  border = parseInt(document.getElementById("borderWidth").value);

  ctx.fillStyle = document.getElementById("borderStyle").value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imgWidth = canvas.width - border * 2;
  const imgHeight = canvas.height - border * 2;

  ctx.drawImage(img, border, border, imgWidth, imgHeight);
};

document.getElementById("exportBtn").addEventListener("click", () => {
  const link = document.createElement('a');
  link.download = 'bordered-image.png';
  link.href = canvas.toDataURL();
  link.click();
});

const exportSize = document.getElementById("exportSize").value;
let exportWidth = canvas.width;

if (exportSize === "instagram") exportWidth = 1080;
else if (exportSize === "2x") exportWidth *= 2;
// if original, keep canvas.width

// then use canvas.toDataURL() after resizing canvas
