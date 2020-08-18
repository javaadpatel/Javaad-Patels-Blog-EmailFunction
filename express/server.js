"use strict";
require("dotenv").config();
require("encoding");
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");
const router = express.Router();

//add json parsing middleware
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/**
 * Sends email using Send In Blue API
 * @param {*} contactForm
 */
const sendEmail = (contactForm) => {
  const { Email, FullName, Subject, Message } = contactForm;
  const sendingEmail = process.env.SENDINBLUE_TO_EMAIL_ADDRESS;
  var options = {
    method: "POST",
    url: "https://api.sendinblue.com/v3/smtp/email",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.SENDINBLUE_API_KEY,
    },
    body: {
      sender: { email: sendingEmail, name: process.env.SENDINBLUE_TO_NAME },
      to: [{ email: sendingEmail, name: sendingEmail }],
      subject: Subject,
      htmlContent: `Email: ${Email}. FullName: ${FullName}. Message: ${Message}`,
    },
    json: true,
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
};

/**
 * Sends email using SendInBlue API
 */
router.post("/sendEmail", async (req, res) => {
  var sendSmtpEmail = sendEmail(req.body);
  return res.json("email sent successfully");
});

//add cors middleware
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/.netlify/functions/server", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
