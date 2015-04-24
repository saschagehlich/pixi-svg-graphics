/* eslint-disable */
window.onload = function () {
  // Create renderer and view
  var container = new PIXI.Container();
  var renderer = PIXI.autoDetectRenderer(810, 800, {
    antialias: true
  });
  document.body.appendChild(renderer.view);

  // Draw loop
  function draw() {
    container.scale.x = 10;
    container.scale.y = 10;

    renderer.render(container);
    requestAnimationFrame(draw);
  }

  $.get('vlight.svg', function (content) {
    var graphics = PIXI.Graphics.fromSVG(content);
    container.addChild(graphics);
  });

  // Run draw loop
  draw();
};
