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
        private Panel smartScreenPanel;
        private Label smartScreenTitle;
        private Label smartScreenText;
        private LinkLabel smartScreenLink;
        private string appDataPath;
        private string installPath;
        private string exeFilePath;
        private string serverVersion = "unknown";

        public InstallerForm()
        {
            this.Text = "Industrial Hub Installer";
            this.Size = new Size(440, 260);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.White;

            try { this.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }
            try { 
                ServicePointManager.SecurityProtocol = (SecurityProtocolType)12288 | (SecurityProtocolType)3072 | (SecurityProtocolType)768 | SecurityProtocolType.Tls; 
                ServicePointManager.Expect100Continue = false;
            } catch { }

            statusLabel = new Label();
            statusLabel.Text = "Запуск...";
            statusLabel.Location = new Point(20, 16);
            statusLabel.AutoSize = true;
            statusLabel.Font = new Font("Segoe UI", 9.5F, FontStyle.Regular, GraphicsUnit.Point, ((byte)(0)));
            this.Controls.Add(statusLabel);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(20, 48);
            progressBar.Size = new Size(385, 24);
            progressBar.Style = ProgressBarStyle.Marquee;
            this.Controls.Add(progressBar);

            // SmartScreen Guidance Box
            smartScreenPanel = new Panel();
            smartScreenPanel.Location = new Point(20, 88);
            smartScreenPanel.Size = new Size(385, 115);
            smartScreenPanel.BackColor = Color.FromArgb(248, 250, 252);
            smartScreenPanel.BorderStyle = BorderStyle.FixedSingle;
            this.Controls.Add(smartScreenPanel);

            smartScreenTitle = new Label();
            smartScreenTitle.Text = "🛡️ Защита Windows SmartScreen:";
            smartScreenTitle.Location = new Point(10, 8);
            smartScreenTitle.AutoSize = true;
            smartScreenTitle.Font = new Font("Segoe UI", 9F, FontStyle.Bold, GraphicsUnit.Point, ((byte)(0)));
            smartScreenTitle.ForeColor = Color.FromArgb(15, 23, 42);
            smartScreenPanel.Controls.Add(smartScreenTitle);

            smartScreenText = new Label();
            smartScreenText.Text = "Если Windows покажет синее окно «Защитила ваш ПК»:\n➔ Нажмите «Подробнее» ➔ «Выполнить в любом случае»";
            smartScreenText.Location = new Point(10, 30);
            smartScreenText.Size = new Size(365, 42);
            smartScreenText.Font = new Font("Segoe UI", 8.5F, FontStyle.Regular, GraphicsUnit.Point, ((byte)(0)));
            smartScreenText.ForeColor = Color.FromArgb(51, 65, 85);
            smartScreenPanel.Controls.Add(smartScreenText);

            smartScreenLink = new LinkLabel();
            smartScreenLink.Text = "ℹ️ Почему это появляется? (Справка)";
            smartScreenLink.Location = new Point(10, 80);
            smartScreenLink.AutoSize = true;
            smartScreenLink.Font = new Font("Segoe UI", 8.5F, FontStyle.Regular, GraphicsUnit.Point, ((byte)(0)));
            smartScreenLink.LinkColor = Color.FromArgb(234, 88, 12);
            smartScreenLink.ActiveLinkColor = Color.FromArgb(194, 65, 12);
            smartScreenLink.LinkClicked += (s, ev) => {
                MessageBox.Show(
                    "БЕЗОПАСНОСТЬ И WINDOWS SMARTSCREEN:\n\n" +
                    "1. Industrial Hub подписан официальным цифровым сертификатом (Kozhaki).\n" +
                    "2. Microsoft Defender SmartScreen временно отображает предупреждение на новых версиях до тех пор, пока релиз не наберет историю установок в облаке Microsoft.\n" +
                    "3. Приложение не содержит вредоносного кода, не трогает реестр и не инжектится в игры.\n\n" +
                    "КАК ЗАПУСТИТЬ:\n" +
                    "Нажмите ссылку «Подробнее» в левой части синего экрана и затем появившуюся кнопку «Выполнить в любом случае».",
                    "Справка о безопасности Windows SmartScreen",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            };
            smartScreenPanel.Controls.Add(smartScreenLink);

            appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "IndustrialHubClient");
            installPath = Path.Combine(appDataPath, "client");

            this.Load += InstallerForm_Load;
        }

        private bool VerifySignature(string filePath)
        {
            try
            {
                var cert = System.Security.Cryptography.X509Certificates.X509Certificate.CreateFromSignedFile(filePath);
                string hash = cert.GetCertHashString();
                return hash == "F275C9D48A3325871DB04B0FDFB5701BE34802B7" ||
                       hash == "CF5FD177247FC2EEB561B69BE223EF0757218C08" ||
                       hash == "4061B8CF1678362998377C36C8F16A505ED8CE34";
            }
            catch
            {
                return false;
            }
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
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string[] possibleFiles = new string[]
                {
                    Path.Combine(appData, "industrial-hub", "industrial-hub-config.json"),
                    Path.Combine(appData, "industrial-hub", "config.json"),
                    Path.Combine(appData, "Industrial Hub", "industrial-hub-config.json"),
                    Path.Combine(appData, "Industrial Hub", "config.json")
                };

                foreach (string configPath in possibleFiles)
                {
                    if (File.Exists(configPath))
                    {
                        string content = File.ReadAllText(configPath);
                        bool changed = false;
                        if (content.Contains("\"updateChannel\": \"test\"") || content.Contains("\"updateChannel\":\"test\""))
                        {
                            content = content.Replace("\"updateChannel\": \"test\"", "\"updateChannel\": \"main\"");
                            content = content.Replace("\"updateChannel\":\"test\"", "\"updateChannel\":\"main\"");
                            changed = true;
                        }
                        else if (!content.Contains("\"updateChannel\""))
                        {
                            int firstBrace = content.IndexOf('{');
                            if (firstBrace != -1)
                            {
                                content = content.Insert(firstBrace + 1, "\n\t\"updateChannel\": \"main\",");
                                changed = true;
                            }
                        }

                        if (changed)
                        {
                            File.WriteAllText(configPath, content);
                        }
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
                    MessageBox.Show("Не удалось получить ссылку на стабильную версию.\nПожалуйста, проверьте подключение к интернету или попробуйте позже.", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                    if (!VerifySignature(exeFilePath))
                    {
                        MessageBox.Show(
                            "Ошибка проверки подписи! Скачанный файл может быть повреждён или подменён.\nУстановка отменена.",
                            "Ошибка безопасности", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        try { File.Delete(exeFilePath); } catch { }
                        Application.Exit();
                        return;
                    }
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
            EnforceMainUpdateChannel();
            if (File.Exists(path))
            {
                this.Hide();
                Process.Start(new ProcessStartInfo
                {
                    FileName = path,
                    Arguments = "--force-main-channel",
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
