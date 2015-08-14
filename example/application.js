/* eslint-disable */
window.onload = function () {
  // Create renderer and view
  var container = new PIXI.Container();
  var renderer = PIXI.autoDetectRenderer(810, 800, {
    antialias: true,
    backgroundColor: 0x000000
  });
  document.body.appendChild(renderer.view);
  var graphics = new PIXI.Graphics()
  graphics.scale.x = 10
  graphics.scale.y = 10
  container.addChild(graphics);

  var request = new XMLHttpRequest();
  request.open('GET', 'vlight.svg', true);
  request.onreadystatechange = function () {
      if (request.readyState == 4) {
          SVGGraphics.drawSVG(graphics, request.responseXML);
          renderer.render(container);
      }
  };
  request.send(null);

};
