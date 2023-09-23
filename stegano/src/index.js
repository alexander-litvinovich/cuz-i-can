const { log } = require("console");
const fs = require("fs");
const png = require('pngjs').PNG;

// Load PNG file
const loadedPNG = png.sync.read(fs.readFileSync('image.png'));
log("Metadata:", loadedPNG);

// Write PNG file
const options = { colorType: loadedPNG.colorType };
const outputBuffer = png.sync.write(data, options);

fs.writeFileSync('image-out.png', outputBuffer);
