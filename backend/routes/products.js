const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// GET /api/products - list with optional filters
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      min_price,
      max_price,
      sort = "id",
      order = "ASC",
    } = req.query;

    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (category) {
      query += ` AND c.slug = $${idx++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.brand ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    if (min_price) {
      query += ` AND p.price >= $${idx++}`;
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      query += ` AND p.price <= $${idx++}`;
      params.push(parseFloat(max_price));
    }

    const allowedSort = ["id", "price", "name", "created_at"];
    const allowedOrder = ["ASC", "DESC"];
    const safeSort = allowedSort.includes(sort) ? sort : "id";
    const safeOrder = allowedOrder.includes(order.toUpperCase())
      ? order.toUpperCase()
      : "ASC";

    query += ` ORDER BY p.${safeSort} ${safeOrder}`;

    const result = await pool.query(query, params);
    res.json({ products: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products - create new product
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
      brand,
      specs,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url, brand, specs)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        description,
        price,
        stock || 0,
        category_id || null,
        image_url || "",
        brand || "",
        specs ? JSON.stringify(specs) : null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/products/:id - update product
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
      brand,
      specs,
    } = req.body;

    // Check if product exists
    const checkResult = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [id],
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const result = await pool.query(
      `UPDATE products
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           stock = COALESCE($5, stock),
           category_id = COALESCE($6, category_id),
           image_url = COALESCE($7, image_url),
           brand = COALESCE($8, brand),
           specs = COALESCE($9, specs)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        name,
        description,
        price,
        stock,
        category_id,
        image_url,
        brand,
        specs ? JSON.stringify(specs) : null,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/products/:id - delete product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
