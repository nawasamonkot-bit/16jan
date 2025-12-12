// ✅ URL sheet.best ที่ถูกต้อง
const SHEET_URL = "https://sheet.best/api/sheets/3718a053-334f-47be-b078-8467307e2bd6";

// สร้างเลขรันง่าย ๆ
let lastNumber = parseInt(localStorage.getItem("lastNumber") || "0");
function genNumber() {
  lastNumber++;
  localStorage.setItem("lastNumber", lastNumber);
  return String(lastNumber).padStart(3, "0");
}

// สร้างพรีวิวเกียรติบัตร + ส่งข้อมูลไป Sheet
async function generateCert() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) { alert("กรุณากรอกชื่อ"); return; }

  const number = genNumber();
  const now = new Date();
  const dateTH = now.toLocaleString("th-TH", { dateStyle:"long", timeStyle:"short" });

  drawCertificate(name, number, dateTH);

  // แสดงปุ่มดาวน์โหลดหลังพรีวิว
  document.getElementById("downloadBtn").style.display = "block";

  // ดึง IP แบบปลอดภัย
  let ip = "unknown";
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    ip = ipData.ip;
  } catch (e) {
    console.warn("ดึง IP ไม่สำเร็จ");
  }

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

    console.log("ข้อมูลถูกส่งไป Sheet เรียบร้อย");
  } catch(err) {
    console.error(err);
    alert("❌ เกิดข้อผิดพลาดในการส่งข้อมูล");
  }
}

// วาด Canvas
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
    ctx.fillText(name, canvas.width/2, 350);

    ctx.font = "32px THSarabunNew";
    ctx.textAlign = "left";
    ctx.fillText(number, 50, 550);
    ctx.fillText(dateTH, 50, 590);
  };
}

// ดาวน์โหลด PNG
function downloadCert() {
  const canvas = document.getElementById("certCanvas");
  const link = document.createElement("a");
  link.download = "certificate.png";
  link.href = canvas.toDataURL();
  link.click();
}
