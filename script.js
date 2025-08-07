const upload = document.getElementById("upload");
const previewContainer = document.getElementById("previewContainer");
const downloadBtn = document.getElementById("downloadBtn");

let images = [];

upload.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  images = []; // Reset
  previewContainer.innerHTML = "";

  let loaded = 0;

  files.forEach((file, idx) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = function (evt) {
      img.onload = () => {
        images.push({ img, index: idx });
        loaded++;
        if (loaded === files.length) {
          renderAllPreviews();
          updateDownloadButton();
        }
      };
      img.src = evt.target.result;
    };

    reader.readAsDataURL(file);
  });
});

function getCurrentSettings() {
  const aspect = document.getElementById("aspectRatio").value;
  const [wRatio, hRatio] = aspect.split(":").map(Number);
  const borderPercent = parseFloat(document.getElementById("borderWidth").value);
  const borderStyle = document.getElementById("borderStyle").value;
  const exportSize = document.getElementById("exportSize").value;
  return { wRatio, hRatio, borderPercent, borderStyle, exportSize };
}

function renderAllPreviews() {
  previewContainer.innerHTML = "";

  const settings = getCurrentSettings();
  const baseSize = 2160;

  images.forEach(({ img, index }) => {
    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "flex justify-center items-center w-full h-full aspect-[1/1] bg-gray-500 border rounded overflow-hidden";

    const canvas = document.createElement("canvas");
    canvas.className = "max-w-[90%] max-h-[90%] object-contain";

    const ctx = canvas.getContext("2d");

    canvas.width = baseSize;
    canvas.height = (baseSize * settings.hRatio) / settings.wRatio;

    const borderSize = canvas.width * settings.borderPercent;

    ctx.fillStyle = settings.borderStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const maxWidth = canvas.width - 2 * borderSize;
    const maxHeight = canvas.height - 2 * borderSize;

    const imgRatio = img.width / img.height;
    const maxRatio = maxWidth / maxHeight;

    let imgWidth, imgHeight;
    if (imgRatio > maxRatio) {
      imgWidth = maxWidth;
      imgHeight = maxWidth / imgRatio;
    } else {
      imgHeight = maxHeight;
      imgWidth = maxHeight * imgRatio;
    }

    const x = (canvas.width - imgWidth) / 2;
    const y = (canvas.height - imgHeight) / 2;

    ctx.drawImage(img, x, y, imgWidth, imgHeight);

    canvas.dataset.index = index;
    canvasWrapper.appendChild(canvas);
    previewContainer.appendChild(canvasWrapper);
  });
}

function updateDownloadButton() {
  if (images.length === 1) {
    downloadBtn.textContent = "Download";
  } else {
    downloadBtn.textContent = "Download All";
  }
  downloadBtn.classList.remove("hidden");
}

downloadBtn.addEventListener("click", () => {
  if (images.length === 1) {
    downloadSingle();
  } else {
    downloadAllAsZip();
  }
});

function downloadSingle() {
  const canvas = previewContainer.querySelector("canvas");
  const exportCanvas = resizeCanvas(canvas);
  const link = document.createElement("a");
  link.download = `photo.jpg`;
  link.href = exportCanvas.toDataURL("image/jpeg", 0.85);
  link.click();
}

function downloadAllAsZip() {
  const zip = new JSZip();
  const tasks = [];

  previewContainer.querySelectorAll("canvas").forEach((canvas, idx) => {
    const exportCanvas = resizeCanvas(canvas);
    const dataUrl = exportCanvas.toDataURL("image/jpeg", 0.85);

    // Convert base64 to blob
    const base64 = dataUrl.split(",")[1];
    const byteString = atob(base64);
    const arrayBuffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }

    zip.file(`photo-${idx + 1}.jpg`, arrayBuffer, { binary: true });
  });

  zip.generateAsync({ type: "blob" }).then((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "photos.zip";
    link.click();
  });
}

function resizeCanvas(canvas) {
  const exportSize = document.getElementById("exportSize").value;
  let width = canvas.width;
  if (exportSize === "1080") width = 1080;
  if (exportSize === "2x") width *= 2;

  const ratio = canvas.height / canvas.width;
  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");

  exportCanvas.width = width;
  exportCanvas.height = width * ratio;

  exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
  return exportCanvas;
}

// Re-render on setting change
["aspectRatio", "borderWidth", "borderStyle"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    if (images.length > 0) {
      renderAllPreviews();
    }
  });
});
