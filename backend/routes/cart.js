const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

router.post("/checkout", async (req, res) => {
  const client = await pool.connect();
  try {
    const { session_id, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    await client.query("BEGIN");

    // ── เช็ค stock ก่อนทุก item ──
    for (const item of items) {
      const stockResult = await client.query(
        "SELECT stock, name FROM products WHERE id = $1 FOR UPDATE",
        [item.product_id]
      );

      if (stockResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Product ID ${item.product_id} not found` });
      }

      const available = stockResult.rows[0].stock;
      const productName = stockResult.rows[0].name;

      if (available < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `"${productName}" เหลือแค่ ${available} ชิ้น`
        });
      }
    }

    // ── คำนวณ total ──
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // ── สร้าง order ──
    const orderResult = await client.query(
      "INSERT INTO orders (session_id, total) VALUES ($1, $2) RETURNING id",
      [session_id || "guest", total]
    );
    const orderId = orderResult.rows[0].id;

    // ── insert order items + ลด stock ──
    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );
      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, order_id: orderId, total });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  } finally {
    client.release();
  }
});

module.exports = router;