using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class GammaController {
    [DllImport("gdi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateDC(string lpszDriver, string lpszDevice, string lpszOutput, IntPtr lpInitData);
    
    [DllImport("gdi32.dll")]
    private static extern bool DeleteDC(IntPtr hdc);

    [DllImport("gdi32.dll")]
    private static extern bool SetDeviceGammaRamp(IntPtr hdc, ref RAMP lpRamp);
    
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public struct RAMP {
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
        public ushort[] Red;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
        public ushort[] Green;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256)]
        public ushort[] Blue;
    }

    public static bool SetGamma(float gamma, string screenDeviceName) {
        if (string.IsNullOrEmpty(screenDeviceName) || screenDeviceName == "default") {
            try {
                screenDeviceName = Screen.PrimaryScreen.DeviceName;
            } catch {
                screenDeviceName = "\\\\.\\DISPLAY1";
            }
        }
        if (gamma <= 0) gamma = 1.0f;
        var ramp = new RAMP { Red = new ushort[256], Green = new ushort[256], Blue = new ushort[256] };
        for (int i = 1; i < 256; i++) {
            double value = Math.Min(65535, Math.Pow(i / 255.0, 1.0 / gamma) * 65535.0 + 0.5);
            ramp.Red[i] = ramp.Green[i] = ramp.Blue[i] = (ushort)value;
        }
        IntPtr hdc = IntPtr.Zero;
        bool success = false;
        try {
            hdc = CreateDC("DISPLAY", screenDeviceName, null, IntPtr.Zero);
            if (hdc == IntPtr.Zero) {
                hdc = CreateDC("DISPLAY", null, null, IntPtr.Zero);
            }
            if (hdc != IntPtr.Zero) {
                success = SetDeviceGammaRamp(hdc, ref ramp);
            }
        } finally {
            if (hdc != IntPtr.Zero) DeleteDC(hdc);
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

public class Program {
    public static void Main(string[] args) {
        if (args.Length == 0) return;
        string command = args[0];
        
        try {
            if (command == "gamma" && args.Length >= 3) {
                float val = 0;
                float.TryParse(args[1], System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out val);
                
                float gamma = 1.0f;
                if (val <= 0) {
                    gamma = 1.0f;
                } else if (val <= 10.0f) {
                    gamma = val;
                } else {
                    // Map 0..100% to 1.0f .. 4.4f curve from Electric Guide
                    gamma = 1.0f + (val / 100.0f) * 3.4f;
                }
                
                string device = args[2] == "default" ? null : args[2];
                bool res = GammaController.SetGamma(gamma, device);
                Console.WriteLine(res ? "OK" : "ERROR");
            } else if (command == "reset" && args.Length >= 2) {
                string device = args[1] == "default" ? null : args[1];
                bool res = GammaController.SetGamma(1.0f, device);
                Console.WriteLine(res ? "OK" : "ERROR");
            } else if (command == "displays") {
                var screens = new List<string>();
                foreach (var s in Screen.AllScreens) {
                    screens.Add("{\"DeviceName\":\"" + s.DeviceName.Replace("\\", "\\\\") + "\",\"Primary\":" + (s.Primary ? "true" : "false") + "}");
                }
                Console.WriteLine("[" + string.Join(",", screens.ToArray()) + "]");
            } else if (command == "hook" && args.Length >= 2) {
                int vkCode = int.Parse(args[1]);
                KeyboardHook.Start(vkCode);
            }
        } catch (Exception ex) {
            Console.WriteLine("EXCEPTION: " + ex.Message);
        }
    }
}
