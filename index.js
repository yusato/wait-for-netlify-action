const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

const waitForUrl = async (url, MAX_TIMEOUT, { headers }) => {
  const iterations = MAX_TIMEOUT / 2;
  for (let i = 0; i < iterations; i++) {
    try {
      await axios.get(url, { headers });
      return;
    } catch (e) {
      console.log("Url unavailable, retrying...");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  core.setFailed(`Timeout reached: Unable to connect to ${url}`);
};

const run = async () => {
  try {
    const PR_NUMBER = github.context.payload.number;
    if (!PR_NUMBER) {
      core.setFailed(
        "Action must be run in conjunction with the `pull_request` event"
      );
    }
    const MAX_TIMEOUT = Number(core.getInput("max_timeout")) || 60;
    const siteName = core.getInput("site_name");
    const basePath = core.getInput("base_path");
    if (!siteName) {
      core.setFailed("Required field `site_name` was not provided");
    }
    const urlType = core.getInput("url_type") || 'pr_number';
    if (!['pr_number', 'hash'].includes(urlType)) {
      core.setFailed("`url_type` must be pr_number or hash");
    }
    const prefix = urlType === 'pr_number' ? `deploy-preview-${PR_NUMBER}` : github.context.payload.after;


    const url = `https://${prefix}--${siteName}.netlify.app${basePath}`;
    console.log('==============')
    console.log(prefix)
    console.log(url)


    core.setOutput("url", url);

    const extraHeaders = core.getInput("request_headers");
    const headers = !extraHeaders ? {} : JSON.parse(extraHeaders)
    console.log(`Waiting for a 200 from: ${url}`);
    // await waitForUrl(url, MAX_TIMEOUT, {
    //   headers,
    // });
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
