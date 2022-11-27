rgbToHex = rgb => {
  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (rgb && rgb.length === 4) ? "#" +
   ("0" + parseInt(rgb[1],10).toString(16)).slice(-2).toUpperCase() +
   ("0" + parseInt(rgb[2],10).toString(16)).slice(-2).toUpperCase() +
   ("0" + parseInt(rgb[3],10).toString(16)).slice(-2).toUpperCase() : '';
}

createFrequencyArray = (arr) => {
  const res = [];
  arr.forEach(el => {
    if (!arr[el]) {
      arr[el] = [el, 0];
      res.push(arr[el])
    };
    arr[el][1]++;
  });
  return res;
};

function sortFunction(a, b) {
  if (a[1] === b[1])
    return 0;
  else
    return (a[1] < b[1]) ? -1 : 1;
}

checkIfPixelIsEmpty = (ctx, x, y, w, h) => {
  let idata = ctx.getImageData(x, y, w, h),      // needed as usual ...
  u32 = new Uint32Array(idata.data.buffer),  // reads 1x uint32 instead of 4x uint8
  i = 0, len = u32.length;

  while(i < len) 
    if (u32[i++]) return false;     // if !== 0 return false, not empty
  return true                                    // all empty, all OK
}

loadImage = (ev, id) => {
  let reader = new FileReader();

  reader.onloadend = (e) => {
    document.querySelector(id).src = e.target.result;
  };
  reader.readAsDataURL(ev.target.files[0]);
}

readImageToArray = (imagePixels, ctx) => {
  for (let i = 0; i < imagePixels.length; i++) {
    for (let j = 0; j < imagePixels[0].length; j++) {
      if (!checkIfPixelIsEmpty(ctx, i, j, 1, 1)) {
        let imageData = ctx.getImageData(i, j, 1, 1);
        imagePixels[i][j] = rgbToHex(`rgba(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}, ${imageData.data[3] / 255})`);
      }
    }
  }
}

drawImageFromArray = (imagePixels, ctx, side) => {
  // ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  for (let i = 0; i < imagePixels.length; i++) {
    for (let j = 0; j < imagePixels[0].length; j++) {
      if (imagePixels[i][j] != "none") {
        ctx.fillStyle = imagePixels[i][j];
        ctx.fillRect(side * i, side * j, side, side);
      }
    }
  }
}

showColor = (e, ctx, arr) => {
  let color = e.value.toUpperCase();
  let imagePixels2 = arr.map(row => {
    let row2 = row.map(v => {
      if (v.toLowerCase() === color.toLowerCase())
        return "red";
      else
        return v;
    })
    return row2;
  });
  drawImageFromArray(imagePixels2, ctx, ctx.canvas.clientWidth / imagePixels2.length);
}

backToInitImage = (ctx, arr) => {
  drawImageFromArray(arr, ctx, ctx.canvas.clientWidth / arr.length);
}

changeImage = (e, ctx, arr) => {
  let pixels = [];
  for (let i = 0; i < e.parentElement.parentElement.parentElement.childNodes.length; i++) {
    let color1 = e.parentElement.parentElement.parentElement.childNodes[i].childNodes[1].childNodes[0].value.toLowerCase();
    let color2 = e.parentElement.parentElement.parentElement.childNodes[i].childNodes[5].childNodes[0].value.toLowerCase();
    pixels.push({ color1, color2 })
  }
  imagePixels2 = arr.map(row => {
    let row2 = row.map(v => {
      let result = pixels.findIndex(x => x.color1 === v.toLowerCase());
      if (result != -1)
        return pixels[result].color2;
      else
        return v;
    })
    return row2;
  })
  drawImageFromArray(imagePixels2, ctx, ctx.canvas.clientWidth / arr.length);
  frequencyArray2 = [...[].concat.apply([], imagePixels2).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()).entries()];
}

addColorToUI = (index, color, color2, frequencyN, frequencyF) => {
  let tr = document.createElement("tr");
  let tds = [];

  for (let i = 0; i < 6; i++) 
    tds.push(document.createElement("td"));

  let no = document.createElement("p");
  no.innerHTML = index;

  let input = document.createElement("input");
  input.type = "color";
  input.setAttribute("value", color);
  input.setAttribute("class", color + "Input");
  input.setAttribute("onmouseover", "showColor(this, ctxInput, imagePixels)");
  input.setAttribute("onmouseout", "backToInitImage(ctxInput, imagePixels)");

  let colorHex = document.createElement("div");
  colorHex.setAttribute("class", "colorHex");
  colorHex.innerHTML = color;

  let colorFrequencyN = document.createElement("div");
  colorFrequencyN.setAttribute("class", "colorFrequencyN");
  colorFrequencyN.innerHTML = frequencyN;

  let colorFrequencyF = document.createElement("div");
  colorFrequencyF.setAttribute("class", "colorFrequencyF");
  colorFrequencyF.innerHTML = frequencyF;

  let arrow = document.createElement("p");
  arrow.innerHTML = "→";

  let output = document.createElement("input");
  output.type = "color";
  output.setAttribute("value", color2);
  output.setAttribute("class", color2 + "Output");
  output.setAttribute("onmouseover", "showColor(this, ctxOutput, imagePixels2)");
  output.setAttribute("onmouseout", "backToInitImage(ctxOutput, imagePixels2)") 
  output.setAttribute("onchange", "changeImage(this, ctxOutput, imagePixels)");

  tds[0].appendChild( no );
  tds[1].appendChild( input );
  // tds[2].appendChild( colorHex );
  tds[2].appendChild( colorFrequencyN );
  tds[3].appendChild( colorFrequencyF );
  tds[4].appendChild( arrow );
  tds[5].appendChild( output );

  for (let i = 0; i < 6; i++)
    tr.appendChild( tds[i] );

  return tr;
}

let cvInput = document.querySelector("#cvInput");
let cvInputHidden = document.querySelector("#cvInputHidden");
cvInputHidden.width = 16;
cvInputHidden.height = 16;
let ctxInput = cvInput.getContext("2d");
let ctxInputHidden = cvInputHidden.getContext("2d");

let cvOutput = document.querySelector("#cvOutput");
let cvOutputHidden = document.querySelector("#cvOutputHidden");
let ctxOutput = cvOutput.getContext("2d");
let ctxOutputHidden = cvOutputHidden.getContext("2d");
let imagePixels;
let imagePixels2;
let frequencyArray;
let frequencyArray2;
let side = 40;

document.querySelector("#inpCvInput").addEventListener('change', e => {
  loadImage(e, "#imgInput");
})

document.querySelector("#imgInput").addEventListener('load', e => {
  let width = e.path[0].width;
  let height = e.path[0].height;
  imagePixels = [...Array(height)].map(e => Array(width).fill("none"))

  ctxInputHidden.drawImage(document.querySelector("#imgInput"), 0, 0);
  readImageToArray(imagePixels, ctxInputHidden);

  imagePixels2 = JSON.parse(JSON.stringify(imagePixels));

  drawImageFromArray(imagePixels, ctxInput, cvInput.width / imagePixels.length);
  drawImageFromArray(imagePixels2, ctxOutput, cvOutput.width / imagePixels.length);
  
  frequencyArray = [...[].concat.apply([], imagePixels).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()).entries()];
  frequencyArray2 = [...[].concat.apply([], imagePixels2).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()).entries()];

  console.log(frequencyArray);
  console.log(frequencyArray2);

  document.querySelector("#cvInputHidden").style.display = "none";
  document.querySelector("#imgInput").style.display = "none";

  tbody.textContent = '';
  for (let i = 0; i < frequencyArray.length; i++)
    tbody.appendChild(addColorToUI(i + 1, frequencyArray[i][0], frequencyArray2[i][0], frequencyArray[i][1], `${(frequencyArray[i][1] / [].concat.apply([], imagePixels).length * 100).toFixed(2)}%` ));
})

document.querySelector("#sortColorRatio").addEventListener('click', e => {
  frequencyArray.sort(sortFunction);
  frequencyArray2.sort(sortFunction);
  tbody.textContent = '';
  for (let i = 0; i < frequencyArray.length; i++)
    tbody.appendChild(addColorToUI(i + 1, frequencyArray[i][0], frequencyArray2[i][0], frequencyArray[i][1], `${(frequencyArray[i][1] / [].concat.apply([], imagePixels).length * 100).toFixed(2)}%` ));
})

document.querySelector("#download").addEventListener('click', () => {
  drawImageFromArray(imagePixels2, ctxOutputHidden, cvOutputHidden.width / imagePixels.length);
  document.querySelector("#ctxOutputHidden").style.display = "none";
  let link = document.createElement('a');
  link.download = 'filename.png';
  link.href = document.querySelector('#cvOutputHidden').toDataURL();
  link.click();
})
