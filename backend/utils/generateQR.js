import QRCode from "qrcode";

const generateQR = async (data) => {
  try {
    const qr = await QRCode.toDataURL(data);
    return qr;
  } catch (error) {
    console.error(error);
  }
};

export default generateQR;