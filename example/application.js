/* eslint-disable */
window.onload = function () {
  // Create renderer and view
  var container = new PIXI.Container();
  var renderer = PIXI.autoDetectRenderer(810, 800, {
    antialias: true
  });
  document.body.appendChild(renderer.view);
  var graphics = new PIXI.Graphics()
  graphics.scale.x = 10
  graphics.scale.y = 10
  container.addChild(graphics);

  $.get('vlight.svg', function (content) {
    SVGGraphics.drawSVG(graphics, content);
    renderer.render(container);
  });
};
