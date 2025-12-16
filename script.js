// =======================================
// ✅ ตั้งค่า API (sheet.best)
// =======================================
const SHEET_URL = "https://api.sheetbest.com/sheets/3718a053-334f-47be-b078-8467307e2bd6";

// =======================================
// ✅ อ่านเลขล่าสุด (รองรับ RESET)
// =======================================
async function getLastNumber() {
  const res = await fetch(SHEET_URL);
  const rows = await res.json();
  if (rows.length === 0) return 0;

  // 1) ถ้ามี RESET ให้เริ่มใหม่
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].name === "__RESET__") {
      return 0;
    }
  }

  // 2) หาเลขล่าสุดจริง
  for (let i = rows.length - 1; i >= 0; i--) {
    const n = parseInt(rows[i].number);
    if (!isNaN(n)) return n;
  }

  return 0;
}

// =======================================
// ✅ สร้างเลขรันใหม่
// =======================================
async function genNumber() {
  let lastNum = await getLastNumber();
  lastNum++;
  return String(lastNum).padStart(3, "0");
}

// =======================================
// ✅ สร้างเกียรติบัตร
// =======================================
async function generateCert() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) {
    alert("กรุณากรอกชื่อ");
    return;
  }

  const number = await genNumber();
  const now = new Date();
  const dateTH = now.toLocaleString("th-TH", {
    dateStyle: "long",
    timeStyle: "short"
  });

  drawCertificate(name, number, dateTH);

  // แสดงปุ่มดาวน์โหลด
  const btn = document.getElementById("downloadBtn");
  if (btn) btn.style.display = "block";

  // หา IP (ไม่สำเร็จก็ไม่เป็นไร)
  let ip = "unknown";
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    ip = (await ipRes.json()).ip;
  } catch {}

  // บันทึกข้อมูลลง sheet.best
  try {
    const data = {
      name,
      number,
      date: dateTH,
      device: navigator.platform || "-",
      userAgent: navigator.userAgent || "-",
      ip
    };

    await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    console.log("บันทึกข้อมูลสำเร็จ");
  } catch (err) {
    alert("❌ บันทึกข้อมูลไม่สำเร็จ");
    console.error(err);
  }
}

// =======================================
// 🎨 วาดใบเกียรติบัตรบน Canvas
// =======================================
function drawCertificate(name, number, dateTH) {
  const canvas = document.getElementById("certCanvas");
  const ctx = canvas.getContext("2d");

  const bg = new Image();
  bg.src = "certificate.jpg";

  bg.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.font = "50px THSarabunNew";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, 350);

    ctx.font = "32px THSarabunNew";
    ctx.textAlign = "left";
    ctx.fillText(number, 50, 550);
    ctx.fillText(dateTH, 50, 590);
  };
}

// =======================================
// ⬇ ดาวน์โหลดเกียรติบัตร PNG
// =======================================
function downloadCert() {
  const canvas = document.getElementById("certCanvas");
  const link = document.createElement("a");
  link.download = "certificate.jpg";
  link.href = canvas.toDataURL();
  link.click();
}

// =======================================
// 🔥 ADMIN: รีเซ็ตเลขรัน (ใช้ได้จริง)
// =======================================
async function resetData() {
  if (!confirm("ต้องการรีเซ็ตเลขรันกลับเป็น 001 ใช่หรือไม่?")) return;

  const resetRow = {
    name: "__RESET__",
    number: "",
    date: new Date().toLocaleString("th-TH"),
    device: "ADMIN",
    userAgent: "RESET",
    ip: "-"
  };

  try {
    await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resetRow)
    });

    alert("✅ รีเซ็ตเลขรันเรียบร้อยแล้ว\nเลขถัดไปคือ 001");
  } catch (err) {
    alert("❌ รีเซ็ตไม่สำเร็จ");
    console.error(err);
  }
}

