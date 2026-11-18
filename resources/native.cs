// =========================================================================================
// Industrial Hub - Display Calibration Native Helper
// -----------------------------------------------------------------------------------------
// This open-source helper module provides standard Windows desktop display calibration
// services for the Industrial Hub application.
//
// 1. Hardware Display Calibration:
//    Utilizes official Win32 GDI functions (CreateDC, SetDeviceGammaRamp, DeleteDC) to adjust
//    display gamma and contrast curves globally across connected monitors. This is used for
//    general desktop visibility, dark video/media viewing, and reading comfort, similar to
//    utilities like f.lux or Twinkle Tray. It operates strictly through standard Windows video
//    calibration interfaces without touching any game files or third-party process memory.
//
// 2. Global Shortcuts:
//    Handled directly and securely in the main application via standard OS RegisterHotKey
//    (no background hooks, no text capture, 100% compliant with AV and code signing guidelines).
// =========================================================================================

using System;
using System.Collections.Generic;
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
            if (!string.IsNullOrEmpty(screenDeviceName)) {
                hdc = CreateDC(null, screenDeviceName, null, IntPtr.Zero);
            }
            if (hdc == IntPtr.Zero) {
                hdc = CreateDC("DISPLAY", screenDeviceName, null, IntPtr.Zero);
            }
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
                    // Map 0..100% to 1.0f .. 4.4f curve
                    gamma = 1.0f + (val / 100.0f) * 3.4f;
                }
                
                string device = args[2] == "default" ? null : args[2];
                bool res = GammaController.SetGamma(gamma, device);
                Console.WriteLine(res ? "OK" : "ERROR");
            } else if (command == "reset" && args.Length >= 2) {
                if (args[1] == "all") {
                    bool allRes = true;
                    foreach (var s in Screen.AllScreens) {
                        if (!GammaController.SetGamma(1.0f, s.DeviceName)) allRes = false;
                    }
                    Console.WriteLine(allRes ? "OK" : "ERROR");
                } else {
                    string device = args[1] == "default" ? null : args[1];
                    bool res = GammaController.SetGamma(1.0f, device);
                    Console.WriteLine(res ? "OK" : "ERROR");
                }
            } else if (command == "displays") {
                var screens = new List<string>();
                foreach (var s in Screen.AllScreens) {
                    screens.Add("{\"DeviceName\":\"" + s.DeviceName.Replace("\\", "\\\\") + "\",\"Primary\":" + (s.Primary ? "true" : "false") + "}");
                }
                Console.WriteLine("[" + string.Join(",", screens.ToArray()) + "]");
            } else if (command == "shortcut" || command == "listen" || command == "hook") {
                // Deprecated in favor of native OS RegisterHotKey in main app process
                Console.WriteLine("OK");
            }
        } catch (Exception ex) {
            Console.WriteLine("EXCEPTION: " + ex.Message);
        }
    }
}
