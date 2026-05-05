// ============================================================
//  main.js — Entry point: khoi dong ung dung
//  Load sau tat ca cac file js khac.
// ============================================================

// Chi load du lieu khi da dang nhap (co token)
if (localStorage.getItem(TOKEN_KEY)) {
  loadAllData();
}
