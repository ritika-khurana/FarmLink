const fs = require('fs');
const path = require('path');

const buildFolder = path.resolve(__dirname, '../build/contracts');
const destFolder = path.resolve(__dirname, '../client/src/contracts');

// Ensure destination directory exists
if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
}

// Copy contract artifacts
fs.readdirSync(buildFolder).forEach(file => {
    if (file.endsWith('.json')) {
        fs.copyFileSync(
            path.join(buildFolder, file),
            path.join(destFolder, file)
        );
        console.log(`Copied ${file} to client/src/contracts/`);
    }
});