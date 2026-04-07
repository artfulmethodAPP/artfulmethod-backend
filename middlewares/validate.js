const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    try {
      if (source === "body" && req.body.questions !== undefined) {
        if (req.body.questions === "" || req.body.questions === null) {
          delete req.body.questions;
        } else if (Array.isArray(req.body.questions)) {
          return res.status(400).json({
            success: false,
            message:
              "questions must be an object like {\"1\":\"hello q1\",\"2\":\"hello q2\"}",
          });
        } else if (
          typeof req.body.questions === "object" &&
          req.body.questions !== null
        ) {
          req.body.questions = Object.fromEntries(
            Object.entries(req.body.questions)
              .map(([key, question]) => [
                key,
                typeof question === "string" ? question.trim() : question,
              ])
              .filter(([, question]) => question !== ""),
          );
        } else if (typeof req.body.questions === "string") {
          const rawQuestions = req.body.questions.trim();

          if (!rawQuestions) {
            delete req.body.questions;
          } else {
            try {
              const parsedQuestions = JSON.parse(rawQuestions);

              if (
                typeof parsedQuestions === "object" &&
                !Array.isArray(parsedQuestions) &&
                parsedQuestions !== null
              ) {
                req.body.questions = Object.fromEntries(
                  Object.entries(parsedQuestions)
                    .map(([key, question]) => [
                      key,
                      typeof question === "string" ? question.trim() : question,
                    ])
                    .filter(([, question]) => question !== ""),
                );
              } else {
                return res.status(400).json({
                  success: false,
                  message:
                    "questions must be an object like {\"1\":\"hello q1\",\"2\":\"hello q2\"}",
                });
              }
            } catch {
              return res.status(400).json({
                success: false,
                message: "questions must be a valid JSON object string",
              });
            }
          }
        }
      }

      const dataToValidate = source === "body" ? req.body : req.query;
      const parsed = schema.parse(dataToValidate);

      if (source === "body") {
        req.body = parsed;
      } else {
        req.query = parsed;
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.errors?.[0]?.message || "Validation failed",
        errors: error.errors,
      });
    }
  };

module.exports = validate;
