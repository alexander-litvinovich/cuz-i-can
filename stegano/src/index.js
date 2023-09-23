const { log } = require("console");
const fs = require("fs");
const png = require('pngjs').PNG;

// Load PNG file
const loadedPNG = png.sync.read(fs.readFileSync('image.png'));
log("Metadata:", loadedPNG);

// Modifying the image
loadedPNG.data = invertImage(loadedPNG.data);

// Write PNG file
const options = { colorType: loadedPNG.colorType };
const outputBuffer = png.sync.write(loadedPNG, options);

fs.writeFileSync('image-out.png', outputBuffer);

// Functions

// Function to invert pixel values
function invertImage(data) {
    const invertedData = data.map((value, index) => {
        let newValue;

        if (index % 4 !== 3) newValue = 255 - value;
        else newValue = value;

        return newValue;
    })

    return invertedData;
}