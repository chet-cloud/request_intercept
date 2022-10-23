'use strict';

const puppeteer = require('puppeteer');
const request_client = require('request-promise-native');
const fse = require('fs-extra');
const fs = require('fs');
const axios = require('axios');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

function parseURL(request_url){
  const url = new URL(request_url)
  const request_host = url.host
  const request_pathname = url.pathname
  const request_dir = url.pathname.substring(0,url.pathname.lastIndexOf('/'))
  const request_file = url.pathname.substring(url.pathname.lastIndexOf('/')+1)
  const index = request_file.lastIndexOf(".")
  const request_file_type = index > 0 ? request_file.substring(request_file.lastIndexOf(".")+1):""
  return {
    request_url,
    request_host,
    request_pathname,
    request_dir,
    request_file,
    request_file_type
  }
}

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  const result = [];

  await page.setRequestInterception(true);

  await page.on('request', async request => {
    axios.get(request.url()).then(async response => {
      request.continue();
    }).catch(error => {
      console.error(error);
      request.abort();
    });
  });

  await page.on('response', async function (response) {
    // Filter those responses that are interesting
    const response_data = await response.buffer()
    console.log("<----" + response.url())
    await callback({
      ...parseURL(response.url()),
      response_data
    });
 })

  await page.goto('https://livingat300main.ca/', {
    waitUntil: 'networkidle0',
  });

  console.log(JSON.stringify(result.sort()));

  await browser.close();
})();



async function callback({
    request_url,
    request_host,
    request_pathname,
    request_dir,
    request_file,
    request_file_type,
    response_data
  }){

    if(request_host.startsWith("livingat300main.ca")){
        request_pathname = request_pathname==="/"? "index.html" : request_pathname
        //fs.writeFileSync("./cache" + request_pathname,Buffer.from(response_body))
        fse.outputFileSync("./cache/" + request_pathname, response_data)
        //await pipeline(response_data, fs.createWriteStream("./cache/" + request_pathname));
        //fse.outputFileSync("./cache/" + request_pathname, response_data);
    }


}