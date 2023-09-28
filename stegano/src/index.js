#! /usr/bin/env node

const fs = require("fs");
const png = require('pngjs').PNG;
const { program } = require('commander');

const HEADER_BIT_DEPTH_SIZE = 3;
const HEADER_SIZE_IN_BITS = 24;

const BIT_MASKS = {
    1: {
        eraser: 0b11111110,
        encoder: 0b1000000000000000,
        decoder: 0b1,
        groupLength: 16,
        chunkSize: 1,
        headerLength: HEADER_SIZE_IN_BITS,
        headerEncoder: 0b100000000000000000000000,
    },
    2: {
        eraser: 0b11111100,
        encoder: 0b1100000000000000,
        decoder: 0b11,
        groupLength: 8,
        chunkSize: 2,
        headerLength: HEADER_SIZE_IN_BITS / 2,
        headerEncoder: 0b110000000000000000000000,
    },
    3: {
        eraser: 0b11110000,
        encoder: 0b1111000000000000,
        decoder: 0b1111,
        groupLength: 4,
        chunkSize: 4,
        headerLength: HEADER_SIZE_IN_BITS / 4,
        headerEncoder: 0b111100000000000000000000,
    }
}

program
    .name('stegano')
    .description('My humble steganography utlity.\n\n📺 Subscribe to "Because I Can!" YouTube channel\nhttps://www.youtube.com/@cuz-i-can/')
    .version('0.1');

program
    .argument('<filename>', 'input file')
    .option('-o, --output <filename>', 'output file')
    .option('-i, --info', 'display file information')
    .option('-e, --encode <message>', 'encode the message')
    .option('-d, --decode', 'decode the message')
    .option('-b, --bitDepth [bitDepth]', 'bit depth (1-3) default 2, which is equal 2 bits per channel')
    .parse(process.argv);

const options = program.opts();
const filename = program.args[0] || false;

if (!fs.existsSync(filename)) {
    console.log(`File ${filename} not found`);
    return -1;
}

const loadedPNG = png.sync.read(fs.readFileSync(filename));

if (options.decode) {
    // Decode message from the image
    const header = decodeHeader(loadedPNG.data);
    const message = smartDecodeData(loadedPNG.data, header.messageLength, header.bitDepth);

    console.log("Decoded message:", message);
    return message;
}

else if (options.info) {
    console.log(options);
    const imageCapacities = {
        1: (loadedPNG.data.length * BIT_MASKS[1].chunkSize - HEADER_BIT_DEPTH_SIZE - HEADER_SIZE_IN_BITS) / 1000,
        2: (loadedPNG.data.length * BIT_MASKS[2].chunkSize - HEADER_BIT_DEPTH_SIZE - HEADER_SIZE_IN_BITS) / 1000,
        3: (loadedPNG.data.length * BIT_MASKS[3].chunkSize - HEADER_BIT_DEPTH_SIZE - HEADER_SIZE_IN_BITS) / 1000,
    };

    console.log(`Filename:   ${filename}`);
    console.log(`Dimensions: ${loadedPNG.width} x ${loadedPNG.height} px`);
    console.log(`Channels:   ${loadedPNG.data.length / loadedPNG.width / loadedPNG.height}`);
    console.log(` `);
    console.log(`Bit depth to image capacity in Unicode (16 bits) chars`);
    console.log(`-b 1 :      ${imageCapacities[1].toFixed(2)} chars (1 bit/channel)`);
    console.log(`-b 2 :      ${imageCapacities[2].toFixed(2)} chars (2 bits/channel)`);
    console.log(`-b 3 :      ${imageCapacities[3].toFixed(2)} chars (4 bits/channel)`);
    return;
}

else if (options.encode) {
    const bitDepth = parseInt(options.bitDepth) || 2;
    const header = encodeHeader(parseInt(bitDepth), options.encode.length);
    const imageCapacity = (loadedPNG.data.length * (BIT_MASKS[bitDepth].chunkSize) - HEADER_BIT_DEPTH_SIZE - HEADER_SIZE_IN_BITS) / 16;

    if (options.encode.length > imageCapacity) {
        console.log("Cannot encode message. Image capacity is smaller than the message length.");
        return -1;
    }

    if (bitDepth < 1 || bitDepth > 3) {
        console.log("Wrond bit depth is selected. Use -b 1, 2, or 3.");
        return -1;
    }

    loadedPNG.data = smartEncodeData(loadedPNG.data, header, options.encode, parseInt(bitDepth));

    const imageOutputOptions = { colorType: loadedPNG.colorType };
    const outputBuffer = png.sync.write(loadedPNG, imageOutputOptions);
    const outputFilename = options.output || `out_${filename}`;

    // Write PNG file
    fs.writeFileSync(outputFilename, outputBuffer);

    console.log(`The message encoded to "${outputFilename}".`);
    console.log(`The message is: "${options.encode}".`);
    return
}

function smartEncodeData(data, header, message, bitDepth) {

    const buffer = message.split("").reduce((binaryMask, currentChar) => {
        // Convert each character to Unicode and breakdown it by N-bits pieces
        const charCode = currentChar.codePointAt(0);
        let codedChar = [];

        for (let index = 0; index < BIT_MASKS[bitDepth].groupLength; index++) {
            codedChar.push((charCode & (BIT_MASKS[bitDepth].encoder >> index * BIT_MASKS[bitDepth].chunkSize)) >> (BIT_MASKS[bitDepth].groupLength - 1 - index) * BIT_MASKS[bitDepth].chunkSize);
        }
        binaryMask.push(...codedChar);
        return binaryMask;
    }, [...header]);

    return data.map((value, index) => {
        let newValue = value;
        if (index < buffer.length + 1) {
            // Turn off two minor bits of every pixel color in every channel 
            newValue = newValue & BIT_MASKS[bitDepth].eraser;
            // and put there message bits instead
            newValue = newValue | buffer[index];
        }

        return newValue;
    });
}

function smartDecodeData(data, messageLength, bitDepth) {
    let message = "";

    // Iterating over pixels in groups of 8. 8 pixel hides 16 bits of a message character.
    for (
        let index = HEADER_BIT_DEPTH_SIZE + BIT_MASKS[bitDepth].headerLength;
        index < HEADER_BIT_DEPTH_SIZE + BIT_MASKS[bitDepth].headerLength + messageLength * BIT_MASKS[bitDepth].groupLength;
        index += BIT_MASKS[bitDepth].groupLength) {

        let decodedCharCode = 0;

        // Iterating over 8 pixels to decode 2 bits from each
        for (let mIndex = 0; mIndex < BIT_MASKS[bitDepth].groupLength; mIndex++) {
            let charCodePart = data[index + mIndex] & BIT_MASKS[bitDepth].decoder;

            // Shifting decoded data to recover orignial character code
            decodedCharCode = decodedCharCode | charCodePart << ((BIT_MASKS[bitDepth].groupLength - 1 - mIndex) * BIT_MASKS[bitDepth].chunkSize)
        }

        message += String.fromCodePoint(decodedCharCode);
    }

    return message.trim();
}

/* 
    Header:
    3B |  6B  |  12B |  24 Bytes  
    123 456789 012345 678901234567
    ___ ________________________
     |   |
     |   + [3—27 bits] messageLength according to bitDepth, takes 6-24 bytes in the image
     |
     + [0-2 bits] bitDepth mode indicator, always takes 3 bytes in the image
*/

function encodeHeader(bitDepth, messageLength) {
    const header = [0, 0, 0].fill(1, 0, bitDepth);

    for (let index = 0; index < BIT_MASKS[bitDepth].headerLength; index++) {
        // Breakdown message length to chunks
        let chunk = (messageLength & (BIT_MASKS[bitDepth].headerEncoder >> (index * BIT_MASKS[bitDepth].chunkSize)))

        // Shift chunks to minor bits
        chunk = chunk >> (BIT_MASKS[bitDepth].headerLength - index - 1) * BIT_MASKS[bitDepth].chunkSize;

        header.push(chunk);
    }

    return header;
}

function decodeHeader(data) {
    // Get bit depth from the header
    const bitDepth = data.slice(0, HEADER_BIT_DEPTH_SIZE).reduce((total, value) => {
        return total += (value & BIT_MASKS[1].decoder);
    }, 0);

    messageLength = 0;
    for (let mIndex = 0; mIndex < BIT_MASKS[bitDepth].headerLength; mIndex++) {
        let chunk = data[HEADER_BIT_DEPTH_SIZE + mIndex] & BIT_MASKS[bitDepth].decoder;

        // Shifting decoded data to recover orignial message length
        messageLength = messageLength | chunk << ((BIT_MASKS[bitDepth].headerLength - 1 - mIndex) * BIT_MASKS[bitDepth].chunkSize);
    }

    return {
        bitDepth,
        messageLength
    }
}