/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const LABEL = "spam";
const GITHUB_API_URL = `https://api.github.com/repos/juice-shop/juice-shop/issues`;
const HISTORY_FILE = path.join(
  __dirname,
  "..",
  "statsData",
  "spam-report.json"
);

const getDateString = (date) => {
  return date.toISOString().split("T")[0];
};

const collectData = async (date) => {
  const startDate = new Date(date);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setUTCHours(23, 59, 59, 999);

  let spamIssues = [];
  let spamPRs = [];
  let page = 1;

  const headers = {
    Accept: "application/vnd.github.v3+json",
  };

  while (true) {
    const response = await fetch(
      `${GITHUB_API_URL}?labels=${LABEL}&state=closed&since=${startDate.toISOString()}&until=${endDate.toISOString()}&per_page=100&page=${page}`,
      { headers }
    );

    const data = await response.json();
    if (data.length === 0) break;

    data.forEach((item) => {
      const closedDate = new Date(item.closed_at);
      if (closedDate >= startDate && closedDate <= endDate) {
        if (item.pull_request) {
          spamPRs.push(item);
        } else {
          spamIssues.push(item);
        }
      }
    });

    page++;
  }

  return {
    date: getDateString(startDate),
    totalSpamPRs: spamPRs.length,
    totalSpamIssues: spamIssues.length,
  };
};

const fetchData = async () => {
  let history = {};

  history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));

  const today = new Date();
  const todayString = getDateString(today);
  const dailyData = await collectData(today);
  if (dailyData) {
    history[todayString] = dailyData;
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    console.log(`Added data for ${todayString}`);
  }

  return history;
};

module.exports = {
  collectData,
  fetchData,
};
