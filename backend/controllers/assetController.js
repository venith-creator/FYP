import Asset from "../models/Asset.js";
import AssetLog from "../models/AssetLog.js";
import generateQR from "../utils/generateQR.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import {
  borrowApprovedTemplate,
  borrowRejectedTemplate,
  returnApprovedTemplate,
  returnRejectedTemplate
} from "../utils/emailTemplates.js";


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
        approvedBorrow: true,
        approvedReturn: false
        });

        if (activeBorrow) {
        return res.status(400).json({
            message: "Return previously borrowed asset first"
        });
        }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days    

    const log = await AssetLog.create({
      asset: asset._id,
      student: req.user._id,
      borrowedAt: new Date(),
      dueDate,
      approvedBorrow: false
    });

    asset.status = "pending-borrow";
    await asset.save();

    const admins = await User.find({
      role: "admin",
      email: { $exists: true, $ne: null }
    });

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: "New Asset Borrow Request",
        html: `
          <h2>New Borrow Request</h2>

          <p><b>Student:</b> ${req.user.name}</p>

          <p><b>Student ID:</b> ${req.user.studentId}</p>

          <p><b>Asset:</b> ${asset.name}</p>

          <p>The request is awaiting approval.</p>
        `
      });
    }

    res.json({
      message: "Asset borrowed",
      log
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};

export const approveBorrow = async (req, res) => {

  const { logId } = req.body;

  try {

    const log = await AssetLog
      .findById(logId)
      .populate("asset")
      .populate("student");

    if (!log) {
      return res.status(404).json({
        message: "Log not found"
      });
    }

    log.approvedBorrow = true;

    log.borrowApprovedAt = new Date();

    await log.save();

    log.asset.status = "borrowed";

    await log.asset.save();

    if (log.student?.email) {
      await sendEmail({
        to: log.student.email,
        subject: "Borrow Request Approved",
        html: borrowApprovedTemplate({
          name: log.student.name,
          asset: log.asset.name,
          dueDate: log.dueDate.toDateString()
        })
      });
    }

    res.json({
      message: "Borrow approved"
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
      approvedBorrow: true,
      approvedReturn: false
    });

    if (!log) {
      return res.status(400).json({ message: "Borrow record not found" });
    }

    log.returnedAt = new Date();
    log.conditionOnReturn = condition;
    log.approvedReturn = false;

    await log.save();

    asset.status = "pending-return";
    await asset.save();

    const admins = await User.find({
        role: "admin",
        email: { $exists: true, $ne: null }
      });

      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: "Returned Asset Awaiting Inspection",
          html: `
            <h2>Returned Asset</h2>

            <p><b>Student:</b> ${req.user.name}</p>

            <p><b>Student ID:</b> ${req.user.studentId}</p>

            <p><b>Asset:</b> ${asset.name}</p>

            <p>The asset has been returned and is awaiting inspection.</p>
          `
        });
      }

    res.json({
      message: "Asset returned",
      log
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};

export const studentAssetLogs = async (req, res) => {

  try {

    const logs = await AssetLog.find({
      student: req.user._id
    })
    .populate("asset")
    .sort({ createdAt: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json(error.message);
  }

};

export const approveReturn = async (req, res) => {

  const { logId } = req.body;

  try {

    const log = await AssetLog
      .findById(logId)
      .populate("asset");

    if (!log) {
      return res.status(404).json({
        message: "Log not found"
      });
    }

    log.approvedReturn = true;

    log.returnApprovedAt = new Date();

    await log.save();

    log.asset.status = "available";

    await log.asset.save();

    res.json({
      message: "Return approved"
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const rejectBorrow = async (req, res) => {

  const { logId, note } = req.body;

  try {

    const log = await AssetLog
      .findById(logId)
      .populate("asset")
      .populate("student");

    if (!log) {
      return res.status(404).json({
        message: "Log not found"
      });
    }

    log.borrowRejected = true;

    log.adminNote = note;

    await log.save();

    log.asset.status = "available";

    await log.asset.save();

    if (log.student?.email) {
      await sendEmail({
        to: log.student.email,
        subject: "Borrow Request Rejected",
        html: borrowRejectedTemplate({
          name: log.student.name,
          asset: log.asset.name,
          reason: note
        })
      });
    }

    res.json({
      message: "Borrow rejected"
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const rejectReturn = async (req, res) => {

  const { logId, note } = req.body;

  try {

    const log = await AssetLog
      .findById(logId)
      .populate("asset");

    if (!log) {
      return res.status(404).json({
        message: "Log not found"
      });
    }

    log.returnRejected = true;

    log.adminNote = note;

    log.returnedAt = null;

    await log.save();

    log.asset.status = "borrowed";

    await log.asset.save();

    res.json({
      message: "Return rejected"
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const assetAnalytics = async (req, res) => {

  try {

    const available =
      await Asset.countDocuments({
        status: "available"
      });

    const borrowed =
      await Asset.countDocuments({
        status: "borrowed"
      });

    const pendingBorrow =
      await Asset.countDocuments({
        status: "pending-borrow"
      });

    const pendingReturn =
      await Asset.countDocuments({
        status: "pending-return"
      });

    res.json({
      available,
      borrowed,
      pendingBorrow,
      pendingReturn
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json(error.message);
  }
};