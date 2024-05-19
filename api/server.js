// server.js

const express = require("express");
const mysql = require("mysql2/promise"); // Import mysql2/promise
const cors = require("cors"); // Import the cors middleware
require("dotenv").config({ path: "../.env" });
// import {  } from "";
const { createConnection } = require("mysql2");
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
const connection = createConnection({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

const dbConnect = () => {
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      return;
    }
    console.log("Connected to MySQL database");
  });
};
dbConnect();
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
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate; // Output: 2024-05-18
};

function isDifferenceLessThanOneYear(date1, date2) {
  const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
  const differenceInMilliseconds = Math.abs(date1 - date2);

  const differenceInYears = differenceInMilliseconds / millisecondsPerYear;

  return differenceInYears < 1;
}

app.get("/api/generateKey/:username", async (req, res) => {
  try {
    dbConnect();
    const licenseKey = generateLicenseKey(25); // Generate a license key of length 20

    console.log(licenseKey);

    let username = req.params.username;

    if (!username) {
      res.status(400).json({ mBoolean: true, message: "Username is required" });
      return;
    }

    connection.query(
      `SELECT COUNT(*) FROM users WHERE licenseKey = '${licenseKey}'`,
      (error, results, fields) => {
        if (error) {
          res.status(500).json({
            mBoolean: true,
            message: "Error fetching data from database",
          });

          return;
        } else {
          if (results[0]?.["COUNT(*)"] === 0) {
            connection.query(
              `Update users set licenseKey='${licenseKey}', virus_total=0,the_phish=0,sms_whatsapp_phishing=0, payment_date=NULL where username='${username}' and licenseKey is null`,
              (error, results, fields) => {
                if (error) {
                  res.status(400).json({
                    mBoolean: true,
                    message: "Could not generate, Try again",
                  });

                  return;
                } else {
                  if (results?.affectedRows === 0) {
                    res.status(400).json({
                      message: "License key already generated",
                      mBoolean: false,
                    });
                    return;
                  } else {
                    res.status(200).json({
                      message: "License key successfully generated",
                      mBoolean: false,
                      licenseKey: licenseKey,
                    });

                    return;
                  }
                }
              }
            );
          } else {
            res.status(400).json({
              mBoolean: true,
              message: "Try again, key could generate",
            });

            return;
          }
        }
      }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/activateKey", async (req, res) => {
  try {
    dbConnect();
    if (!req.body.username || !req.body.licenseKey) {
      res.status(400).json({ mBoolean: true, message: "Enter all the values" });
      return;
    }

    let { username, licenseKey } = req.body;
    let paymentDate = createDate();

    connection.query(
      `Update users set virus_total=1,the_phish=1,sms_whatsapp_phishing=1, payment_date='${paymentDate}' where licenseKey='${licenseKey}' and payment_date is NULL and username='${username}'`,
      (error, results, fields) => {
        if (error) {
          res.status(400).json({
            mBoolean: true,
            message: "Internal server error",
          });

          return;
        } else {
          if (results?.affectedRows === 0) {
            res.status(400).json({
              message: "Invalid license key",
              mBoolean: true,
            });
            return;
          } else {
            res.status(200).json({
              message: "License activated successfully",
              mBoolean: false,
              paymentDate,
            });
            return;
          }
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      mBoolean: true,
      message: "Internal server error",
    });
  }
});

app.post("/api/verifyLicense", async (req, res) => {
  try {
    dbConnect();

    if (!req.body.username) {
      res.status(400).json({ mBoolean: true, message: "Enter all the values" });
      return;
    }

    let { username } = req.body;
    let todayDate = createDate();

    connection.query(
      `Select * from users where username = '${username}'`,
      (error, results, fields) => {
        if (error) {
          console.log("1 ", error);
          res.status(500).json({
            mBoolean: true,
            message: "Internal Server Error",
          });

          return;
        } else {
          let paymentDate = results[0]?.payment_date;
          if (!paymentDate) {
            res.status(400).json({
              mBoolean: true,
              message: "License not activated",
            });
            return;
          } else {
            let isNoYearPass = isDifferenceLessThanOneYear(
              new Date(todayDate),
              new Date(paymentDate)
            );

            if (isNoYearPass) {
              res.status(200).json({
                mBoolean: false,
                message: "Success",
                results,
              });
              return;
            } else {
              //id false;
              // licenseKey null
              // paymentdate null

              connection.query(
                `Update users set virus_total=0, the_phish=0, sms_whatsapp_phishing=0, licenseKey=NULL, payment_date=NULL where username='${username}'`,
                (error, results, fields) => {
                  console.log(error);
                  if (error) {
                    res.status(500).json({
                      mBoolean: true,
                      message: "Internal Server Error",
                    });
                    return;
                  } else {
                    res.status(400).json({
                      mBoolean: true,
                      message: "License expired",
                    });
                    return;
                  }
                }
              );
            }
          }
        }
      }
    );
  } catch (error) {
    console.log("2 ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/deleteKey", async (req, res) => {
  try {
    dbConnect();
    if (!req.body.username) {
      res.status(400).json({ mBoolean: true, message: "Enter all the values" });
      return;
    }

    let { username } = req.body;

    connection.query(
      `Update users set virus_total=0, the_phish=0, sms_whatsapp_phishing=0, licenseKey=NULL, payment_date=NULL where username='${username}'`,
      (error, results, fields) => {
        console.log(error);
        if (error) {
          res.status(500).json({
            mBoolean: true,
            message: "Internal Server Error",
          });
          return;
        } else {
          res.status(200).json({
            mBoolean: false,
            message: "Key successfully deleted",
          });
          return;
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    dbConnect();
    connection.query("SELECT * FROM users", (error, results, fields) => {
      if (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Error fetching data from database");
        return;
      }
      res.json(results);
      console.log(results);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to update user data in the database
// app.put("/api/users/:id", async (req, res) => {
//   const { id } = req.params;
//   const { virus_total, the_phish, sms_whatsapp_phishing } = req.body;
//   try {

//     dbConnect()
//     connection.query("SELECT * FROM users", (error, results, fields) => {
//       if (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Error fetching data from database");
//         return;
//       }
//   })

//     const connection = await pool.getConnection();
//     await connection.execute(
//       "UPDATE users SET virus_total=?, the_phish=?, sms_whatsapp_phishing=? WHERE id=?",
//       [virus_total, the_phish, sms_whatsapp_phishing, id]
//     );
//     connection.release();
//     res.json({ message: "User updated successfully" });
//   } catch (error) {
//     console.error("Error updating user:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log(staticUsername, staticPassword);
    // Perform validation against database or static credentials
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

// Endpoint to add a user to the database
app.post("/api/adduser", async (req, res) => {
  const { username, name } = req.body;
  try {
    dbConnect();

    // Execute the query

    connection.query(
      `INSERT INTO users (username, name, virus_total, the_phish, sms_whatsapp_phishing) VALUES ('${username}', '${name}', 0, 0, 0)`,
      (error, results, fields) => {
        if (error) {
          res.status(400).json({ mBoolean: true, message: "Could not add" });
          return;
        }
        res
          .status(200)
          .json({ mBoolean: false, message: "User added successfully" });
      }
    );
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
// Endpoint to delete a user from the database
app.delete("/api/deleteuser/:username", async (req, res) => {
  const { username } = req.params;
  try {
    dbConnect();
    connection.query(
      `DELETE FROM users WHERE username = '${username}'`,
      (error, results, fields) => {
        if (error) {
          console.error("Error executing query:", error);
          res.status(500).send("Error fetching data from database");
          return;
        }
        res.json({ success: true, message: "User deleted successfully" });
      }
    );

    // SQL query to delete a user by username
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// // Function to update user data based on payment date
// async function updateUserStatus() {
//     try {
//         const connection = await pool.getConnection();
//         // Get today's date
//         const today = new Date().toISOString().split('T')[0];

//         // Calculate one year ago from today
//         const oneYearAgo = new Date();
//         oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
//         const oneYearAgoDate = oneYearAgo.toISOString().split('T')[0];

//         // Update users whose payment_date is one year older than today's date
//         const [result] = await connection.execute(
//             'UPDATE users SET the_phish = 0, virus_total = 0, sms_whatsapp_phishing = 0 WHERE payment_date <= ? AND payment_date <= ?',
//             [today, oneYearAgoDate]
//         );
//         connection.release();

//         console.log(`Updated ${result.affectedRows} user(s)`);
//     } catch (error) {
//         console.error('Error updating user status:', error.message);
//     }
// }

// // Run updateUserStatus every day (24 hours)
// setInterval(updateUserStatus, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

// Function to update user data based on payment date
async function updateUserStatus() {
  try {
    const connection = await pool.getConnection();
    // Get today's date
    // const today = new Date().toISOString().split('T')[0];

    // Calculate one year ago from today
    // const oneYearAgo = new Date();
    // oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    // const oneYearAgoDate = oneYearAgo.toISOString().split('T')[0];
    // Calculate 5 seconds from now
    const now = new Date();
    const fiveSecondsFromNow = new Date(now.getTime() + 5 * 1000); // Adding 5 seconds

    // Update users whose payment_date is one year older than today's date
    const [result] = await connection.execute(
      "UPDATE users SET the_phish = 0, virus_total = 0, sms_whatsapp_phishing = 0 WHERE payment_date <= ? AND payment_date <= ?",
      [now, fiveSecondsFromNow]
    );
    connection.release();

    console.log(`Updated ${result.affectedRows} user(s)`);
  } catch (error) {
    console.error("Error updating user status:", error.message);
  }
}

// Run updateUserStatus every day (24 hours)
// setInterval(updateUserStatus, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
// Run updateUserStatus immediately
// updateUserStatus();

// Set timeout to run updateUserStatus again 24 hours later
// const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
// const millisecondsUntilNextRun = nextRun - now;
// setTimeout(updateUserStatus, millisecondsUntilNextRun);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
