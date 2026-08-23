import fs from 'fs';

let text = fs.readFileSync('src/i18n.js', 'utf8');

const enLines = `      "dev_path_desc": "Check paths and file presence",
      "dev_path_rust": "Rust Path:",
      "dev_path_app": "App Path:",
      "dev_path_check_btn": "Check file integrity",
      "dev_path_check_success": "All files present!",
      "dev_path_check_error": "Errors found:",
      "dev_app_title": "App & Tests",
      "dev_app_desc": "Service info and testing",
      "dev_app_uptime": "Uptime (App):",
      "dev_sys_uptime": "Uptime (System):",
      "dev_app_first_launch": "First launch:",
      "dev_app_test_splash": "Test splash screen",
      "dev_stats_title": "Global Analytics",
      "dev_stats_desc": "Top 20 most used buttons (Local only)",
      "dev_stats_btn": "Button / Action",
      "dev_stats_clicks": "Clicks",
      "dev_stats_empty": "No data",
      "time_hours": "h",
      "time_mins": "m",
      "time_secs": "s",
      "servers_online": "Online",
      "servers_offline": "Offline",
      "servers_copied": "IP Copied!",
      "servers_server_1_desc": "X3 Loot, No BP, Auto-Auth. Wiped yesterday.",
      "servers_server_2_desc": "Max 3, Vanilla+. Wipes every Friday.",
      "servers_server_3_desc": "X1000, Battlefield, Custom Guns.",
      "mon_search": "Search monuments...",
      "mon_rad_title": "Radiation:",
      "mon_rad_none": "None",
      "mon_desc_title": "Description",
      "mon_puzzle_title": "Puzzle Guide",
      "mon_loot_title": "What can you get?",
      "mon_cctv_title": "CCTV Camera Codes",
      "mon_cctv_hint": "Click to copy",
      "mon_cctv_copied": "Copied!",
      "mon_error_desc": "Found an error in the guide or loot?",
      "mon_report_btn": "Report Error",
      "mon_video_guide": "Watch video guide on YouTube",`;

let enMatch = text.match(/"dev_path_title": "Paths & Integrity",\s*"mon_not_found": "Nothing found for your query.",/);
if (enMatch) {
  text = text.replace(enMatch[0], '"dev_path_title": "Paths & Integrity",\n' + enLines + '\n      "mon_not_found": "Nothing found for your query.",');
}

fs.writeFileSync('src/i18n.js', text, 'utf8');
console.log('Fixed EN completely');
