const { app, BrowserWindow } = require('electron');
app.whenReady().then(async () => {
    try {
        const koffi = require('koffi');
        const user32 = koffi.load('user32.dll');
        const RegisterHotKey = user32.func('bool RegisterHotKey(void* hWnd, int id, uint32 fsModifiers, uint32 vk)');
        
        const win = new BrowserWindow();
        const hwnd = win.getNativeWindowHandle();
        
        // Wait, koffi allows pointer extraction?
        const ptr = koffi.address(hwnd); // Wait, no, hwnd is a Buffer.
        
        // Let's try BigInt
        // In koffi, passing an integer to a pointer type? No, Koffi might reject it.
        // Let's try it:
        const success = RegisterHotKey(hwnd.readBigUInt64LE(0), 1, 0, 0x41); 
        console.log("RegisterHotKey with void* + BigInt success:", success);
        app.quit();
    } catch(e) {
        console.error(e);
        app.quit();
    }
});
