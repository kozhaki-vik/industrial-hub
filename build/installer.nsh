!macro customInstall
  SetOutPath "$INSTDIR"

  ; When installing via Setup.exe, clean up any previous app-* update folders inside $INSTDIR
  FindFirst $0 $1 "$INSTDIR\app-*"
  loop_install_clean:
    StrCmp $1 "" done_install_clean
    RMDir /r "$INSTDIR\$1"
    FindNext $0 $1
    Goto loop_install_clean
  done_install_clean:
    FindClose $0

  ; Always recreate desktop and start menu shortcuts to guarantee they never vanish on updates
  ; 1. Standard Desktop
  CreateShortCut "$DESKTOP\Industrial Hub.lnk" "$INSTDIR\Industrial Hub.exe" "" "$INSTDIR\Industrial Hub.exe" 0 "" "" "Industrial Hub - Ultimate Rust Assistant"

  ; 2. Profile Desktop & OneDrive Desktop
  IfFileExists "$PROFILE\Desktop\*.*" 0 +2
    CreateShortCut "$PROFILE\Desktop\Industrial Hub.lnk" "$INSTDIR\Industrial Hub.exe" "" "$INSTDIR\Industrial Hub.exe" 0 "" "" "Industrial Hub - Ultimate Rust Assistant"

  IfFileExists "$PROFILE\OneDrive\Desktop\*.*" 0 +2
    CreateShortCut "$PROFILE\OneDrive\Desktop\Industrial Hub.lnk" "$INSTDIR\Industrial Hub.exe" "" "$INSTDIR\Industrial Hub.exe" 0 "" "" "Industrial Hub - Ultimate Rust Assistant"

  ; 3. Start Menu shortcuts
  CreateShortCut "$SMPROGRAMS\Industrial Hub.lnk" "$INSTDIR\Industrial Hub.exe" "" "$INSTDIR\Industrial Hub.exe" 0 "" "" "Industrial Hub - Ultimate Rust Assistant"
  CreateDirectory "$SMPROGRAMS\Industrial Hub"
  CreateShortCut "$SMPROGRAMS\Industrial Hub\Industrial Hub.lnk" "$INSTDIR\Industrial Hub.exe" "" "$INSTDIR\Industrial Hub.exe" 0 "" "" "Industrial Hub - Ultimate Rust Assistant"

  ; 4. Auto-Start preservation across reinstallations
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "electron.app.Industrial Hub"
  StrCmp $0 "" check_legacy_autostart write_autostart_reg

  check_legacy_autostart:
    ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Industrial Hub"
    StrCmp $0 "" check_store_autostart write_autostart_reg

  check_store_autostart:
    IfFileExists "$APPDATA\industrial-hub\industrial-hub-config.json" 0 write_autostart_reg
    Goto done_autostart

  write_autostart_reg:
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "electron.app.Industrial Hub" '"$INSTDIR\Industrial Hub.exe" --autostart'

  done_autostart:
!macroend

!macro customUnInstall
  ; Terminate any running Industrial Hub process to unlock files
  nsExec::Exec 'taskkill /F /IM "Industrial Hub.exe"'
  Sleep 500

  ; Remove autostart registry entries
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "electron.app.Industrial Hub"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Industrial Hub"

  ; Recursively remove all app-* update subdirectories
  FindFirst $0 $1 "$INSTDIR\app-*"
  loop_uninst_clean:
    StrCmp $1 "" done_uninst_clean
    RMDir /r "$INSTDIR\$1"
    FindNext $0 $1
    Goto loop_uninst_clean
  done_uninst_clean:
    FindClose $0

  ; Clean up desktop and start menu shortcuts
  Delete "$DESKTOP\Industrial Hub.lnk"
  Delete "$SMPROGRAMS\Industrial Hub.lnk"
  RMDir /r "$SMPROGRAMS\Industrial Hub"
  Delete "$SMPROGRAMS\industrial-hub.lnk"
  RMDir /r "$SMPROGRAMS\industrial-hub"
!macroend
