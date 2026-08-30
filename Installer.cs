using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using System.Linq;

[assembly: AssemblyTitle("Industrial Hub Installer")]
[assembly: AssemblyDescription("Industrial Hub - Ultimate Rust helper application.")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("Industrial Systems Studio")]
[assembly: AssemblyProduct("Industrial Hub Installer")]
[assembly: AssemblyCopyright("Copyright © Kozhaki 2026. All rights reserved.")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]
[assembly: AssemblyVersion("2.0.0.0")]
[assembly: AssemblyFileVersion("2.0.0.0")]
[assembly: Guid("27f12386-bf77-4569-91b6-ae29d6b68c31")]
[assembly: ComVisible(false)]

namespace IndustrialHubLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            string exePath = Application.ExecutablePath;
            string tempPath = Path.GetTempPath();
            
            if (exePath.StartsWith(tempPath, StringComparison.OrdinalIgnoreCase) || exePath.Contains(".zip\\"))
            {
                MessageBox.Show("Пожалуйста, распакуйте ZIP-архив перед запуском Лаунчера!", "Ошибка запуска", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            Application.Run(new InstallerForm());
        }
    }

    public class InstallerForm : Form
    {
        private ProgressBar progressBar;
        private Label statusLabel;
        private string appDataPath;
        private string installPath;
        private string exeFilePath;
        private string serverVersion = "unknown";

        public InstallerForm()
        {
            this.Text = "Industrial Hub Installer";
            this.Size = new Size(420, 160);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.White;

            try { this.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }
            try { 
                ServicePointManager.SecurityProtocol = (SecurityProtocolType)12288 | (SecurityProtocolType)3072 | (SecurityProtocolType)768 | SecurityProtocolType.Tls; 
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
                ServicePointManager.Expect100Continue = false;
            } catch { }

            statusLabel = new Label();
            statusLabel.Text = "Запуск...";
            statusLabel.Location = new Point(20, 20);
            statusLabel.AutoSize = true;
            statusLabel.Font = new Font("Segoe UI", 10F, FontStyle.Regular, GraphicsUnit.Point, ((byte)(0)));
            this.Controls.Add(statusLabel);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(20, 60);
            progressBar.Size = new Size(360, 25);
            progressBar.Style = ProgressBarStyle.Marquee;
            this.Controls.Add(progressBar);

            appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "IndustrialHubClient");
            installPath = Path.Combine(appDataPath, "client");

            this.Load += InstallerForm_Load;
        }

        private void KillExistingAppProcesses()
        {
            try
            {
                int currentPid = Process.GetCurrentProcess().Id;
                string[] targetNames = new string[] { "Industrial Hub", "industrial-hub", "IndustrialHub" };

                foreach (string name in targetNames)
                {
                    Process[] processes = Process.GetProcessesByName(name);
                    foreach (Process proc in processes)
                    {
                        if (proc.Id != currentPid)
                        {
                            try { proc.Kill(); proc.WaitForExit(3000); } catch { }
                        }
                    }
                }
            }
            catch { }
        }

        private void EnforceMainUpdateChannel()
        {
            try
            {
                string configDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "industrial-hub");
                string configPath = Path.Combine(configDir, "config.json");
                if (File.Exists(configPath))
                {
                    string content = File.ReadAllText(configPath);
                    if (content.Contains("\"updateChannel\": \"test\"") || content.Contains("\"updateChannel\":\"test\""))
                    {
                        content = content.Replace("\"updateChannel\": \"test\"", "\"updateChannel\": \"main\"");
                        content = content.Replace("\"updateChannel\":\"test\"", "\"updateChannel\":\"main\"");
                        File.WriteAllText(configPath, content);
                    }
                }
            }
            catch { }
        }

        private void InstallerForm_Load(object sender, EventArgs e)
        {
            EnforceMainUpdateChannel();
            KillExistingAppProcesses();

            if (!Directory.Exists(installPath))
                Directory.CreateDirectory(installPath);

            statusLabel.Text = "Поиск актуальной версии...";
            System.Threading.ThreadPool.QueueUserWorkItem(FetchLatestFromGitHub);
        }

        private void ParseJsonRelease(string json, ref string version, ref string downloadUrl)
        {
            if (string.IsNullOrEmpty(json)) return;

            int tagIdx = json.IndexOf("\"tag_name\":");
            if (tagIdx != -1)
            {
                int q1 = json.IndexOf('\"', tagIdx + 11);
                int q2 = json.IndexOf('\"', q1 + 1);
                if (q1 != -1 && q2 != -1)
                {
                    string rawVer = json.Substring(q1 + 1, q2 - q1 - 1).Trim();
                    if (rawVer.StartsWith("v", StringComparison.OrdinalIgnoreCase))
                        rawVer = rawVer.Substring(1);
                    version = rawVer;
                }
            }

            int urlIdx = json.IndexOf("\"browser_download_url\":");
            while (urlIdx != -1)
            {
                int u1 = json.IndexOf('\"', urlIdx + 23);
                int u2 = json.IndexOf('\"', u1 + 1);
                if (u1 != -1 && u2 != -1)
                {
                    string possibleUrl = json.Substring(u1 + 1, u2 - u1 - 1).Trim();
                    if (possibleUrl.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
                    {
                        downloadUrl = possibleUrl;
                        break;
                    }
                }
                urlIdx = json.IndexOf("\"browser_download_url\":", u2);
            }
        }

        private void FetchLatestFromGitHub(object state)
        {
            string exeUrl = null;
            string foundVersion = null;

            // Strategy 1: GitHub API /releases/latest (stable only)
            if (string.IsNullOrEmpty(exeUrl))
            {
                try
                {
                    string apiUrl = "https://api.github.com/repos/kozhaki-vik/industrial-hub-releases/releases/latest?t=" + Environment.TickCount;
                    HttpWebRequest ghReq = (HttpWebRequest)WebRequest.Create(apiUrl);
                    ghReq.Timeout = 10000;
                    ghReq.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IndustrialHub-Installer";
                    ghReq.Accept = "application/vnd.github.v3+json";

                    using (HttpWebResponse ghResp = (HttpWebResponse)ghReq.GetResponse())
                    using (StreamReader reader = new StreamReader(ghResp.GetResponseStream()))
                    {
                        string json = reader.ReadToEnd();
                        ParseJsonRelease(json, ref foundVersion, ref exeUrl);
                    }
                }
                catch { }
            }

            // Strategy 2: Server fallback
            if (string.IsNullOrEmpty(exeUrl))
            {
                try
                {
                    string serverUrl = "https://industrial-hub.duckdns.org/version.json?t=" + Environment.TickCount;
                    HttpWebRequest srvReq = (HttpWebRequest)WebRequest.Create(serverUrl);
                    srvReq.Timeout = 8000;
                    srvReq.UserAgent = "IndustrialHub-Installer";

                    using (HttpWebResponse srvResp = (HttpWebResponse)srvReq.GetResponse())
                    using (StreamReader reader = new StreamReader(srvResp.GetResponseStream()))
                    {
                        string srvJson = reader.ReadToEnd();
                        int vIdx = srvJson.IndexOf("\"version\":");
                        if (vIdx != -1)
                        {
                            int q1 = srvJson.IndexOf('\"', vIdx + 10);
                            int q2 = srvJson.IndexOf('\"', q1 + 1);
                            if (q1 != -1 && q2 != -1)
                            {
                                foundVersion = srvJson.Substring(q1 + 1, q2 - q1 - 1).Trim().Replace("v", "");
                                if (!string.IsNullOrEmpty(foundVersion))
                                {
                                    exeUrl = string.Format("https://github.com/kozhaki-vik/industrial-hub-releases/releases/download/v{0}/Industrial.Hub.{0}.exe", foundVersion);
                                }
                            }
                        }
                    }
                }
                catch { }
            }

            if (!string.IsNullOrEmpty(foundVersion))
            {
                serverVersion = foundVersion;
            }

            if (!string.IsNullOrEmpty(exeUrl))
            {
                this.Invoke((MethodInvoker)delegate { StartDownload(exeUrl); });
            }
            else
            {
                this.Invoke((MethodInvoker)delegate {
                    MessageBox.Show("Не удалось получить ссылку на актуальную версию.\nПожалуйста, проверьте подключение к интернету или попробуйте позже.", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    Application.Exit();
                });
            }
        }

        private void StartDownload(string url)
        {
            statusLabel.Text = "Загрузка приложения v" + serverVersion + "...";
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Value = 0;

            string newAppDir = Path.Combine(installPath, "app-" + serverVersion);
            if (!Directory.Exists(newAppDir)) Directory.CreateDirectory(newAppDir);
            exeFilePath = Path.Combine(newAppDir, "Industrial Hub.exe");

            WebClient client = new WebClient();
            client.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IndustrialHub-Installer");
            client.DownloadProgressChanged += (s, e) =>
            {
                try
                {
                    progressBar.Value = Math.Min(100, Math.Max(0, e.ProgressPercentage));
                    statusLabel.Text = string.Format("Загрузка v{0}... {1}% ({2:0.00} MB / {3:0.00} MB)",
                        serverVersion, e.ProgressPercentage, (e.BytesReceived / 1024.0 / 1024.0), (e.TotalBytesToReceive / 1024.0 / 1024.0));
                }
                catch { }
            };
            client.DownloadFileCompleted += (s, e) =>
            {
                if (e.Error != null)
                {
                    MessageBox.Show("Ошибка загрузки: " + e.Error.Message + "\nСсылка: " + url, "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    Application.Exit();
                }
                else
                {
                    client.Dispose();
                    CreateShortcut(exeFilePath);
                    PatchConfigToMain();
                    LaunchApp(exeFilePath);
                }
            };

            try { client.DownloadFileAsync(new Uri(url), exeFilePath); }
            catch (Exception ex) {
                MessageBox.Show("Ошибка сети: " + ex.Message, "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Application.Exit();
            }
        }

        private void PatchConfigToMain()
        {
            try
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string configPath = Path.Combine(appData, "industrial-hub", "config.json");
                if (File.Exists(configPath))
                {
                    string json = File.ReadAllText(configPath);
                    if (json.Contains("\"updateChannel\""))
                    {
                        json = System.Text.RegularExpressions.Regex.Replace(json, "\"updateChannel\"\\s*:\\s*\"[^\"]*\"", "\"updateChannel\": \"main\"");
                        File.WriteAllText(configPath, json);
                    }
                }
            }
            catch { }
        }

        private void CreateShortcut(string targetPath)
        {
            try
            {
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string shortcutPath = Path.Combine(desktopPath, "Industrial Hub.lnk");
                
                Type wshShellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic wshShell = Activator.CreateInstance(wshShellType);
                dynamic shortcut = wshShell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
                shortcut.Save();
            }
            catch { }
        }

        private void LaunchApp(string path)
        {
            if (File.Exists(path))
            {
                this.Hide();
                Process.Start(new ProcessStartInfo
                {
                    FileName = path,
                    WorkingDirectory = Path.GetDirectoryName(path),
                    UseShellExecute = true
                });
            }
            else
            {
                MessageBox.Show("Исполняемый файл не найден!", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            Application.Exit();
        }
    }
}
