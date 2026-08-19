function generateQR(text) {
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = ""; // Limpiar QR anterior

    new QRCode(qrDiv, {
        text: text,
        width: 85,
        height: 85,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}