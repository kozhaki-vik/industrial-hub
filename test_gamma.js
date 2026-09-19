import koffi from 'koffi';
const gdi32 = koffi.load('gdi32.dll');

const CreateDCA = gdi32.func('void* CreateDCA(str lpszDriver, str lpszDevice, str lpszOutput, void* lpInitData)');
const DeleteDC = gdi32.func('bool DeleteDC(void* hdc)');
const SetDeviceGammaRamp = gdi32.func('bool SetDeviceGammaRamp(void* hdc, void* lpRamp)');

function setGamma(gammaLevel) {
    const ramp = Buffer.alloc(1536);

    for (let i = 1; i < 256; i++) {
        const value = Math.min(65535, Math.floor(Math.pow(i / 255.0, 1.0 / gammaLevel) * 65535.0 + 0.5));
        ramp.writeUInt16LE(value, i * 2);
        ramp.writeUInt16LE(value, 512 + i * 2);
        ramp.writeUInt16LE(value, 1024 + i * 2);
    }

    const hdc = CreateDCA("DISPLAY", "\\\\.\\DISPLAY1", null, null);
    if (!hdc) {
        console.log("Failed CreateDC");
        return;
    }
    const res = SetDeviceGammaRamp(hdc, ramp);
    console.log("SetDeviceGammaRamp res:", res);
    DeleteDC(hdc);
}

console.log("Setting to 2.0");
setGamma(2.0);
setTimeout(() => {
    console.log("Resetting to 1.0");
    setGamma(1.0);
}, 2000);
