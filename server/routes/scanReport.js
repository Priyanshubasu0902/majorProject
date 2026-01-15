import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/scanreport", upload.single("report"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = [
      { name: "Hemoglobin", value: "11.2 g/dL", status: "low" },
      { name: "Blood Sugar (Fasting)", value: "145 mg/dL", status: "high" },
      { name: "WBC Count", value: "7200 /µL", status: "normal" },
    ];

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to analyze report" });
  }
});

export default router;   