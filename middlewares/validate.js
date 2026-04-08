const AppError = require("../utils/app-error");

const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    try {
      if (source === "body" && req.body.questions !== undefined) {
        if (req.body.questions === "" || req.body.questions === null) {
          delete req.body.questions;
        } else if (Array.isArray(req.body.questions)) {
          return next(
            new AppError(
              "questions must be an object like {\"1\":\"hello q1\",\"2\":\"hello q2\"}",
              400,
              "VALIDATION_ERROR",
            ),
          );
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
                return next(
                  new AppError(
                    "questions must be an object like {\"1\":\"hello q1\",\"2\":\"hello q2\"}",
                    400,
                    "VALIDATION_ERROR",
                  ),
                );
              }
            } catch {
              return next(
                new AppError(
                  "questions must be a valid JSON object string",
                  400,
                  "VALIDATION_ERROR",
                ),
              );
            }
          }
        }
      }

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
