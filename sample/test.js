function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}

function appendExample (index) {
  var filePath = '../test/src/test' + pad(index, 3) + '.svg'
  var container = document.createElement('div')
  document.body.appendChild(container)

  var image = new Image()
  container.appendChild(image)
  image.src = filePath

  var renderer = new PIXI.CanvasRenderer(400, 400, {
    antialias: true,
    backgroundColor: 0xFFFFFF
  });

  var request = new XMLHttpRequest();
  request.open('GET', filePath, true);
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      var graphics = new SVGGraphics(request.responseXML);
      container.appendChild(renderer.view)
      renderer.render(graphics);
    }
  };
  request.send(null);
}

window.onload = () => {
  for (let i = 1; i < 19; i++) {
    appendExample(i)
  }
}