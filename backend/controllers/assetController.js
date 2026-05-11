import Asset from "../models/Asset.js";
import AssetLog from "../models/AssetLog.js";
import generateQR from "../utils/generateQR.js";


// CREATE ASSET (ADMIN)

export const createAsset = async (req, res) => {

  const { name, description } = req.body;

  try {

    const assetTag = `AST-${Date.now()}`;

    const qrData = JSON.stringify({
      assetTag
    });

    const qrCode = await generateQR(qrData);

    const asset = await Asset.create({
      name,
      description,
      assetTag,
      qrCode
    });

    res.json(asset);

  } catch (error) {
    res.status(500).json(error.message);
  }

};



// BORROW ASSET (STUDENT SCANS QR)

export const borrowAsset = async (req, res) => {

  const { assetTag } = req.body;

  try {

    const asset = await Asset.findOne({ assetTag });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status !== "available") {
      return res.status(400).json({ message: "Asset not available" });
    }

    const activeBorrow = await AssetLog.findOne({
        student: req.user._id,
        returnedAt: null
        });

        if (activeBorrow) {
        return res.status(400).json({
            message: "Return previously borrowed asset first"
        });
        }

    const dueDate = newDate();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days    

    const log = await AssetLog.create({
      asset: asset._id,
      student: req.user._id,
      borrowedAt: new Date(),
      dueDate
    });

    asset.status = "borrowed";
    await asset.save();

    res.json({
      message: "Asset borrowed",
      log
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};



// RETURN ASSET

export const returnAsset = async (req, res) => {

  const { assetTag, condition } = req.body;

  try {

    const asset = await Asset.findOne({ assetTag });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const log = await AssetLog.findOne({
      asset: asset._id,
      student: req.user._id,
      returnedAt: null
    });

    if (!log) {
      return res.status(400).json({ message: "Borrow record not found" });
    }

    log.returnedAt = new Date();
    log.conditionOnReturn = condition;
    log.approvedReturn = false;

    await log.save();

    asset.status = "pending";
    await asset.save();

    res.json({
      message: "Asset returned",
      log
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};

export const approveReturn = async (req, res) => {
  const { logId } = req.body;

  const log = await AssetLog.findById(logId).populate("asset");

  if (!log) {
    return res.status(404).json({ message: "log not found "});
  }

  log.approvedReturn = true;
  await log.save();

  log.asset.status = "available"
  await log.asset.save();

  res.json({ message: "Return approved" });
};

export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json(error.message);
  }
};