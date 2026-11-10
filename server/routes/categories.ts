import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { DIMENSION_META } from '../db/categories-data.js';

export const categoriesRouter = Router();

/**
 * GET /api/categories
 * Returns the complete 9-dimension hierarchical category system with live vocabulary counts.
 */
categoriesRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.slug,
        c.dimension_code,
        c.dimension_name,
        c.parent_id,
        c.name_si,
        c.name_ta,
        c.name_en,
        c.description_en,
        c.sort_order,
        COUNT(wcr.entry_id)::int AS word_count
      FROM categories c
      LEFT JOIN word_category_relations wcr ON wcr.category_id = c.id
      GROUP BY c.id
      ORDER BY c.dimension_code ASC, c.sort_order ASC, c.name_en ASC
    `);

    const grouped: Record<string, any> = {};
    for (const [code, meta] of Object.entries(DIMENSION_META)) {
      grouped[code] = {
        ...meta,
        categories: [],
        totalWordsInDimension: 0,
      };
    }

    for (const row of result.rows) {
      const dim = row.dimension_code;
      if (grouped[dim]) {
        grouped[dim].categories.push(row);
        grouped[dim].totalWordsInDimension += row.word_count;
      }
    }

    res.json({
      dimensions: Object.values(grouped),
      allCategories: result.rows,
    });
  } catch (err) {
    console.error('[API /categories] Error:', err);
    res.status(500).json({ error: 'Failed to load category hierarchy' });
  }
});

/**
 * POST /api/categories
 * Dynamically expands the category taxonomy with a new category or subcategory.
 */
categoriesRouter.post('/categories', async (req: Request, res: Response) => {
  try {
    const { dimensionCode, nameSi, nameTa, nameEn, descriptionEn, parentId } = req.body || {};
    const dim = String(dimensionCode || 'I').toUpperCase() as keyof typeof DIMENSION_META;
    const dimMeta = DIMENSION_META[dim] || DIMENSION_META.I;

    if (!nameSi || !nameTa || !nameEn) {
      res.status(400).json({ error: 'Sinhala, Tamil, and English category names are required.' });
      return;
    }

    const slug = `${dim.toLowerCase()}-${String(nameEn)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}`;

    const insertRes = await pool.query(
      `INSERT INTO categories (
        slug, dimension_code, dimension_name, parent_id, name_si, name_ta, name_en, description_en, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 999)
      ON CONFLICT (slug) DO UPDATE SET
        name_si = EXCLUDED.name_si,
        name_ta = EXCLUDED.name_ta,
        name_en = EXCLUDED.name_en,
        description_en = EXCLUDED.description_en
      RETURNING *`,
      [slug, dim, dimMeta.nameEn, parentId || null, nameSi, nameTa, nameEn, descriptionEn || null]
    );

    await pool.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor, summary)
       VALUES ('category', $1, 'CREATE_DYNAMIC_CATEGORY', 'ADMIN', $2)`,
      [insertRes.rows[0].id, `Created dynamic category '${nameEn}' (${nameSi} / ${nameTa}) in Dimension ${dim}`]
    );

    res.status(201).json({ category: insertRes.rows[0] });
  } catch (err) {
    console.error('[API POST /categories] Error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});
