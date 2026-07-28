export const handlePwaInstallFallback = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isMac = /Macintosh/.test(ua);
  const isAndroid = /Android/.test(ua);
  
  const isFirefox = /Firefox/.test(ua);
  const isSamsung = /SamsungBrowser/.test(ua);
  const isEdge = /Edg/.test(ua);
  const isChrome = /Chrome/.test(ua) && !isEdge && !isSamsung;
  const isSafari = /Safari/.test(ua) && !isChrome && !isEdge && !isSamsung && !isFirefox;

  if (isIOS) {
    if (isChrome || isEdge || isFirefox) {
      alert("To install, tap the 'Share' icon in your browser menu and select 'Add to Home Screen'.");
    } else {
      alert("To install, tap the 'Share' icon at the bottom of Safari and select 'Add to Home Screen'.");
    }
  } else if (isMac && isSafari) {
    alert("To install, click the 'Share' icon in Safari's toolbar and select 'Add to Dock'.");
  } else if (isSamsung) {
    alert("To install, tap the install icon in the address bar or the 'Add page to' button in the menu.");
  } else if (isFirefox) {
    if (isAndroid) {
      alert("To install, tap the three dots menu and select 'Install' or 'Add to Home screen'.");
    } else {
      alert("Firefox does not natively support installing this app. Please use Chrome or Edge for the best experience, or bookmark this page.");
    }
  } else if (isChrome || isEdge) {
    alert("To install, look for the install icon on the right side of your address bar, or check the browser menu for 'Install app'.");
  } else {
    alert("To install, check your browser's menu for an 'Install', 'Add to Home screen', or 'Add to Dock' option.");
  }
};
