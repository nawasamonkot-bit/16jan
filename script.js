// =======================================
// 🎨 วาดใบเกียรติบัตร
// =======================================
function drawCertificate(name) {
  return new Promise((resolve, reject) => {
    const canvas = document.getElementById("certCanvas");
    const ctx = canvas.getContext("2d");

    const bg = new Image();
    bg.src = "certificate.jpg";

    bg.onload = async () => {
      await document.fonts.ready;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // ชื่อผู้รับเกียรติบัตร
      ctx.font = "700 52px 'IBM Plex Sans Thai'";
      ctx.fillStyle = "#b76f1b";
      ctx.textAlign = "center";
      ctx.fillText(name, canvas.width / 2, 280);

      resolve();
    };

    bg.onerror = () => reject("โหลดภาพ certificate.jpg ไม่สำเร็จ");
  });
}
function showLoading() {
  const modal = document.getElementById("loadingModal");
  if (modal) modal.style.display = "flex";
}

function hideLoading() {
  const modal = document.getElementById("loadingModal");
  if (modal) modal.style.display = "none";
}


// =======================================
// ✅ สร้างเกียรติบัตร (MAIN)
// =======================================
async function generateCert() {
  const nameInput = document.getElementById("nameInput");
  const generateBtn = document.getElementById("generateBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const title = document.getElementById("title");

  const name = nameInput.value.trim();
  if (!name) {
    alert("กรุณากรอกชื่อ");
    return;
  }

  // 🔥 แสดง Loading
  showLoading();

  // บังคับให้ browser วาด modal ก่อน
  await new Promise(resolve => setTimeout(resolve, 50));

  const MIN_LOADING_TIME = 1500; // อย่างน้อย 1.5 วินาที
  const startTime = Date.now();

  try {
    // วาดใบเซอร์
    await drawCertificate(name);

    // ⏳ คำนวณเวลาที่ใช้ไป
    const elapsed = Date.now() - startTime;

    // ถ้าเร็วกว่าที่กำหนด ให้รอเพิ่ม
    if (elapsed < MIN_LOADING_TIME) {
      await new Promise(resolve =>
        setTimeout(resolve, MIN_LOADING_TIME - elapsed)
      );
    }

    // 🔥 ซ่อน Loading
    hideLoading();

    // ปรับหน้าจอหลังสร้างเสร็จ
    title.innerText = "สร้างเรียบร้อยแล้ว !";
    nameInput.style.display = "none";
    generateBtn.style.display = "none";
    downloadBtn.style.display = "block";

  } catch (err) {
    hideLoading();
    alert("เกิดข้อผิดพลาดในการสร้างเกียรติบัตร");
    console.error(err);
  }
}



