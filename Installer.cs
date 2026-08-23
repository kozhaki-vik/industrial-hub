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
            try { ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | (SecurityProtocolType)768 | SecurityProtocolType.Tls; } catch { }

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

        private void InstallerForm_Load(object sender, EventArgs e)
        {
            KillExistingAppProcesses();

            if (!Directory.Exists(installPath))
                Directory.CreateDirectory(installPath);

            // Find existing installation
            string latestExe = null;
            if (Directory.Exists(installPath))
            {
                var dirs = Directory.GetDirectories(installPath, "app-*");
                foreach (var d in dirs)
                {
                    string candidate = Path.Combine(d, "Industrial Hub.exe");
                    if (File.Exists(candidate))
                    {
                        latestExe = candidate;
                        break;
                    }
                }
            }

            if (latestExe != null)
            {
                LaunchApp(latestExe);
            }
            else
            {
                statusLabel.Text = "Поиск актуальной версии...";
                System.Threading.ThreadPool.QueueUserWorkItem(FetchLatestFromGitHub);
            }
        }

        private void FetchLatestFromGitHub(object state)
        {
            string exeUrl = null;
            try
            {
                HttpWebRequest ghReq = (HttpWebRequest)WebRequest.Create("https://api.github.com/repos/kozhaki-vik/industrial-hub-releases/releases/latest");
                ghReq.Timeout = 5000;
                ghReq.UserAgent = "IndustrialHub-Launcher";
                using (HttpWebResponse ghResp = (HttpWebResponse)ghReq.GetResponse())
                using (StreamReader reader = new StreamReader(ghResp.GetResponseStream()))
                {
                    string json = reader.ReadToEnd();
                    int tagIdx = json.IndexOf("\"tag_name\":");
                    if (tagIdx != -1)
                    {
                        int q1 = json.IndexOf('\"', tagIdx + 11);
                        int q2 = json.IndexOf('\"', q1 + 1);
                        if (q1 != -1 && q2 != -1)
                        {
                            serverVersion = json.Substring(q1 + 1, q2 - q1 - 1).Trim();
                            if (serverVersion.StartsWith("v", StringComparison.OrdinalIgnoreCase))
                                serverVersion = serverVersion.Substring(1);
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
                                exeUrl = possibleUrl;
                                break;
                            }
                        }
                        urlIdx = json.IndexOf("\"browser_download_url\":", u2);
                    }
                }
            }
            catch { }

            if (!string.IsNullOrEmpty(exeUrl))
            {
                this.Invoke((MethodInvoker)delegate { StartDownload(exeUrl); });
            }
            else
            {
                this.Invoke((MethodInvoker)delegate {
                    MessageBox.Show("Не удалось получить ссылку на актуальную версию.", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
            client.Headers.Add("User-Agent", "Mozilla/5.0");
            client.DownloadProgressChanged += (s, e) =>
            {
                progressBar.Value = e.ProgressPercentage;
                statusLabel.Text = string.Format("Загрузка v{0}... {1}% ({2} MB / {3} MB)",
                    serverVersion, e.ProgressPercentage, (e.BytesReceived / 1024.0 / 1024.0).ToString("0.00"), (e.TotalBytesToReceive / 1024.0 / 1024.0).ToString("0.00"));
            };
            client.DownloadFileCompleted += (s, e) =>
            {
                if (e.Error != null)
                {
                    MessageBox.Show("Ошибка загрузки: " + e.Error.Message, "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    Application.Exit();
                }
                else
                {
                    client.Dispose();
                    CreateShortcut(exeFilePath);
                    LaunchApp(exeFilePath);
                }
            };

            try { client.DownloadFileAsync(new Uri(url), exeFilePath); }
            catch (Exception ex) {
                MessageBox.Show("Ошибка сети: " + ex.Message, "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Application.Exit();
            }
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
