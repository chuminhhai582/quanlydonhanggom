-- Migration 0005: Add reference_images_notes to orders
ALTER TABLE orders ADD COLUMN reference_images_notes TEXT[] DEFAULT '{}';
