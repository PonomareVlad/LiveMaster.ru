jQuery(function($) {
	shareImgViewer = {};

	shareImgViewer.fn = (function () {
		var _itemFullUrl = '';
		var _$itemParams = {};
		function update() {
			// Присваивание новых атрибутов

			var fullUrl = '';
			var pageLang = $('html').prop('lang');
			var urlOrigin = 'https://www.livemaster.ru';
			if ((typeof localeClientData != 'undefined' && localeClientData.isCom) || (pageLang === 'en' || pageLang === 'es')) {
				urlOrigin = 'https://www.livemaster.com';
			}

			if ($.isEmptyObject(_$itemParams)) {
				// var fullUrl = self.location.href;
				fullUrl = urlOrigin + location.pathname;//Костыль для беты - убрать!
			} else {
				fullUrl = urlOrigin + '/item/' + _$itemParams.itemFullUrl;
			}

			var url = fullUrl.split('-')[0];
			if ($('.apifs-container').css('visibility') == 'visible') {
				var share = $('.photo-switcher__slides a:first').apImageFullscreen('getCurrentItem').find('img').prop('src');
			} else {
				var share = $('.js-viewer-current-image').attr('src');
			}
			share = share.replace('test11.livemaster', 'livemaster.ru');//Костыль для беты - убрать!
			var $btns = $('.js-viewer-social .js-social-button');
			$($btns).each(function(idx, elem) {
				if (elem.id == 'js-social-button-vkontakte') {
					$(elem).data('image', share);
					$(elem).data('url', url);
					if (!$.isEmptyObject(_$itemParams)) {
						$(elem).data('title', _$itemParams.itemTitle);
					}
				} else if (elem.id == 'js-social-button-pinterest') {
					$(elem).data('media', share);
					$(elem).data('url', fullUrl);
					if (!$.isEmptyObject(_$itemParams)) {
						$(elem).data('title', _$itemParams.itemTitle);
					}
				} else if (elem.id == 'js-social-button-twitter') {
					$(elem).data('image', share);
					$(elem).data('media', share);
					$(elem).data('image_url', share);
					$(elem).data('picture', share);
					$(elem).data('url', fullUrl);
				} else {
					$(elem).data('image', share);
					$(elem).data('media', share);
					$(elem).data('image_url', share);
					$(elem).data('picture', share);
					$(elem).data('url', url);
					if (!$.isEmptyObject(_$itemParams)) {
						$(elem).data('title', _$itemParams.itemTitle);
					}
				}
			});
		};
		function updateForTopic() {
			var fullUrl = 'https://www.livemaster.ru' + location.pathname;
			var share = $('.js-viewer-current-image').attr('src');
			var $btns = $('#viewer-social').find('.js-social-button');
			$($btns).each(function(idx, elem) {
				if (elem.id == 'js-social-button-vkontakte') {
					$(elem).data('image', share);
				} else if (elem.id == 'js-social-button-facebook2') {
					$(elem).data('picture', share);
				} else if (elem.id == 'js-social-button-mailru') {
					$(elem).data('image_url', share);
				}
			});
		}
		return {
			// обвновление атрибутов и обновление кнопок.
			set: function(viewerShareParams) {
				_$itemParams = viewerShareParams || {};
				update();
				if (jQuery().socialLikes) {
					if ($.isEmptyObject(_$itemParams)) {
						$('.js-viewer-social .social-likes').socialLikes();
					} else {
						$('.js-viewer-social .social-likes').socialLikes({
							customurl: 'item/' + _$itemParams.itemFullUrl
						});
					}
				}
			},
			setForTopic: function() {
				updateForTopic();
				if (jQuery().socialLikes) {
					$('#viewer-social').find('.social-likes').socialLikes();
				}
			}
		}
	}());
});