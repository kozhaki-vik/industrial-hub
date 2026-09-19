import koffi from 'koffi';
import os from 'os';

let gdi32, user32;
let CreateDCA, DeleteDC, SetDeviceGammaRamp;
let RegisterHotKey, UnregisterHotKey;

let RAMP;

if (os.platform() === 'win32') {
  gdi32 = koffi.load('gdi32.dll');
  user32 = koffi.load('user32.dll');

  RAMP = koffi.pack('RAMP', {
    Red: koffi.array('uint16', 256),
    Green: koffi.array('uint16', 256),
    Blue: koffi.array('uint16', 256)
  });

  CreateDCA = gdi32.func('void* CreateDCA(str lpszDriver, str lpszDevice, str lpszOutput, void* lpInitData)');
  DeleteDC = gdi32.func('bool DeleteDC(void* hdc)');
  SetDeviceGammaRamp = gdi32.func('bool SetDeviceGammaRamp(void* hdc, RAMP* lpRamp)');

  RegisterHotKey = user32.func('bool RegisterHotKey(void* hWnd, int id, uint32 fsModifiers, uint32 vk)');
  UnregisterHotKey = user32.func('bool UnregisterHotKey(void* hWnd, int id)');
}

export function setGamma(gammaLevel, deviceName = "\\\\.\\DISPLAY1") {
  if (os.platform() !== 'win32') return false;
  if (gammaLevel <= 0) gammaLevel = 1.0;

  const ramp = {
    Red: new Array(256).fill(0),
    Green: new Array(256).fill(0),
    Blue: new Array(256).fill(0)
  };

  for (let i = 1; i < 256; i++) {
    let value = Math.pow(i / 255.0, 1.0 / gammaLevel) * 65535.0 + 0.5;
    value = Math.min(65535, Math.floor(value));
    ramp.Red[i] = value;
    ramp.Green[i] = value;
    ramp.Blue[i] = value;
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
  const DISPLAY_DEVICEA = koffi.pack('DISPLAY_DEVICEA', {
    cb: 'uint32',
    DeviceName: koffi.array('char', 32),
    DeviceString: koffi.array('char', 128),
    StateFlags: 'uint32',
    DeviceID: koffi.array('char', 128),
    DeviceKey: koffi.array('char', 128)
  });
  const EnumDisplayDevicesA = user32.func('bool EnumDisplayDevicesA(str lpDevice, uint32 iDevNum, DISPLAY_DEVICEA* lpDisplayDevice, uint32 dwFlags)');
  
  _getDisplaysImpl = function() {
    const displays = [];
    const dd = {
      cb: 424,
      DeviceName: new Array(32).fill(0),
      DeviceString: new Array(128).fill(0),
      StateFlags: 0,
      DeviceID: new Array(128).fill(0),
      DeviceKey: new Array(128).fill(0)
    };
    
    let devNum = 0;
    while (true) {
      dd.cb = 424;
      const res = EnumDisplayDevicesA(null, devNum, dd, 0);
      if (!res) break;
      
      const DISPLAY_DEVICE_ACTIVE = 0x00000001;
      const DISPLAY_DEVICE_MIRRORING_DRIVER = 0x00000008;
      
      if ((dd.StateFlags & DISPLAY_DEVICE_ACTIVE) && !(dd.StateFlags & DISPLAY_DEVICE_MIRRORING_DRIVER)) {
         let name = "";
         for (let i=0; i<32; i++) {
            if (dd.DeviceName[i] === 0) break;
            name += String.fromCharCode(dd.DeviceName[i]);
         }
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
