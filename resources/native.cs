using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class GammaController {
    [DllImport("gdi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern IntPtr CreateDC(string lpszDriver, string lpszDevice, string lpszOutput, IntPtr lpInitData);
    
    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool DeleteDC(IntPtr hdc);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr GetDC(IntPtr hWnd);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool SetDeviceGammaRamp(IntPtr hdc, ref RAMP lpRamp);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool GetDeviceGammaRamp(IntPtr hdc, ref RAMP lpRamp);
    
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public struct RAMP {
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
        public UInt16[] Red;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
        public UInt16[] Green;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
        public UInt16[] Blue;
    }

    private static Dictionary<string, RAMP> _originalRamps = new Dictionary<string, RAMP>();

    private static IntPtr GetDisplayDC(string deviceName) {
        IntPtr hdc = IntPtr.Zero;
        if (!string.IsNullOrEmpty(deviceName)) {
            // Method 1: CreateDC("DISPLAY", deviceName, ...)
            hdc = CreateDC("DISPLAY", deviceName, null, IntPtr.Zero);
            // Method 2: CreateDC(null, deviceName, ...)
            if (hdc == IntPtr.Zero) {
                hdc = CreateDC(null, deviceName, null, IntPtr.Zero);
            }
            // Method 3: CreateDC(deviceName, null, ...)
            if (hdc == IntPtr.Zero) {
                hdc = CreateDC(deviceName, null, null, IntPtr.Zero);
            }
        }
        // Fallback: Primary display DC
        if (hdc == IntPtr.Zero) {
            hdc = CreateDC("DISPLAY", null, null, IntPtr.Zero);
        }
        if (hdc == IntPtr.Zero) {
            hdc = GetDC(IntPtr.Zero);
        }
        return hdc;
    }

    private static void ReleaseDisplayDC(IntPtr hdc) {
        if (hdc != IntPtr.Zero) {
            DeleteDC(hdc);
            ReleaseDC(IntPtr.Zero, hdc);
        }
    }

    public static void SaveGamma(string deviceName) {
        if (string.IsNullOrEmpty(deviceName)) deviceName = "\\\\.\\DISPLAY1";
        if (_originalRamps.ContainsKey(deviceName)) return;
        
        IntPtr dc = GetDisplayDC(deviceName);
        if (dc != IntPtr.Zero) {
            try {
                RAMP ramp = new RAMP();
                ramp.Red = new UInt16[256];
                ramp.Green = new UInt16[256];
                ramp.Blue = new UInt16[256];
                if (GetDeviceGammaRamp(dc, ref ramp)) {
                    _originalRamps[deviceName] = ramp;
                }
            } finally {
                ReleaseDisplayDC(dc);
            }
        }
    }

    public static bool SetGamma(int level, string deviceName) {
        if (string.IsNullOrEmpty(deviceName)) deviceName = "\\\\.\\DISPLAY1";

        // If level is 0 or 128, treat as "Day" / Reset to original profile
        if (level <= 0 || level == 128) {
            if (_originalRamps.ContainsKey(deviceName)) {
                RAMP orig = _originalRamps[deviceName];
                return ApplyRampToAllMatching(deviceName, ref orig);
            } else {
                RAMP ramp = new RAMP();
                ramp.Red = new UInt16[256];
                ramp.Green = new UInt16[256];
                ramp.Blue = new UInt16[256];
                for (int i = 0; i < 256; i++) {
                    int val = i * 257;
                    if (val > 65535) val = 65535;
                    ramp.Red[i] = ramp.Green[i] = ramp.Blue[i] = (UInt16)val;
                }
                return ApplyRampToAllMatching(deviceName, ref ramp);
            }
        }

        // Night Vision Gamma Calculation (level is 1..100)
        RAMP newRamp = new RAMP();
        newRamp.Red = new UInt16[256];
        newRamp.Green = new UInt16[256];
        newRamp.Blue = new UInt16[256];
        
        // Map 1..100 to gamma curve 1.20 to 2.80
        double gamma = 1.0 + (level / 100.0) * 1.8;
        
        for (int i = 0; i < 256; i++) {
            double v = i / 255.0;
            double corrected = Math.Pow(v, 1.0 / gamma);
            int val = (int)(corrected * 65535.0);
            if (val > 65535) val = 65535;
            if (val < 0) val = 0;
            newRamp.Red[i] = newRamp.Green[i] = newRamp.Blue[i] = (UInt16)val;
        }
        
        return ApplyRampToAllMatching(deviceName, ref newRamp);
    }

    private static bool ApplyRampToAllMatching(string deviceName, ref RAMP ramp) {
        bool success = false;
        
        // 1. Try targeted DC
        IntPtr dc = GetDisplayDC(deviceName);
        if (dc != IntPtr.Zero) {
            try {
                if (SetDeviceGammaRamp(dc, ref ramp)) {
                    success = true;
                }
            } finally {
                ReleaseDisplayDC(dc);
            }
        }

        // 2. Also try global DC from GetDC(0) to ensure full screen coverage
        IntPtr primaryDc = GetDC(IntPtr.Zero);
        if (primaryDc != IntPtr.Zero) {
            try {
                if (SetDeviceGammaRamp(primaryDc, ref ramp)) {
                    success = true;
                }
            } finally {
                ReleaseDC(IntPtr.Zero, primaryDc);
            }
        }

        return success;
    }
}

public class KeyboardHook {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_SYSKEYDOWN = 0x0104;
    private static LowLevelKeyboardProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    private static int _targetKeyCode = 0;

    public static void Start(int vkCode) {
        _targetKeyCode = vkCode;
        _hookID = SetHook(_proc);
        Application.Run();
    }

    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    private static IntPtr SetHook(LowLevelKeyboardProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN)) {
            int vkCode = Marshal.ReadInt32(lParam);
            if (vkCode == _targetKeyCode) {
                Console.WriteLine("HOTKEY_PRESSED");
            }
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);
}
