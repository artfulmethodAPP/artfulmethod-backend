module.exports = {
  development: {
    username: "root",
    password: "Password!",
    database: "ai_questionnaire_platform",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: null,
    database: "ai_questionnaire_platform_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: null,
    database: "ai_questionnaire_platform_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
