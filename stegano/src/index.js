const fs = require("fs");
const png = require('pngjs').PNG;

const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const MESSAGE = "Hello world? 🥹";

console.log("My humble Steganography Encoder/decoder");
console.log("---------------------------------------");
console.log("1 — Encode\n2 — Decode");
console.log("Type \"1\" or \"2\" >");

rl.on('line', (input) => {
    scenario = parseInt(input.trim());
    rl.close();
});

rl.on('close', main);

function main() {

    switch (scenario) {
        case 1:
            {
                // Load PNG file
                const loadedPNG = png.sync.read(fs.readFileSync('image.png'));

                // Modifying the image
                loadedPNG.data = encodeData(loadedPNG.data, MESSAGE);

                const options = { colorType: loadedPNG.colorType };
                const outputBuffer = png.sync.write(loadedPNG, options);

                // Write PNG file
                fs.writeFileSync('image-out.png', outputBuffer);
                console.log("Message encoded:", MESSAGE);
            }
            break;

        case 2:
            {
                // Load PNG file
                const loadedPNG = png.sync.read(fs.readFileSync('image-out.png'));

                // Decode message from the image
                console.log("Decoded message:", decodeData(loadedPNG.data));
            }
            break;

        default:
            console.log("Command is not recognized");
            break;
    }
}

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

function encodeData(data, message) {
    const buffer = message.split("").reduce((binaryMask, currentChar) => {
        // Convert each character to Unicode and breakdown it by 2-bits pieces
        const charCode = currentChar.codePointAt(0);
        let codedChar = [];

        for (let index = 0; index < 8; index++) {
            codedChar.push((charCode & (0b1100000000000000 >> index * 2)) >> (7 - index) * 2);
        }
        binaryMask.push(...codedChar);

        return binaryMask;
    }, [])


    return data.map((value, index) => {
        // Turn off two minor bits of every pixel color in every channel 
        let newValue = value & 0b11111100;

        // and put there message bits instead
        if (index < buffer.length + 1) {
            newValue = newValue | buffer[index];
        }

        return newValue;
    });
}

function decodeData(data) {
    let message = "";

    // Iterating over pixels in groups of 8. 8 pixel hides 16 bits of a message character.
    for (let index = 0; index < data.length; index += 8) {
        let decodedCharCode = 0;

        // Iterating over 8 pixels to decode 2 bits from each
        for (let mIndex = 0; mIndex < 8; mIndex++) {
            let charCodePart = data[index + mIndex] & 0b11;

            // Shifting decoded data to recover orignial character code
            decodedCharCode = decodedCharCode | charCodePart << ((7 - mIndex) * 2)
        }

        message += String.fromCodePoint(decodedCharCode);
    }

    return message;
}