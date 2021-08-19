const express = require('express');
const morgan = require('morgan');
const db = require('./db');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/products', (req, res) => {
  const count = req.query.count ? Number(req.query.count) : 5;
  const page = req.query.page ? Number(req.query.page) : 1;
  const query = {
    text: `SELECT * FROM products
           ORDER BY id
           LIMIT $1
           OFFSET $2;`,
    values: [count, (page - 1) * count],
  };
  db
    .query(query)
    .then((results) => res.status(200).send(results.rows))
    .catch((error) => {
      console.error(error.stack);
      res.status(400).send(error.stack);
    });
});

app.get('/products/:product_id', (req, res) => {
  const query = {
    text: `SELECT products.id, name, slogan, description, category, default_price,
           array_agg(jsonb_build_object('feature', feature, 'value', value))
             AS features
           FROM products
           INNER JOIN features
           ON products.id = features.product_id
           WHERE products.id = $1
           GROUP BY products.id;`,
    values: [req.params.product_id],
  };
  db
    .query(query)
    .then((results) => res.status(200).send(results.rows))
    .catch((error) => {
      console.error(error.stack);
      res.status(400).send(error.stack);
    });
});

module.exports = app;
