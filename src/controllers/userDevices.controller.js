const db = require("../config/db");

// GET API for user_devices
const getUserDevices = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM user_devices");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST API for user_devices - Create or Update
const updateUserDevice = async (req, res) => {
  const { id, device_id, ip_address, user_agent, last_seen_at } = req.body;

  try {
    let result;

    if (id) {
      // Update existing user device
      result = await db.query(
        "UPDATE user_devices SET device_id = $1, ip_address = $2, user_agent = $3, last_seen_at = $4 WHERE id = $5 RETURNING *",
        [device_id, ip_address, user_agent, last_seen_at, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "User device not found" });
      }
    } else {
      // Create new user device
      result = await db.query(
        "INSERT INTO user_devices (device_id, ip_address, user_agent, last_seen_at) VALUES ($1, $2, $3, $4) RETURNING *",
        [device_id, ip_address, user_agent, last_seen_at]
      );
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getUserDevices,
  updateUserDevice,
};
