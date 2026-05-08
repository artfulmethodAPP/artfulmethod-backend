"use strict";

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3.config");

/**
 * Generates a fresh presigned URL for any S3 key, valid for 1 hour.
 * @param {string} key  e.g. "audio/uuid.mp3" or "reports/uuid.pdf"
 * @returns {Promise<string>}
 */
const getPresignedUrl = (key) => {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    }),
    { expiresIn: 60 * 60 },
  );
};

module.exports = { getPresignedUrl };
