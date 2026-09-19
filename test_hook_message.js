const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
    const win = new BrowserWindow();
    win.hookWindowMessage(0x00A1, function() {
        console.log("Arguments:", arguments.length);
        console.log("Arg 0:", arguments[0]);
        console.log("Arg 1:", arguments[1]);
        app.quit();
    });
    // simulate message
    setTimeout(() => {
        // Just print out
        console.log("Please click the title bar...");
    }, 1000);
});
