/* eslint-disable */
window.onload = function () {
  // Create renderer and view
  var container = new PIXI.Container();
  var renderer = PIXI.autoDetectRenderer(810, 800, {
    antialias: true
  });
  document.body.appendChild(renderer.view);

  $.get('vlight.svg', function (content) {
    var graphics = PIXI.Graphics.fromSVG(content);
    container.addChild(graphics);

    graphics.scale.x = 10
    graphics.scale.y = 10

    renderer.render(container);
  });
};
