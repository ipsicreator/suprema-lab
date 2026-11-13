const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');
module.exports=async function browserSmoke({base,adminCookie,workbook}){
 const puppeteer=require('puppeteer');
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.TEST_BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',timeout:20000});
 try{
  const page=await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request',request=>{const url=request.url();if(url.startsWith(base)||url.startsWith('data:')||url.startsWith('blob:'))void request.continue();else void request.abort();});
  await page.setViewport({width:1440,height:1000});
  await page.setCookie({name:'authjs.session-token',value:adminCookie.slice('authjs.session-token='.length),url:base,httpOnly:true,sameSite:'Lax'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const click=async text=>{const buttons=await page.$$('button');for(const b of buttons)if((await b.evaluate(e=>e.textContent)).trim()===text){await b.click();return;}throw Error('Button missing: '+text);};
  for(const route of ['/intro','/admin','/diagnosis','/diagnosis/step1','/diagnosis/step2','/diagnosis/step3','/ipsidna-prism']){
   console.log('UI route:',route);const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,route);await page.waitForSelector('main, h1, h2, h3');
  }
  await page.goto(base+'/admin/admissions',{waitUntil:'domcontentloaded'});
  const fileInput=await page.waitForSelector('input[type=file]');await fileInput.uploadFile(workbook);
  await page.waitForFunction(()=>document.querySelector('select')?.value==='전체');await click('검증 및 미리보기');
  await page.waitForFunction(()=>document.querySelector('#preview-title')||document.querySelector('[role=alert]'),{timeout:30000});
  const previewError=await page.$eval('[role=alert]',e=>e.textContent).catch(()=>'');
  if(previewError)throw Error('Browser preview failed: '+previewError);
  assert.ok(await page.$eval('body',e=>e.innerText.includes('26,410')));
  await page.click('input[type=checkbox]');await click('서비스에 전체 반영');
  await page.waitForFunction(()=>document.body.innerText.includes('입시 데이터가 서비스에 반영되었습니다.'),{timeout:30000});
  const output=path.resolve('outputs','qa');await fs.mkdir(output,{recursive:true});await page.screenshot({path:path.join(output,'admin-admissions.png'),fullPage:true});
  await page.evaluate(()=>sessionStorage.setItem('suprema_user_info',JSON.stringify({studentName:'검증 학생',schoolName:'검증 고등학교',grade:'고3',studentIndex:2.5,gradingSystem:'9-level',careerHint:'수학'})));
  await page.goto(base+'/diagnosis/step4',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('select')?.options.length>2);
  for(const [index,value] of [[0,'DGIST'],[1,'기초학부'],[2,'학생부종합'],[3,'일반전형']]){
   await page.waitForFunction((i,v)=>Array.from(document.querySelectorAll('select')[i]?.options||[]).some(o=>o.value===v),{},index,value);
   const selects=await page.$$('select');await selects[index].select(value);
  }
  await click('진단 실행');await page.waitForFunction(()=>document.body.innerText.includes('선택한 전형의 실제 입결 근거로 진단했습니다.'),{timeout:30000});
  assert.ok(await page.$eval('body',e=>e.innerText.includes('2026학년도')));
  await page.screenshot({path:path.join(output,'diagnosis-step4.png'),fullPage:true});
  const actualSnapshot=await page.evaluate(()=>sessionStorage.getItem('suprema_diagnosis_report_v1'));assert.ok(actualSnapshot,'Actual diagnosis must be saved for report viewing');
  const print=await page.$$('button');for(const b of print)if((await b.evaluate(e=>e.textContent)).trim()==='인쇄')assert.equal(await b.evaluate(e=>e.disabled),false);
  const selects=await page.$$('select');await selects[0].select('');
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()==='인쇄'&&b.disabled));
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('suprema_diagnosis_report_v1')),null,'Edited target must invalidate stored report');
  await page.goto(base+'/report',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.innerText.includes('진단 결과가 없습니다')||document.body.innerText.includes('진단 결과가 아직')||document.body.innerText.includes('진단을 완료'));
  assert.equal(await page.$eval('body',e=>e.innerText.includes('김수프')),false);
  await page.evaluate(snapshot=>sessionStorage.setItem('suprema_diagnosis_report_v1',snapshot),actualSnapshot);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.innerText.includes('검증 학생'));
  await page.screenshot({path:path.join(output,'actual-report.png'),fullPage:true});
  assert.deepEqual(errors,[],'Unhandled browser errors');
  console.log('PASS: browser core routes, administrator Excel preview/publish, actual step4 target selection/diagnosis, edited-result invalidation; no page errors');
 }finally{await browser.close();}
};
