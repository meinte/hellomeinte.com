function init(){
	var mainElement = T.gid('main');
	var read_moreButtons = T.gats(mainElement,'data-ui','read_more');
	var read_lessButtons = T.gats(mainElement,'data-ui','read_less');
	var moreContent = T.gats(mainElement,'data-ui','more_content');

	(function hideWorkContent(){
		for(var i=0;i<moreContent.length;i++){
			T.adcl(moreContent[i],'hidden');
		}
	})();
	(function addButtonsBehaviour(){
		var i=0;
		var button=null;
		for(i=0;i<read_moreButtons.length;i++){
			button = read_moreButtons[i];
			button.addEventListener('click',readmore_clickHandler);
		}

		for(i=0;i<read_lessButtons.length;i++){
			button = read_lessButtons[i];
			button.addEventListener('click',readless_clickHandler);
		}
	})();

	function readless_clickHandler(e){
		var contentIndex = read_lessButtons.indexOf(this);
		T.adcl(moreContent[contentIndex],'hidden');
		T.rmcl(read_moreButtons[contentIndex],'hidden');
		e.preventDefault();
	}

	function readmore_clickHandler(e){
		var contentIndex = read_moreButtons.indexOf(this);
		T.adcl(this,'hidden');
		T.rmcl(moreContent[contentIndex],'hidden');
		e.preventDefault();
	}
}