"use strict";
require("dotenv").config();
require("encoding");
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");

//setup sendinblue client
var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const router = express.Router();

//add json parsing middleware
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/**
 * Creates an smtp email object for sending
 * @param {*} contactForm The contact form request body containing email, fullname, subject and message properties
 */
const composeEmail = (contactForm) => {
  const { Email, FullName, Subject, Message } = contactForm;

  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  const sendingEmail = process.env.SENDINBLUE_TO_EMAIL_ADDRESS;

  sendSmtpEmail.to = [
    {
      email: sendingEmail,
      name: process.env.SENDINBLUE_TO_NAME,
    },
  ];
  sendSmtpEmail.sender = {
    email: sendingEmail,
    name: sendingEmail,
  };
  sendSmtpEmail.htmlContent = `Email: ${Email}. FullName: ${FullName}. Message: ${Message}`;
  sendSmtpEmail.subject = Subject;

  return sendSmtpEmail;
};

/**
 * Sends email using SendInBlue API
 */
router.post("/sendEmail", async (req, res) => {
  var apiInstance = new SibApiV3Sdk.SMTPApi();

  var sendSmtpEmail = composeEmail(req.body);

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      return res.json("email sent successfully");
    },
    function (error) {
      return res.json(error);
    }
  );
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
