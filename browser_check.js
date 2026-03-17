function browser_version()
{
	var ua= navigator.userAgent, tem, M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
        return 'MSIE '+(tem[1] || '');
    }
    M= M[2]? [M[1], M[2]]:[navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
	return M.join(' ');
}

function browser_check()
{
	var bv=browser_version();
	var bv=bv.split(/[ .]+/);
	if(bv[0].toUpperCase() === 'MSIE')
	{
	if(parseInt(bv[1])<11)
	{
	alert("This browser does not support 3D content. \nTo view this website use one of the following browsers:\n\n1) Internet Explorer version 11 or higher\n2) Mozilla Firefox version 2 or higher\n3) Google Chrome version 8 or higher\n4) Opera version 12 or higher");
	window.location="http://www.digitalepigraphy.org/toolbox/info.html";
	}
	}
}