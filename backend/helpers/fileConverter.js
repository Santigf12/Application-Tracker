const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const convertFile = async (filePath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject(new Error(`Error: File not found - ${filePath}`));
        }

        const outputFilePath = filePath.replace(/\.\w+$/, '.pdf');

        //Run LibreOffice CLI command
        const command = `soffice --headless --convert-to pdf "${filePath}" --outdir "${path.dirname(filePath)}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('LibreOffice conversion error:', stderr);
                return reject(error);
            }

            if (!fs.existsSync(outputFilePath)) {
                return reject(new Error("Conversion failed: Output PDF not found."));
            }

            console.log(`Successfully converted: ${outputFilePath}`);
            resolve(outputFilePath);
        });
    });
};


module.exports = convertFile;