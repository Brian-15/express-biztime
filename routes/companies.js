/** Routes for companies of biztime. */

const db = require('../db');
const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();

router.get('/companies', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT code, name FROM companies`
        );
        return res.json({ companies: results.rows });
    }
    
    catch (err) {
        return next(err);
    }
});

router.get('/companies/:code', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`, [req.params.code]);
        
        if (results.rows.length === 0) throw new ExpressError('Error: company not found.', 404);
        return res.json({company: results.rows[0]});
    }

    catch (err) {
        return next(err);
    }
});

router.post('/companies', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        if (!code || !name || !description) {
            throw new ExpressError('Error: Company must include code, name, and data.', 400);
        }

        const results = await db.query(
                `INSERT INTO companies(code, name, description)
                 VALUES ($1, $2, $3)
                 RETURNING code, name, description`,
            [code, name, description]);
        
        
        return res.json({company: results.rows[0]});
    }

    catch (err) {
        return next(err);
    }
});

router.put('/companies/:code', async (req, res, next) => {
    try {
        const {code, name, description} = req.body;

        const result = await db.query(
            `UPDATE companies SET code=$1, name=$2, description=$3
             WHERE code = $4
             RETURNING code, name, description`,
            [code, name, description, req.params.code]
        );

        if (result.rows.length === 0) throw new ExpressError('Error: company not found.', 404);

        return res.json({ company: result.rows[0] })
    }

    catch (err) {
        return next(err);
    }
});

router.delete('/companies/:code', async (req, res, next) => {
    try {
        const result = await db.query(
            `DELETE FROM companies WHERE code = $1`,
            [req.params.code]
        );

        if (result.rows.length === 0) throw new ExpressError('Error: company not found.', 404);

        return res.json({ message: 'Deleted' });
    }

    catch (err) {
        return next(err);
    }
});

module.exports = router;