import type { ResolvedConsentOptions } from './types';

/**
 * Builds the inline ES5-friendly JavaScript executed immediately in <head>.
 * Sets Google Consent Mode v2 defaults, reads existing cookies synchronously,
 * and sets up window.__acm for dynamic consent application and tag loading.
 */
export function buildHeadScript(options: ResolvedConsentOptions): string {
  const {
    gtmId = '',
    ga4Id = '',
    metaPixelId = '',
    clarityId = '',
    mode,
    revision,
    waitForUpdate,
    adsDataRedaction,
    urlPassthrough,
  } = options;

  const hasGoogle = Boolean(gtmId || ga4Id);
  const hasMeta = Boolean(metaPixelId);
  const hasClarity = Boolean(clarityId);

  // Note: Plain ES5 syntax without external imports for head-inline execution
  return `(function(){
var mode=${JSON.stringify(mode)};
var gtmId=${JSON.stringify(gtmId)};
var ga4Id=${JSON.stringify(ga4Id)};
var metaPixelId=${JSON.stringify(metaPixelId)};
var clarityId=${JSON.stringify(clarityId)};
var rev=${revision};
var gLoaded=false;
var metaLoaded=false;
var clLoaded=false;

function getHead(){return document.head||document.getElementsByTagName('head')[0]||document.documentElement;}

function loadGoogle(){
  if(gLoaded)return;
  gLoaded=true;
  var s=document.createElement('script');
  s.async=true;
  if(gtmId){
    window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
    s.src='https://www.googletagmanager.com/gtm.js?id='+gtmId;
  }else if(ga4Id){
    s.src='https://www.googletagmanager.com/gtag/js?id='+ga4Id;
    window.gtag('js',new Date());
    window.gtag('config',ga4Id);
  }
  getHead().appendChild(s);
}

function loadMeta(){
  if(metaLoaded||!metaPixelId)return;
  metaLoaded=true;
  (function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=true;t.src=v;
    s=getHead();s.appendChild(t);
  })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init',metaPixelId);
  window.fbq('track','PageView');
}

function loadClarity(){
  if(clLoaded||!clarityId)return;
  clLoaded=true;
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=getHead();y.appendChild(t);
  })(window,document,"clarity","script",clarityId);
}

${
  hasGoogle
    ? `window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments);};
window.gtag('consent','default',{
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  personalization_storage:'denied',
  functionality_storage:'granted',
  security_storage:'granted',
  wait_for_update:${waitForUpdate}
});
${adsDataRedaction ? `window.gtag('set','ads_data_redaction',true);` : ''}
${urlPassthrough ? `window.gtag('set','url_passthrough',true);` : ''}`
    : ''
}

window.__acm={
  apply:function(cats){
    cats=cats||[];
    var an=cats.indexOf('analytics')!==-1;
    var mk=cats.indexOf('marketing')!==-1;

    ${
      hasGoogle
        ? `if(window.gtag){
      window.gtag('consent','update',{
        analytics_storage:an?'granted':'denied',
        ad_storage:mk?'granted':'denied',
        ad_user_data:mk?'granted':'denied',
        ad_personalization:mk?'granted':'denied',
        personalization_storage:mk?'granted':'denied'
      });
    }
    if(mode==='advanced'||an||mk){
      loadGoogle();
    }`
        : ''
    }

    ${
      hasMeta
        ? `if(mk){
      if(!metaLoaded){loadMeta();}
      else if(window.fbq){window.fbq('consent','grant');}
    }else if(metaLoaded&&window.fbq){
      window.fbq('consent','revoke');
    }`
        : ''
    }

    ${
      hasClarity
        ? `var adState=mk?'granted':'denied';
    var anState=an?'granted':'denied';
    if(mode==='advanced'){
      if(!clLoaded)loadClarity();
      if(window.clarity){window.clarity('consentv2',{ad_Storage:adState,analytics_Storage:anState});}
    }else{
      if(an){
        if(!clLoaded)loadClarity();
        if(window.clarity){window.clarity('consentv2',{ad_Storage:adState,analytics_Storage:'granted'});}
      }else if(clLoaded&&window.clarity){
        window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});
      }
    }`
        : ''
    }
  }
};

var savedCats=null;
try{
  var m=document.cookie.match(/(?:^|; *)cc_cookie=([^;]+)/);
  if(m){
    var parsed=JSON.parse(decodeURIComponent(m[1]));
    var sRev=typeof parsed.revision==='number'?parsed.revision:0;
    if(sRev===rev&&Array.isArray(parsed.categories)){
      savedCats=parsed.categories;
    }
  }
}catch(e){}

if(savedCats){
  window.__acm.apply(savedCats);
}else if(mode==='advanced'){
  ${hasGoogle ? `loadGoogle();` : ''}
  ${
    hasClarity
      ? `loadClarity();
  if(window.clarity){window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});}`
      : ''
  }
}
})();`;
}
