const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/data', async (req, res) => {
  const { serialNumber } = req.query;
  if (!serialNumber) {
    return res.status(400).json({ error: "serialNumber is required" });
  }

  const folderPath = path.join(__dirname, 'excel_folder');
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.xlsx'));

  for (const file of files) {
    const workbook = XLSX.readFile(path.join(folderPath, file));
    for (const sheetName of workbook.SheetNames) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

      // Use the exact column header from your Excel file for PCB Sr NO.
      const found = rows.find(row => row["PCB Sr NO."] && row["PCB Sr NO."].toString().trim() === serialNumber.trim());

      if (found) {
        // All fields from the row (including "Line Item No") will be sent
        return res.json(found);
      }
    }
  }
  res.status(404).json({ error: "Serial number not found" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));


