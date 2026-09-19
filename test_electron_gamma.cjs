const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const nativeApi = await import('./electron/nativeApi.js');
        console.log('Displays:', nativeApi.getDisplays());
        console.log('Setting gamma to 2.0...');
        const res1 = nativeApi.setGamma(2.0, "\\\\.\\DISPLAY1");
        console.log('Set gamma res1:', res1);
        setTimeout(() => {
            console.log('Resetting gamma...');
            const res2 = nativeApi.setGamma(1.0, "\\\\.\\DISPLAY1");
            console.log('Reset gamma res2:', res2);
            app.quit();
        }, 2000);
    } catch(e) {
        console.error("Error:", e);
        app.quit();
    }
});
