const cheerio = require('cheerio');
const request = require('request');
const fs      = require('fs');
const helpers = require('./util/helpers');
const async   = require('async');

let crawledLinks = [],
    concurrency  = 5,
    limit        = []; 

let q = async.queue((task, cb) => {  
     
       url      = task.url,
       maxLimit = task.maxLimit;

       if(! url) {
       	  cb();
       }

       if(maxLimit < limit[url]) {
       	   return;
       }

       fs.appendFile('urls.csv',url + '\n',(err) => {
           if(err) {
           	  console.log(err);
           }
      });

       request(url,(err,res,body) => {
             
          if(err) {
          	console.log(err);
          }

          $ = cheerio.load(body);

          urls = $('a','body');

          $(urls).each((index,ele) => {
              
              let aLink = $(ele).attr('href');
             
             if(helpers.checkValidUrl(aLink)) { 
              if (crawledLinks[aLink] !== 1) {
     	       if(aLink !== undefined) {
	             if (limit[url] < maxLimit) {
				q.push({
					url      : aLink,
					maxLimit : maxLimit
				},(err) => { console.log(err); });
				crawledLinks[aLink] = 1;
			    limit[aLink]        = limit[url] + 1;
			  }
		    }
	      }
         }
        }); 
         
         setTimeout(function() { 
          	 cb();
          },1000);   

    });

}, 5);

q.drain = () => { console.log("All Links added Successfully!"); }

let webUrl = 'https://www.medium.com/';

var maxLimit = maxLimit || 5;

crawledLinks[webUrl] = 1;

limit[webUrl]   = 0;

fs.writeFile('urls.csv', '', (err) => {
	if (err) return console.log(err);
});

q.push({
	url      : webUrl,
	maxLimit : maxLimit
});