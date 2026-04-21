const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    try {
      const dataToValidate =
        source === "body"
          ? req.body
          : source === "query"
            ? req.query
            : req.params;
      const parsed = schema.parse(dataToValidate);

      if (source === "body") {
        req.body = parsed;
      } else if (source === "query") {
        req.query = parsed;
      } else {
        req.params = parsed;
      }

      next();
    } catch (error) {
      return next(error);
    }
  };

module.exports = validate;
