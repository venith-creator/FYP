import QRCode from "qrcode";

const generateQR = async (data) => {
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 500
  });
};


export default generateQR;