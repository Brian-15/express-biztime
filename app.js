/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")

app.use(express.json());

const cRoutes = require('./routes/companies');
app.use('/', cRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

app.listen(3000, () => {
  console.log('Server started on 3000');
});

module.exports = app;