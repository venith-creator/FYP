import QRCode from "qrcode";

const generateQR = async (data) => {
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: "M",
    margin: 4,
  });
};


export default generateQR;