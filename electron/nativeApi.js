import koffi from 'koffi';
import os from 'os';

let gdi32, user32;
let CreateDCA, DeleteDC, SetDeviceGammaRamp;
let RegisterHotKey, UnregisterHotKey;
let EnumDisplayDevicesA;

if (os.platform() === 'win32') {
  gdi32 = koffi.load('gdi32.dll');
  user32 = koffi.load('user32.dll');

  CreateDCA = gdi32.func('void* CreateDCA(str lpszDriver, str lpszDevice, str lpszOutput, void* lpInitData)');
  DeleteDC = gdi32.func('bool DeleteDC(void* hdc)');
  SetDeviceGammaRamp = gdi32.func('bool SetDeviceGammaRamp(void* hdc, void* lpRamp)');

  RegisterHotKey = user32.func('bool RegisterHotKey(void* hWnd, int id, uint32 fsModifiers, uint32 vk)');
  UnregisterHotKey = user32.func('bool UnregisterHotKey(void* hWnd, int id)');
  EnumDisplayDevicesA = user32.func('bool EnumDisplayDevicesA(str lpDevice, uint32 iDevNum, void* lpDisplayDevice, uint32 dwFlags)');
}

export function setGamma(gammaLevel, deviceName = "\\\\.\\DISPLAY1") {
  if (os.platform() !== 'win32') return false;
  if (gammaLevel <= 0) gammaLevel = 1.0;

  const ramp = Buffer.alloc(1536);
  for (let i = 1; i < 256; i++) {
    let value = Math.pow(i / 255.0, 1.0 / gammaLevel) * 65535.0 + 0.5;
    value = Math.min(65535, Math.floor(value));
    ramp.writeUInt16LE(value, i * 2);
    ramp.writeUInt16LE(value, 512 + i * 2);
    ramp.writeUInt16LE(value, 1024 + i * 2);
  }

  let targetDevice = deviceName;
  if (!targetDevice || targetDevice === 'default') {
    targetDevice = "\\\\.\\DISPLAY1";
  }

  const hdc = CreateDCA("DISPLAY", targetDevice, null, null);
  if (!hdc) {
    const fallbackHdc = CreateDCA("DISPLAY", null, null, null);
    if (!fallbackHdc) return false;
    const res = SetDeviceGammaRamp(fallbackHdc, ramp);
    DeleteDC(fallbackHdc);
    return res;
  }

  const res = SetDeviceGammaRamp(hdc, ramp);
  DeleteDC(hdc);
  return res;
}

export function registerGlobalHotkey(hwndBuffer, hotkeyId, vkCode) {
  if (os.platform() !== 'win32') return false;
  return RegisterHotKey(hwndBuffer, hotkeyId, 0, vkCode);
}

export function unregisterGlobalHotkey(hwndBuffer, hotkeyId) {
  if (os.platform() !== 'win32') return false;
  return UnregisterHotKey(hwndBuffer, hotkeyId);
}

let _getDisplaysImpl;
if (os.platform() === 'win32') {
  _getDisplaysImpl = function() {
    const displays = [];
    let devNum = 0;
    while (true) {
      const buf = Buffer.alloc(424);
      buf.writeUInt32LE(424, 0); // cb
      
      const res = EnumDisplayDevicesA(null, devNum, buf, 0);
      if (!res) break;
      
      const DISPLAY_DEVICE_ACTIVE = 0x00000001;
      const DISPLAY_DEVICE_MIRRORING_DRIVER = 0x00000008;
      
      const stateFlags = buf.readUInt32LE(164);
      
      if ((stateFlags & DISPLAY_DEVICE_ACTIVE) && !(stateFlags & DISPLAY_DEVICE_MIRRORING_DRIVER)) {
         let name = buf.toString('ascii', 4, 36).replace(/\0/g, '');
         displays.push(name);
      }
      devNum++;
    }
    return displays;
  };
} else {
  _getDisplaysImpl = function() {
    return [];
  };
}

export const getDisplays = _getDisplaysImpl;
