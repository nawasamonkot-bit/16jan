// =======================================
// ✅ ตั้งค่า API
// =======================================
const SHEET_URL = "https://api.sheetbest.com/sheets/3718a053-334f-47be-b078-8467307e2bd6";

// =======================================
// ✅ อ่านเลขล่าสุดจาก sheet.best
// =======================================
async function getLastNumber() {
  const res = await fetch(SHEET_URL);
  const rows = await res.json();
  if (rows.length === 0) return 0;

  const last = rows[rows.length - 1].number;
  return parseInt(last || "0");
}

// =======================================
// ✅ เพิ่มเลขใหม่ (ไม่ใช้ localStorage แล้ว)
// =======================================
async function genNumber() {
  let lastNum = await getLastNumber();
  lastNum++;
  return String(lastNum).padStart(3, "0");
}

// =======================================
// ✅ ฟังก์ชันสร้างเกียรติบัตร
// =======================================
async function generateCert() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) { alert("กรุณากรอกชื่อ"); return; }

  const number = await genNumber();
  const now = new Date();
  const dateTH = now.toLocaleString("th-TH", { dateStyle:"long", timeStyle:"short" });

  drawCertificate(name, number, dateTH);

  // แสดงปุ่มดาวน์โหลด
  document.getElementById("downloadBtn").style.display = "block";

  // IP
  let ip = "unknown";
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    ip = (await ipRes.json()).ip;
  } catch {}

  // ส่งข้อมูลไป sheet.best
  try {
    const data = {
      name,
      number,
      date: dateTH,
      device: navigator.platform,
      userAgent: navigator.userAgent,
      ip
    };

    await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(data)
    });

    console.log("ข้อมูลถูกส่งสำเร็จ");
  } catch(err) {
    alert("❌ ส่งข้อมูลไม่สำเร็จ");
    console.error(err);
  }
}

// =======================================
// วาดใบเกียรติบัตร
// =======================================
function drawCertificate(name, number, dateTH) {
  const canvas = document.getElementById("certCanvas");
  const ctx = canvas.getContext("2d");
  const bg = new Image();
  bg.src = "certificate.png";

  bg.onload = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.font = "50px THSarabunNew";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.fillText(name, canvas.width / 2, 350);

    ctx.font = "32px THSarabunNew";
    ctx.textAlign = "left";
    ctx.fillText(number, 50, 550);
    ctx.fillText(dateTH, 50, 590);
  };
}

// =======================================
// ดาวน์โหลด PNG
// =======================================
function downloadCert() {
  const canvas = document.getElementById("certCanvas");
  const link = document.createElement("a");
  link.download = "certificate.png";
  link.href = canvas.toDataURL();
  link.click();
}

// =======================================
// 🔥 ฟังก์ชันนี้สำหรับหน้า admin.html เท่านั้น
// =======================================
async function resetNumber() {
  if (!confirm("ต้องการรีเซ็ตเลขทั้งหมดกลับเป็น 000 หรือไม่?")) return;

  // 1) ล้างข้อมูลทั้งหมด
  await fetch(SHEET_URL, { method: "DELETE" });

  // 2) บันทึกค่าเริ่มต้นใหม่ (number = 000)
  await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ name:"-", number:"000", date:"-", device:"-", userAgent:"-", ip:"-" })
  });

  alert("รีเซ็ตนัมเบอร์เรียบร้อยแล้ว ✔");
  location.reload();
}
