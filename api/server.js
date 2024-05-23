const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const app = express();
const port = 3001;

// Enable CORS for all requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPort = process.env.DB_PORT;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_DATABASE;
const staticUsername = process.env.STATIC_USERNAME;
const staticPassword = process.env.STATIC_PASSWORD;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function generateLicenseKey(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const segmentLength = length / 5; // Divide the length into 4 segments for hyphens
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    if (i > 0 && i % segmentLength === 0) {
      result += "-"; // Add hyphen after each segment
    }
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const createDate = () => {
  const date = new Date();

  // Get the year, month, and day components of the date
  const year = date.getFullYear();
  let month = date.getMonth() + 1; // Months are zero-based, so we add 1
  let day = date.getDate();

  // Pad the month and day with leading zeros if necessary
  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  // Format the date as YYYY-MM-DD
  return `${year}-${month}-${day}`;
};

function isDifferenceLessThanOneYear(date1, date2) {
  const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
  const differenceInMilliseconds = Math.abs(date1 - date2);
  return differenceInMilliseconds / millisecondsPerYear < 1;
}

app.get("/api/generateKey/:username", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const licenseKey = generateLicenseKey(25); // Generate a license key of length 20

    const username = req.params.username;

    if (!username) {
      res.status(400).json({ mBoolean: true, message: "Username is required" });
      return;
    }

    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM users WHERE licenseKey = ?`,
      [licenseKey]
    );

    if (rows[0].count === 0) {
      const [result] = await connection.query(
        `UPDATE users SET licenseKey=?, virus_total=0, the_phish=0, sms_whatsapp_phishing=0, payment_date=NULL WHERE username=? AND licenseKey IS NULL`,
        [licenseKey, username]
      );

      if (result.affectedRows === 0) {
        res
          .status(400)
          .json({ message: "License key already generated", mBoolean: false });
      } else {
        res.status(200).json({
          message: "License key successfully generated",
          mBoolean: false,
          licenseKey,
        });
      }
    } else {
      res
        .status(400)
        .json({ mBoolean: true, message: "Try again, key could not generate" });
    }
  } catch (error) {
    console.error("Error generating license key:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

app.post("/api/activateKey", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { username, licenseKey } = req.body;
    const paymentDate = createDate();

    if (!username || !licenseKey) {
      res.status(400).json({ mBoolean: true, message: "Enter all the values" });
      return;
    }

    const [result] = await connection.query(
      `UPDATE users SET virus_total=1, the_phish=1, sms_whatsapp_phishing=1, payment_date=? WHERE licenseKey=? AND payment_date IS NULL AND username=?`,
      [paymentDate, licenseKey, username]
    );

    if (result.affectedRows === 0) {
      res.status(400).json({ message: "Invalid license key", mBoolean: true });
    } else {
      res.status(200).json({
        message: "License activated successfully",
        mBoolean: false,
        paymentDate,
      });
    }
  } catch (error) {
    console.error("Error activating license key:", error);
    res.status(500).json({ mBoolean: true, message: "Internal server error" });
  } finally {
    connection.release();
  }
});

app.post("/api/verifyLicense", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { username } = req.body;
    const todayDate = createDate();

    if (!username) {
      res.status(400).json({ mBoolean: true, message: "Enter all the values" });
      return;
    }

    const [results] = await connection.query(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );

    if (results.length === 0 || !results[0].payment_date) {
      res
        .status(400)
        .json({ mBoolean: true, message: "License not activated" });
    } else {
      const paymentDate = results[0].payment_date;
      const isNoYearPass = isDifferenceLessThanOneYear(
        new Date(todayDate),
        new Date(paymentDate)
      );

      if (isNoYearPass) {
        res.status(200).json({ mBoolean: false, message: "Success", results });
      } else {
        await connection.query(
          `UPDATE users SET virus_total=0, the_phish=0, sms_whatsapp_phishing=0, licenseKey=NULL, payment_date=NULL WHERE username=?`,
          [username]
        );
        res.status(400).json({ mBoolean: true, message: "License expired" });
      }
    }
  } catch (error) {
    console.error("Error verifying license key:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

app.delete("/api/deleteKey", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ mBoolean: true, message: "Enter all the values" });
      return;
    }

    await connection.query(
      `UPDATE users SET virus_total=0, the_phish=0, sms_whatsapp_phishing=0, licenseKey=NULL, payment_date=NULL WHERE username=?`,
      [username]
    );

    res
      .status(200)
      .json({ mBoolean: false, message: "Key successfully deleted" });
  } catch (error) {
    console.error("Error deleting key:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

app.get("/api/users", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query("SELECT * FROM users");
    res.json(results);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (username === staticUsername && password === staticPassword) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/adduser", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { username, name } = req.body;

    await connection.query(
      `INSERT INTO users (username, name, virus_total, the_phish, sms_whatsapp_phishing) VALUES (?, ?, 0, 0, 0)`,
      [username, name]
    );

    res
      .status(200)
      .json({ message: "User added successfully", mBoolean: false });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
