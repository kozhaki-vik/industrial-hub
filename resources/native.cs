using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class GammaController {
    [DllImport("gdi32.dll", CharSet = CharSet.Unicode)]
    public static extern IntPtr CreateDC(string lpszDriver, string lpszDevice, string lpszOutput, IntPtr lpInitData);
    
    [DllImport("gdi32.dll")]
    public static extern bool SetDeviceGammaRamp(IntPtr hdc, ref RAMP lpRamp);

    [DllImport("gdi32.dll")]
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

    public static void SaveGamma(string deviceName) {
        if (_originalRamps.ContainsKey(deviceName)) return;
        IntPtr dc = CreateDC(deviceName, null, null, IntPtr.Zero);
        if (dc != IntPtr.Zero) {
            RAMP ramp = new RAMP();
            ramp.Red = new UInt16[256];
            ramp.Green = new UInt16[256];
            ramp.Blue = new UInt16[256];
            if (GetDeviceGammaRamp(dc, ref ramp)) {
                _originalRamps[deviceName] = ramp;
            }
        }
    }

    public static void SetGamma(int level, string deviceName) {
        IntPtr dc = CreateDC(deviceName, null, null, IntPtr.Zero);
        if (dc == IntPtr.Zero) return;

        if (level == 128) {
            if (_originalRamps.ContainsKey(deviceName)) {
                RAMP orig = _originalRamps[deviceName];
                SetDeviceGammaRamp(dc, ref orig);
            } else {
                RAMP ramp = new RAMP();
                ramp.Red = new UInt16[256];
                ramp.Green = new UInt16[256];
                ramp.Blue = new UInt16[256];
                for (int i = 0; i < 256; i++) {
                    int val = i * 257;
                    ramp.Red[i] = ramp.Green[i] = ramp.Blue[i] = (UInt16)val;
                }
                SetDeviceGammaRamp(dc, ref ramp);
            }
            return;
        }

        RAMP newRamp = new RAMP();
        newRamp.Red = new UInt16[256];
        newRamp.Green = new UInt16[256];
        newRamp.Blue = new UInt16[256];
        
        double gamma = 1.0 + (level / 100.0) * 1.8;
        
        for (int i = 0; i < 256; i++) {
            double v = i / 255.0;
            double corrected = Math.Pow(v, 1.0 / gamma);
            int val = (int)(corrected * 65535.0);
            if (val > 65535) val = 65535;
            if (val < 0) val = 0;
            newRamp.Red[i] = newRamp.Green[i] = newRamp.Blue[i] = (UInt16)val;
        }
        
        SetDeviceGammaRamp(dc, ref newRamp);
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
