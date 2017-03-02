const cheerio = require('cheerio');
const request = require('request');
const fs      = require('fs');

let index        = 1,
    links        = [],
    crawledLinks = [],
    concurrency  = 5,
    limit        = [];


let fetchAllLinks = (links,maxLimit) => {
      if(maxLimit == 0) 
         return;
      for(;index < concurrency + 1;index++) {
      	   
      	   getLinks(links[index],maxLimit);
      	   
      	   if(index == 0) {
                break;
      	   }
     }    
};

let getLinks = (url,maxLimit) => {
    
      maxLimit = maxLimit || concurrency;

      if(! url) {
      	 return; 
      }
      
      if(links.length < index) {
          console.log(index);
      	  return;
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

          //console.log(urls);

          $(urls).each((index,ele) => {
               
               let aLink = $(ele).attr('href');

               if(crawledLinks[aLink] !== 1) {
                  if(limit[url] < maxLimit) {
                  	   links.push(aLink);
                  	   crawledLinks[aLink] = 1;
                  	   limit[aLink] = limit[url] + 1; 
                  }     
               } 
          });

          index = index + 1;
          
          if(limit > links.length) {
          	   return;
          }

          setTimeout(function() { 
          	  getLinks(links[index],maxLimit);
          },1000);

      });

};

let webUrl = "https://www.medium.com";

links.push(webUrl);

crawledLinks[webUrl] = 1;

maxLimit = 1;

limit[webUrl] = 0;

if(maxLimit == 0) {
    console.log("Done!");
	return;
}

request(webUrl,(err,res,body) => {

	    if(err) {
          	console.log(err);
         }

          $ = cheerio.load(body);

          urls = $('a','body');

          $(urls).each((index,ele) => {
               
               let aLink = $(ele).attr('href');

               if(crawledLinks[aLink] !== 1) {
                  
                  if(limit[webUrl] < maxLimit) {
                  	   links.push(aLink);
                  	   crawledLinks[aLink] = 1;
                  	   limit[aLink] = limit[webUrl] + 1; 
                  }     
               
               } 
          });
      
      fetchAllLinks(links,maxLimit);

});