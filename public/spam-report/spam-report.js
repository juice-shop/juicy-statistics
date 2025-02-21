const fs = require("fs");
const fetch = require("node-fetch");

require('dotenv').config();

// Use this one
const GITHUB_TOKEN = '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';

// Or create your own token
// Set up a fine-grained personal access token (PAT) with the Juice Shop repository and metadata permission set to read-only
// const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const REPO_OWNER = "juice-shop";
const REPO_NAME = "juice-shop";
const LABEL = "spam";
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const sinceDate = thirtyDaysAgo.toISOString();

async function fetchSpamData() {
  let spamIssues = [];
  let spamPRs = [];
  let page = 1;

  try {
    while (true) {
      const response = await fetch(
        `${GITHUB_API_URL}?labels=${LABEL}&state=closed&since=${sinceDate}&per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.length === 0) break; 

      data.forEach((item) => {
        if (item.pull_request) {
          spamPRs.push(item);
        } else {
          spamIssues.push(item);
        }
      });

      page++; 
    }

    const totalSpamPRs = spamPRs.length;
    const totalSpamIssues = spamIssues.length;

    fs.writeFileSync("spam-prs.json", JSON.stringify(spamPRs, null, 2));
    fs.writeFileSync("spam-issues.json", JSON.stringify(spamIssues, null, 2));

    console.log(`✅ Found ${totalSpamPRs} spam PRs and ${totalSpamIssues} spam issues in the last 30 days.`);
    return { totalSpamPRs, totalSpamIssues };
  } catch (error) {
    console.error("❌ Error fetching spam data:", error.message);
    process.exit(1);
  }
}

fetchSpamData();
