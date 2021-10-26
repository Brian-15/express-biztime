/** Invoice routes for biztime database orm */

const db = require('../db');
const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');

router.get('/invoices', async (req, res, next) => {
    try {
        const results = await db.query('SELECT id, comp_code FROM invoices');
        return res.json({invoices: results.rows});
    }

    catch (err) {
        return next(err);
    }
});

router.get('/invoices/:id', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT * FROM invoices
             JOIN companies ON companies.code = comp_code
             WHERE id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) throw new ExpressError('Error: invoice not found.', 404);

        const { id, amt, paid, add_date, paid_date, code, name, description } = result.rows[0];

        return res.json({
            invoice: {
                id, amt, paid, add_date, paid_date,
                company: { code, name, description }
            }
        });
    }

    catch (err) {
        return next(err);
    }

});

router.post('/invoices', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        if (!comp_code || !amt) {
            throw new ExpressError('Error: invoice must contain comp_code and amt.', 400);
        }

        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING *`,
            [comp_code, amt]
        );

        return res.json({ invoice: result.rows[0] });
    }

    catch (err) {
        return next(err);
    }
});

router.put('/invoices/:id', async (req, res, next) => {
    try {
        const { amt } = req.body;
        if (!amt) throw new ExpressError('Error: must specify amount to update.');

        const result = await db.query(
            `UPDATE invoices SET amt=$1
             WHERE id = $2
             RETURNING *`,
            [ amt, req.params.id ]
        );

        return res.json({ invoice: result.rows[0] });
    }

    catch (err) {
        return next(err);
    }
});

router.delete('/invoices/:id', async (req, res, next) => {
    try {
        const result = await db.query(
            `DELETE FROM invoices
             WHERE id=$1
             RETURNING id`,
            [ req.params.id ]
        )

        if (result.rows.length === 0) {
            throw new ExpressError('Error: Could not find invoice.', 404);
        }

        return res.json({ status: 'deleted' });
    }

    catch (err) {
        return next(err);
    }
});


module.exports = router;