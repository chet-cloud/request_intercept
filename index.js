const fse = require('fs-extra');
const puppeteer = require('puppeteer');


(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://livingat300main.ca/');

    const urls = []
    await page.setRequestInterception(true)
    await page.on('request', async function (request) {
        console.log("--->" + request.url())
        urls.push(request.url())
        request.continue()
    })

    await page.on('response', async function (response) {
       // Filter those responses that are interesting
       const data = await response.buffer()
       // data contains the img information
       console.log("<----" + response.url())
    })

    

    // await page.setRequestInterception(true);
    // page.on('request', async (req) => {
    //     // handle the request by responding data that you stored in SOMEWHERE_TO_STORE
    //     // and of course, don't forget THE_FILE_TYPE
    //     req.respond({
    //         status: 200,
    //         contentType: THE_FILE_TYPE,
    //         body: await fse.readFile(SOMEWHERE_TO_STORE),
    //     });
    // });

  //await browser.close();
})();

