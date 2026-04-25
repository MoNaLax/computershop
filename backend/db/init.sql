-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  "order" INTEGER DEFAULT 0
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  image_url VARCHAR(500),
  brand VARCHAR(100),
  specs JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(200),
  total NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  price NUMERIC(10,2)
);

-- Seed Categories
INSERT INTO categories (name, slug, "order") VALUES
  ('CPU & Processors', 'cpu', 1),
  ('Motherboards', 'motherboard', 2),
  ('Graphics Cards', 'gpu', 3),
  ('Memory (RAM)', 'ram', 4),
  ('Storage', 'storage', 5),
  ('Power Supplies', 'psu', 6),
  ('Cooling', 'cooling', 7),
  ('Cases & Chassis', 'cases', 8),
  ('Monitor', 'monitor', 9)
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
INSERT INTO products (name, description, price, stock, category_id, image_url, brand, specs) VALUES
  ('AMD Ryzen 9 7950X', 'Flagship 16-core desktop processor with Zen 4 architecture. Exceptional multi-threaded performance for content creation and gaming.', 52990, 15, 1, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500', 'AMD', '{"cores": 16, "threads": 32, "base_clock": "4.5 GHz", "boost_clock": "5.7 GHz", "tdp": "170W", "socket": "AM5"}'),
  ('Intel Core i9-14900K', 'Intel''s most powerful consumer processor with 24 cores. Dominates in gaming and professional workloads.', 19990, 20, 1, 'https://images.unsplash.com/photo-1555617766-c94804975da7?w=500', 'Intel', '{"cores": 24, "threads": 32, "base_clock": "3.2 GHz", "boost_clock": "6.0 GHz", "tdp": "125W", "socket": "LGA1700"}'),
  ('AMD Ryzen 5 7600X', 'Mid-range powerhouse for gamers. Best price-to-performance ratio in the AM5 lineup.', 8990, 35, 1, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500', 'AMD', '{"cores": 6, "threads": 12, "base_clock": "4.7 GHz", "boost_clock": "5.3 GHz", "tdp": "105W", "socket": "AM5"}'),
  ('NVIDIA RTX 4090', 'The ultimate gaming GPU. 24GB GDDR6X memory with Ada Lovelace architecture. Unmatched 4K performance.', 62990, 8, 2, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500', 'NVIDIA', '{"vram": "24GB GDDR6X", "cuda_cores": 16384, "boost_clock": "2.52 GHz", "tdp": "450W", "ports": "3x DP 1.4a, 1x HDMI 2.1"}'),
  ('NVIDIA RTX 4070 Ti Super', 'High-end GPU for 1440p and 4K gaming. Excellent ray tracing and DLSS 3.5 support.', 29990, 18, 2, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500', 'NVIDIA', '{"vram": "16GB GDDR6X", "cuda_cores": 8448, "boost_clock": "2.61 GHz", "tdp": "285W"}'),
  ('AMD Radeon RX 7800 XT', 'Mid-high range GPU delivering outstanding 1440p performance at an accessible price point.', 17990, 25, 2, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500', 'AMD', '{"vram": "16GB GDDR6", "stream_processors": 3840, "boost_clock": "2.43 GHz", "tdp": "263W"}'),
  ('Corsair Dominator Titanium 32GB DDR5', 'Premium 32GB (2x16GB) DDR5-6000 kit with titanium heatspreader. Top-tier speed for AMD and Intel platforms.', 6990, 40, 3, 'https://images.unsplash.com/photo-1562976540-1502c2145851?w=500', 'Corsair', '{"capacity": "32GB", "type": "DDR5", "speed": "6000MHz", "latency": "CL30", "voltage": "1.4V"}'),
  ('G.Skill Trident Z5 RGB 64GB DDR5', 'Ultra-fast 64GB DDR5 for workstations and extreme builds. RGB lighting with precision tuning.', 12990, 20, 3, 'https://images.unsplash.com/photo-1562976540-1502c2145851?w=500', 'G.Skill', '{"capacity": "64GB", "type": "DDR5", "speed": "6400MHz", "latency": "CL32"}'),
  ('Samsung 990 Pro 2TB NVMe', 'PCIe 4.0 NVMe SSD with industry-leading sequential read speeds. Perfect for OS and application storage.', 5990, 50, 4, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500', 'Samsung', '{"capacity": "2TB", "interface": "PCIe 4.0 NVMe", "read_speed": "7450 MB/s", "write_speed": "6900 MB/s", "form_factor": "M.2 2280"}'),
  ('WD Black SN850X 1TB', 'High-performance PCIe 4.0 NVMe designed for gaming. Game Mode 2.0 for optimized loading times.', 3490, 45, 4, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500', 'Western Digital', '{"capacity": "1TB", "interface": "PCIe 4.0 NVMe", "read_speed": "7300 MB/s", "write_speed": "6600 MB/s"}'),
  ('ASUS ROG Maximus Z790 Hero', 'Flagship Z790 motherboard for Intel Core 14th gen. Extreme overclocking support and premium I/O.', 21990, 12, 5, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500', 'ASUS', '{"socket": "LGA1700", "chipset": "Z790", "memory_slots": 4, "max_memory": "192GB DDR5", "pcie_slots": "3x PCIe 5.0"}'),
  ('MSI MEG X670E ACE', 'Top-tier AM5 motherboard with PCIe 5.0 support. Built for Ryzen 7000 series processors.', 19990, 10, 5, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500', 'MSI', '{"socket": "AM5", "chipset": "X670E", "memory_slots": 4, "max_memory": "192GB DDR5"}'),
  ('Corsair RM1000x 1000W 80+ Gold', 'Fully modular 1000W PSU with 80+ Gold efficiency. Zero RPM fan mode for silent operation.', 5490, 30, 6, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500', 'Corsair', '{"wattage": 1000, "efficiency": "80+ Gold", "modular": "Full", "fan_size": "135mm", "warranty": "10 years"}'),
  ('be quiet! Dark Power 13 850W', 'Ultra-quiet 850W PSU for silent builds. Titanium efficiency with advanced voltage regulation.', 7990, 15, 6, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500', 'be quiet!', '{"wattage": 850, "efficiency": "80+ Titanium", "modular": "Full", "noise": "<18.9 dB"}'),
  ('Noctua NH-D15 G2', 'Legendary dual-tower CPU cooler. The new G2 revision offers even better performance with AMD and Intel.', 3990, 25, 7, 'https://images.unsplash.com/photo-1555617766-c94804975da7?w=500', 'Noctua', '{"type": "Air Cooler", "fan_size": "2x 150mm", "tdp_support": "up to 280W", "height": "168mm"}'),
  ('NZXT Kraken Elite 360', 'Premium 360mm AIO liquid cooler with LCD display. Excellent performance for flagship CPUs.', 8990, 18, 7, 'https://images.unsplash.com/photo-1555617766-c94804975da7?w=500', 'NZXT', '{"type": "AIO Liquid", "radiator": "360mm", "fans": "3x 120mm", "display": "2.36\" LCD"}'),
  ('Lian Li PC-O11 Dynamic EVO', 'Iconic dual-chamber case with exceptional airflow and aesthetics. Fits large AIOs and multi-GPU setups.', 4990, 22, 8, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500', 'Lian Li', '{"form_factor": "Mid Tower", "motherboard": "E-ATX/ATX/mATX", "drive_bays": "6x 2.5\"+2x 3.5\"", "max_gpu": "420mm"}'),
  ('Fractal Design Torrent', 'High-airflow case prioritizing cooling performance. Massive front and bottom intake fans included.', 5490, 16, 8, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500', 'Fractal Design', '{"form_factor": "Mid Tower", "included_fans": "2x 180mm + 3x 140mm", "max_cpu_cooler": "188mm"}'
);
