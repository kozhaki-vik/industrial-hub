!macro customInstall
  ; When installing via Setup.exe, clean up any previous app-* update folders inside $INSTDIR
  FindFirst $0 $1 "$INSTDIR\app-*"
  loop_install_clean:
    StrCmp $1 "" done_install_clean
    RMDir /r "$INSTDIR\$1"
    FindNext $0 $1
    Goto loop_install_clean
  done_install_clean:
    FindClose $0
!macroend

!macro customUnInstall
  ; Terminate any running Industrial Hub process to unlock files
  nsExec::Exec 'taskkill /F /IM "Industrial Hub.exe"'
  Sleep 500

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
