window.resolveBaseURL = function (url) {
	var resultUrl, base;

	if (url.search(/^http/) > -1) {
		resultUrl = url;
	} else {
		base = document.baseURI ? document.baseURI : document.getElementsByTagName('base')[0].href;
		resultUrl = base + url.replace(/^\//, '');
	}

	return resultUrl;
}

function showLoaderShade() {
	jQuery('#loader').show();
}

function hideLoaderShade() {
	jQuery('#loader').hide();
}

/*global yaCounter45166209 */
/*global _blitzModal */
/*eslint no-undef: "error"*/
var old = {};

window.lm = window.lm || {
	ui: {},
	util: {}
};

// Модуль для работы с куками, включено принудительное использование secure
window.lm.util.cookies = window.lm.util.cookies || (function () {
	return {
		set: function (name, value, expires, path, domain, secure) {
			document.cookie = name + '=' + escapeOrig(value) +
				((expires) ? '; expires=' + expires : '') +
				((path) ? '; path=' + path : '') +
				((domain) ? '; domain=' + domain : '') +
				'; secure';
		},

		get: function (name) {
			var matches = document.cookie.match(new RegExp(
				"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			));
			return matches ? decodeURIComponent(matches[1]) : undefined;
		},

		remove: function (name) {
			document.cookie = name + '=0; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=; domain=; secure';
			return this.exist(name);
		},

		exist: function (name) {
			return (this.get(name)) ? true : false;
		}
	}
})();

old.viewer = {};

old.viewer = (function () {
	var _i18n = i18n.default;
	var viewerImages = {
		slides: [],
		frame: 0,
		clickable: true
	};

	var viewerData;
	var itemPurchasePage;
	var itemPage;
	// var isProfilePage = false;

	var $viewerItemsArray = [];

	var $viewerShareParams = {};
	var $viewerItems = {};
	var widthSideBar = 330;

	// var isAuthUser = Boolean(getClientData().userId);

	//Показывает/убирает viewer
	function toggleViewer() {
		window.hasViewerOpen = !(window.hasViewerOpen || false);
		var $viewerContainer = $('#viewer-container');
		var $slideCurrent = $('#slide-current');
		var $viewerSlider = $('#viewer-slider');
		var $currentImage = $('#current-image');
		var $viewer = $('#viewer');
		var $htmlBody = $('html,body');
		var minSliderHeight = '740px';
		var $blockAnother = $('.viewer-block-another');

		if ($viewerContainer.css('visibility') == 'visible') {
			var typeViewer = $blockAnother.hasClass('hide');
			if (itemPage && typeViewer) {
				var currentPathname = '/item/' + $viewerItemsArray[$viewerItems.currentItem].url;
				if (window.location.pathname != currentPathname) {
					window.location.pathname = currentPathname;
				}
			}
			$currentImage.css('visibility', 'hidden');
			$viewerContainer.css('visibility', 'hidden');
			$('.js-viewer-overlay').css('visibility', 'hidden');
			$slideCurrent.data('current-slide', -1);
			$viewerSlider.css('width', minSliderHeight); //Переписать под togleclass
			$viewerSlider.css('height', minSliderHeight);
			$slideCurrent.css('line-height', minSliderHeight);
			$viewer.css('width', '1020px');
			$viewer.css('height', minSliderHeight);
			$viewerSlider.removeClass('viewer-slider-hover');
			$('#viewer-btn-slide-zoom').hide();
			$htmlBody.css('overflow', '');
			if (!itemPage && !itemPurchasePage) {
				$viewer.remove();
				$('#viewer-item-btn-prev').hide();
				$('#viewer-item-btn-next').hide();
				var $currentItem = $('#item' + $viewerItemsArray[$viewerItems.currentItem].object_id);
				if ($currentItem.length) {
					$('html,body').scrollTop($currentItem.offset().top - 140);
				} else {
					if (masterWorkshopPage) {
						goToItemListPage();
					}
				}
				$('.photo-switcher__main').slick('slickGoTo', viewerImages.frame, false);
			}
		} else {
			$viewerContainer.css('visibility', 'visible');
			$('.js-viewer-overlay').css('visibility', 'visible');
			$viewerSlider.addClass('viewer-slider-hover');
			$htmlBody.css('overflow', 'hidden');
		}
	};

	//Переходит к следующему слайду
	function nextSlide() {
		viewerImages.frame++;
		if (viewerImages.frame == viewerImages.slides.length) {
			viewerImages.frame = 0;
		}
		goToSlide(viewerImages.frame, 'next');
	};

	//Переходит к предыдущему
	function prevSlide() {
		viewerImages.frame--;
		if (viewerImages.frame < 0) {
			viewerImages.frame = viewerImages.slides.length - 1;
		}
		goToSlide(viewerImages.frame, 'prev');
	};

	//Переходит к указанному слайду (только для изображений)
	function goToSlide(nextSlide, preload) {
		// var _this = this;
		var $currentImage = $('#current-image');
		var $nextImage = $('#viewer-next-image');
		$currentImage.apImageZoom('destroy');
		toggleZoomBtn();
		$currentImage.css('visibility', 'hidden');
		$currentImage.attr('src', '');
		$currentImage.css('width', '');
		$currentImage.css('height', '');
		viewerImages.frame = nextSlide;
		$currentImage.bindImageLoad(function () {
			if (preload == 'prev') {
				$nextImage.attr('src', viewerImages.slides[nextSlide - 1]);
			} else if (preload == 'next') {
				$nextImage.attr('src', viewerImages.slides[nextSlide + 1]);
			}
			updateSliderSize();
			$currentImage.css('visibility', 'visible');

			// Добавлена проверка isProfilePage для страниц профиля, чтобы избежать проблемы с переинициализацией social likes
			// if (!itemPurchasePage && viewerData.pageName != 'purchasedDg' && !isProfilePage) {
			if ($.isEmptyObject($viewerShareParams)) {
				shareImgViewer.fn.set();
			} else {
				shareImgViewer.fn.set($viewerShareParams);
			}
			// }
		}).attr('src', viewerImages.slides[nextSlide]);
	};

	function videoSwitch(key) {
		if (key === 'show') {
			var videoIconIndex = $('.js-video-viewer').data('img-index');
			$('.js-viewer-sketch').removeClass('viewer-sketch-toggled');
			$('.js-viewer-sketch[data-img-index="' + videoIconIndex + '"]').addClass('viewer-sketch-toggled');

			var urlVideo = $('.js-video-viewer').data('video-url');
			$('#slide-current').prepend(
				'<iframe class="js-viewer-frame"' +
					'width="100%"' +
					'height="100%"' +
					'src="' + urlVideo +'" frameborder="0"' +
					'allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen' +
				'></iframe>'
			);
			$('#slide-current').next().hide();
		}
		if (key === 'hide') {
			$('.js-viewer-frame').remove();
		}
	}

	//Корректирует размер слайдера
	function updateSliderSize() {
		widthSideBar = $(window).height() <= 800 ? 440 : 330;
		var maxViewerWidth = $(window).width() - 60 - widthSideBar;
		var maxViewerHeight = $(window).height() - 40;
		var $viewerSlider = $('#viewer-slider');
		var $slideCurrent = $('#slide-current');
		var $currentImage = $('#current-image');
		if ($currentImage.get(0).naturalWidth > maxViewerWidth) {
			$currentImage.width(maxViewerWidth);
		}
		if ($currentImage.height() > maxViewerHeight) {
			$currentImage.width('');
			$currentImage.height(maxViewerHeight);
		}
		if ($currentImage.width() > $slideCurrent.width()) {
			$viewerSlider.width($('#current-image').width());
		}
		if ($currentImage.height() > $viewerSlider.height()) {
			$viewerSlider.height($currentImage.height());
			$slideCurrent.css('line-height', ($currentImage.height() + 'px'));
		}
		updateViewerSize();
	};

	//Корректирует размер viewer'а
	function updateViewerSize() {
		setTimeout(function() {
			var $viewer = $('#viewer');
			var $viewerSlider = $('#viewer-slider');
			// var windowHeight = $(window).height()
			widthSideBar = $(window).height() <= 800 ? 440 : 330;
			$viewer.width($viewerSlider.width() + widthSideBar);
			$viewer.height($viewerSlider.height());
		}, 0);
	};

	//Подсвечивает выбранную миниатюру изображения
	function markSketch() {
		var currentSlide = viewerImages.frame;
		$('.js-viewer-sketch').removeClass('viewer-sketch-toggled');
		$('.js-viewer-sketch[data-img-index="' + currentSlide + '"]').addClass('viewer-sketch-toggled');
	};

	//Добавляет подпись под изображением
	function showDesc() {
		var desc;
		var currentSlide = viewerImages.frame;
		var div = $('.js-viewer-sketch[data-img-index="' + currentSlide + '"]');
		if (div.data('page-type') !== 'profile') {
			return false;
		}
		desc = $('.js-viewer-sketch[data-img-index="' + currentSlide + '"]').attr('alt');
		$('.current-description:first').html(desc);
	};

	//Инициализирует плагин зума
	function initZoom() {
		$('#current-image').apImageZoom({
			cssWrapperClass: 'custom-wrapper-class',
			autoCenter: true,
			minZoom: 'contain',
			maxZoom: false,
			maxZoom: 1.0,
			dragEnabled: true
		});
	};

	//Запускаеи зум для нового слайда
	function setZoomer() {
		var $currentImage = $('#current-image');
		$currentImage.apImageZoom('destroy');
		if (
			$currentImage.width() < $currentImage.get(0).naturalWidth ||
			$currentImage.height() < $currentImage.get(0).naturalHeight ||
			$currentImage.height() > $currentImage.parent().height()
		) {
			initZoom();
		}
	};

	//Включает/выключает плагин зума
	function toggleZoomBtn() {
		setTimeout(function () { //Таймаут нужен, потому как плагин зума активируется не мгновенно
			var $btnZoom = $('#viewer-btn-slide-zoom');
			if ($('.apiz-overlay').length == 1) {
				var currentZoom = $('#current-image').apImageZoom('getCurrentZoom');
				if (1 - currentZoom >= 0.01) {
					$btnZoom.show();
				} else {
					$btnZoom.hide();
				}
			} else {
				$btnZoom.hide();
			}
		}, 50);
	};

	//Обновляет значение "В избранное" во viewer
	function toggleFavBtn() {
		setTimeout(function() {
			var $viewerFavLink = $('.viewer-fav').find('.js-item-toggle-favorite');
			var favoriteText = {
				add: _i18n._('Добавить в избранное'),
				remove: _i18n._('Убрать из избранного')
			};

			if ($('.js-item-toggle-favorite').length) {
				if ($('.item-social-actions').find('.js-item-toggle-favorite').find('.icon-heart').hasClass('icon-heart--active')) {
					var $counter = $('.js-item-toggle-favorite').find('.item-social-actions__counter');
					var fail = !$counter[0];
					if (fail) {
						$counter = '(1)';
					} else {
						$counter = $counter.html();
					}
					var count = $counter.slice($counter.indexOf('(') + 1, $counter.indexOf(')'));
					$viewerFavLink.replaceWith((
						'<a class="item-social-actions__link js-item-toggle-favorite" href="#" data-id="' + $(
							'.js-item-toggle-favorite').data('id') + '">' +
						'<span class="item-social-actions__icon icon-responsive icon-heart icon-heart--active"></span>' +
						'<span class="item-social-actions__text">' + favoriteText.remove + '</span>' +
						((count && !fail) ? (
							'<span class="item-social-actions__counter"> (' + count + ')</span>'
						) : '') +
						'</a>'
					));

				} else {
					var $counter = $('.js-item-toggle-favorite').find('.item-social-actions__counter');
					var fail = !$counter[0];
					if (fail) {
						$counter = '(1)';
					} else {
						$counter = $counter.html();
					}
					var count = $counter.slice($counter.indexOf('(') + 1, $counter.indexOf(')'));
					$viewerFavLink.replaceWith((
						'<a class="item-social-actions__link js-item-toggle-favorite" href="#" data-id="' + $(
							'.js-item-toggle-favorite').data('id') + '">' +
						'<span class="item-social-actions__icon icon-responsive icon-heart"></span>' +
						'<span class="item-social-actions__text">' + favoriteText.add + '</span>' +
						((count && !fail) ? (
							'<span class="item-social-actions__counter"> (' + count + ')</span>'
						) : '') +
						'</a>'
					));
				}
			}
		}, 0);
	};

	//Добавляет в массив работы из viewerData
	function appendItemsArray() {
		$viewerItemsArray = viewerData.viewerItemsArray;
		$viewerItems.currentItem = 0;
		viewerImages.slides = $viewerItemsArray[$viewerItems.currentItem].imagesArray;
		if ($viewerItemsArray.length > 1) {
			assignViewerItems();
		} else {
			$('.js-viewer-item-btn').hide();
		}
	};

	//Добавляет в массив работы, парся их со страницы
	function appendItemsArrayFromPage() {
		var itemsLength = $('.js-btn-hover-open-viewer').length;
		$viewerItemsArray = [];
		for (var i = 0; i < itemsLength; i++) {
			$viewerItemsArray[i] = {};
			$viewerItemsArray[i].object_id = $($('.js-btn-hover-open-viewer')[i]).data('id');
			if (viewerData.pageName == 'purchasedDg') {
				$viewerItemsArray[i].puid = $($('.js-btn-hover-open-viewer')[i]).data('puid');
				$viewerItemsArray[i].c2cPoId = $($('.js-btn-hover-open-viewer')[i]).data('c2c_po_id');
			}
		}
	};

	function assignViewerItems() {
		setTimeout(function() {
			var $btnPrev = $('#viewer-item-btn-prev');
			var $btnNext = $('#viewer-item-btn-next');
			var $imgPrev = $('.js-viewer-item-btn-image-prev');
			var $imgNext = $('.js-viewer-item-btn-image-next');
			var isCollection = /cid=/.test(location.href);
			$viewerItems.nextItem = $viewerItems.currentItem + 1;
			$viewerItems.prevItem = $viewerItems.currentItem - 1;

			if ($viewerItems.nextItem == $viewerItemsArray.length) {
				$viewerItems.nextItem = 0;
			}
			if ($viewerItems.prevItem < 0) {
				$viewerItems.prevItem = $viewerItemsArray.length - 1;
			}
			if (itemPage || (masterWorkshopPage && !isCollection)) {
				$btnPrev.show();
				$btnNext.show();
				assignArrow($imgPrev, $viewerItemsArray[$viewerItems.prevItem]);
				assignArrow($imgNext, $viewerItemsArray[$viewerItems.nextItem]);
			} else {
				if ($viewerItemsArray.length > 1) {
					if ($viewerItems.nextItem == 0) {
						$btnPrev.show();
						$btnNext.hide();
						assignArrow($imgPrev, $viewerItemsArray[$viewerItems.prevItem]);
					} else if ($viewerItems.prevItem == $viewerItemsArray.length - 1) {
						$btnPrev.hide();
						$btnNext.show();
						assignArrow($imgNext, $viewerItemsArray[$viewerItems.nextItem]);
					} else {
						$btnPrev.show();
						$btnNext.show();
						assignArrow($imgPrev, $viewerItemsArray[$viewerItems.prevItem]);
						assignArrow($imgNext, $viewerItemsArray[$viewerItems.nextItem]);
					}
				}
			}
		}, 0);
	};

	function assignArrow($imageElem, imageObj) {
		var moderationType = $('.js-btn-hover-open-viewer[data-id="' + imageObj.object_id + '"]').data('moderation');
		$imageElem.parent().data('moderation', moderationType);
		$imageElem.parent().data('object-id)', imageObj.object_id);
		$imageElem.css({
			'background': '#c1c1c1 url(' + imageObj.imgPreview + ') no-repeat',
			'background-size': 'cover'
		});
	};

	function goToItemListPage() {
		var currentId = $viewerItemsArray[$viewerItems.currentItem].object_id;
		var currentItem = $viewerItems.currentItem + 1;
		var itemsPerPage;

		if (lm.util.cookies.get('PerPageCount')) {
			var perPageCountCase = parseInt(lm.util.cookies.get('PerPageCount'));
			switch (perPageCountCase) {
				case 1:
					itemsPerPage = 20;
					break;
				case 2:
					itemsPerPage = 40;
					break;
				case 6:
					itemsPerPage = 120;
					break;
				default:
					itemsPerPage = 40;
			}
		} else {
			if (lm.util.cookies.get('heavy_default') > 0) {
				itemsPerPage = 40;
			} else {
				itemsPerPage = 20;
			}
		}

		var nextPage = Math.ceil(currentItem / itemsPerPage);
		if (nextPage == 1) {
			location.href = resolveBaseURL(location.origin + location.pathname + '#item' + currentId);
		} else {
			nextPage = nextPage - 1;
			if (nextPage < 0) {
				nextPage = 0;
			}
			location.href = location.origin + location.pathname + '?sortitems=' + 0 + '&v=0&from=' + nextPage * itemsPerPage + '#item' + currentId;
		}
	};

	function viewerIsExist(event) {
		return (
			!$('#viewer-block').is(event.target)
			&& $('#viewer-block').has(event.target).length === 0
			&& !$('.js-viewer-item-btn').is(event.target)
			&& $('.js-viewer-item-btn').has(event.target).length === 0
			&& $('.js-slick-init').has(event.target).length === 0
		);
	}

	return {
		init: function () {
			var _this = this;
			if ($('#viewer-data').length) {
				viewerData = JSON.parse($('#viewer-data').text() || '{}');
			}

			itemPurchasePage = viewerData.pageName == 'itemPurchase';
			itemPage = viewerData.pageName == 'item';
			masterWorkshopPage = viewerData.pageName == 'masteritems';
			//Переменные для ресайза окна
			var rtime;
			var timeout = false;
			var delta = 200;

			if (itemPage && (viewerData.itemStatus != 1 && viewerData.itemStatus != 8)) {
				return false;
			}

			var $document = $(document);

			var sliderInit = false;
			if (itemPage || itemPurchasePage) {
				if (itemPurchasePage) {
					var mainFoto = '#item-page-main-photo-link';
				} else {
					var mainFoto = '.photo-switcher__largephoto';
					var anotherImg = '.js-more-works';
				}

				//При клике на главное фото на странице работы
				setTimeout(function() {
					$document.on('click', mainFoto + ', ' + anotherImg, function (e) {
						e.preventDefault();
						var $viewer = $('#viewer-container');
						if ($viewer.length === 0) {
							$('body').append($('#viewer-container-tpl').html());
							appendItemsArray();
							_this.getNewItemViewer('firstItem');
							toggleFavBtn();
						} else if ($viewer.css('visibility') === 'hidden') {
							_this.getNewItemViewer('firstItem');
							toggleFavBtn();
						}
						_this.setControls();
						$('#viewer-item-name').addClass('text-multiline');
						toggleViewer();

						$('.viewer-items-container').removeClass('hide');
						var $element = $(e.target);
						var $slider = $('.js-slick-init');
						var clickAnother = $element.hasClass('js-more-works');
						var $blockAnother = $('.viewer-block-another');
						if (!clickAnother && $('#viewer-container').length) {
							_this.setControls();
							$blockAnother.addClass('hide');
							$slider.addClass('hide');
						}
						goToSlide($(this).data('slick-index'), 'next');
						markSketch();
						if ($slider.length && clickAnother) {
							var idItemViewer = Number($element.data('number'));
							$blockAnother.removeClass('hide');
							$slider.removeClass('hide');
							if (sliderInit) {
								$slider.slick('unslick');
							}
							$('.viewer-items-container').addClass('hide');
							$('.viewer-block-counter').text((Number(idItemViewer) + 1) + ' '  + _i18n._('из') + ' ' + ($viewerItemsArray.length));
							$('.viewer-block-slider-item--select').removeClass('viewer-block-slider-item--select');
							$('[data-listing-item="' + idItemViewer + '"]').addClass('viewer-block-slider-item--select');
							if ($viewerItemsArray.length > 13) {
								$slider.slick({
									arrows: true,
									infinite: true,
									dots: false,
									slidesToShow: 13,
									variableWidth: true,
									edgeFriction: 0,
									lazyLoad: 'ondemand',
									rows: 'slider',
									slidesToScroll: 6,
								});
								sliderInit = true;
							}
							_this.getNewItemViewer(Number(idItemViewer));
						}
					});
				}, 0);

				setTimeout(function() {
					$document.on('click', '.viewer-block-slider-item', function(event) {
						var $elem = $(event.currentTarget);
						var listinItem = Number(event.target.getAttribute('data-listing-item'));

						$('.viewer-block-counter').text((Number(listinItem) + 1) + ' '  + _i18n._('из') + ' ' + ($viewerItemsArray.length));
						$('.viewer-block-slider-item--select').removeClass('viewer-block-slider-item--select');
						$elem.addClass('viewer-block-slider-item--select');
						if (listinItem >= Number($viewerItemsArray.length) + 1) {
							_this.getNewItemViewer('firstItem');
						} else {
							_this.getNewItemViewer(Number(listinItem));
						}
					});
				}, 0);
			}

			// Обработчик кнопки "Логи Handmade"
			setTimeout(function() {
				$document.on('click', '[data-action="handmade-logs"]', function(event) {
					var userId = event.target.getAttribute('data-id');
					var url =  'https://' + location.host + ':1862/sublevel/index.php?chapter=logs&mod=handmade&id=' + userId;
					window.open(url, 'log', 'width=750,height=400,scrollbars=yes,resizable=yes,titlebar=0,location=0');
				});
			}, 0);

			setTimeout(function() {
				// //Обработчик кнопки "Добавить в круг"
				$document.on('click', '.js-stat-viewer-subscribe-link', function (e) {
					e.preventDefault();
					var clientData = JSON.parse(jQuery('#client-data-profile').text() || '{}');
					if (localeClientData.userEmailStatus == 0) {
						warningEmailNotConfirmed();
					} else {
						jQuery('.js-viewer-profile-btn-master-subscribe').fadeOut();
					}
				});
			}, 0);

			//При клике на оверлее, при включенном viewer'e
			setTimeout(function() {
				$document.on('click', '#viewer-container', function (e) {
					if ((viewerIsExist(e))) {
						toggleViewer();
						videoSwitch('hide');
					}
				});
			}, 0);

			//При клике на крестике "Закрыть"
			setTimeout(function() {
				$document.on('click', '#viewer-close', function (e) {
					e.stopPropagation();
					toggleViewer();
					videoSwitch('hide');
				});
			}, 0);

			//Обработка закрытия окна по вводу с клавиатуры
			setTimeout(function() {
				$document.on('keydown', function (keyEntered) {
					_this.switchViewerByKey(keyEntered);
				});
			}, 0);

			//При клике на миниатюрах
			setTimeout(function() {
				$document.on('click', '.js-viewer-sketch', function (event) {
					if ($(event.currentTarget).hasClass('js-video-viewer')) {
						videoSwitch('show');
						return;
					}
					if (viewerImages.clickable) {
						videoSwitch('hide');
						goToSlide($(this).data('img-index'));
						_this.setControls();
					}
				});
			}, 0);

			//При клике на изображении
			setTimeout(function() {
				$document.on('click', '#slide-current', function () {
					if (viewerImages.clickable) {
						if ($('.apiz-wrapper').length == 0) {
							nextSlide();
							_this.setControls();
						}
					}
				});
			}, 0);

			//При клике на кнопку 'увеличить/уменьшить'
			setTimeout(function() {
				$document.on('click', '#viewer-btn-slide-zoom', function () {
					_this.zoomInOut();
				});
			}, 0);

			//При ресайзе окна
			setTimeout(function() {
				$document.on('resize', function () {
					if ($('#viewer-container').css('visibility') == 'visible') {
						$('#viewer-item-name').removeClass('text-multiline');
						setTimeout(function () {
							$('#viewer-item-name').addClass('text-multiline');
						}, 0);
						_this.updateSliderSizeOnResize();
						rtime = new Date();
						if (timeout === false) {
							timeout = true;
							setTimeout(function resizeEnd() {
								if (new Date() - rtime < delta) {
									setTimeout(resizeEnd, delta);
								} else {
									timeout = false;
									setZoomer();
									_this.toggleZoomBtn();
								}
							}, delta);
						}
					}
				});
			}, 0);

			//Обработчик кнопки предыдущая работа
			setTimeout(function() {
				$document.on('click', '#viewer-item-btn-prev', function (event) {
					var moderationType = $(this).data('moderation');
					_this.getNewItemViewer('prev', moderationType);
				});
			}, 0);

			//Обработчик кнопки следующая работа
			setTimeout(function() {
				$document.on('click', '#viewer-item-btn-next', function (event) {
					var moderationType = $(this).data('moderation');
					_this.getNewItemViewer('next', moderationType);
				});
			}, 0);

			setTimeout(function() {
				$document.on('click', '#btn-tested-new-items', function () {
					_this.postponeModeratedItems($('#item-id-for-moderation').val());
				});
			}, 0);

			setTimeout(function() {
				$document.on('click', '#btn-tested-claimed-items', function () {
					_this.setItemAsChecked($('#item-id-for-moderation').val());
				});
			}, 0);

			//Обработчик кнопки "Увеличить" для hover
			setTimeout(function() {
				$document.on('click', '.js-btn-hover-open-viewer', function (e) {
					e.preventDefault();
					var currentId = $(this).data('id');
					var userId = $(this).data('user-id');
					var isModeration = $(this).data('moderation');
					var currentItemId;
					var isCollection = /cid=/.test(location.href);
					if ($('#viewer-container').length == 0) {
						$('body').append($('#viewer-container-tpl').html());
					}
					if (masterWorkshopPage && !isCollection) {
						appendItemsArray();
					} else {
						appendItemsArrayFromPage();
					}
					for (var i = 0; i < $viewerItemsArray.length; i++) {
						if (currentId == $viewerItemsArray[i].object_id || userId == $viewerItemsArray[i].object_id) {
							currentItemId = i;
						}
					}
					if (userId > 0) {
						_this.getUserViewer(userId, currentItemId);
					} else {
						_this.getNewItemViewer(currentItemId, isModeration);
					}

					toggleViewer();
				});
			}, 0);

			setTimeout(function() {
				$document.on('click', '.js-action-item-disable', function (e) {
					e.preventDefault();
					var objectId = $('#item-id-for-moderation').val();

					if (!objectId) {
						return;
					}
					window._moderationModule.disableItems({
						items: [objectId],
						callbacks: {
							success: function () {
								_this.updateModerationData();
								$('.js-action-item-disable').addClass('hide');
								$('.js-manage-item').removeClass('hide');
							},
							error: function () {}
						}
					});
				});
			}, 0);
		},
		setItemAsChecked: function (objectId) {
			if (
				window._moderationModule &&
				typeof window._moderationModule.checkedItems === 'function'
			) {
				window._moderationModule.checkedItems(objectId, {
					success: function () {
						$('#btn-tested-claimed-items').attr('disabled', 'disabled');
						$('#btn-tested-claimed-items').addClass('disabled');
					},
					error: function () {},
				});
				return;
			}

			var _module = this;
			if (typeof showLoaderShade === 'function') {
				showLoaderShade();
			}

			var url = {};
			var objId = $('.js-action-item-disable.btn').data('object-id');
			url[objId] = window.location.origin + $('a#viewer-item-name').prop('href');

			$.ajax({
				url: resolveBaseURL('moderationclaims/checkObjects'),
				type: 'post',
				dataType: 'json',
				data: {
					ids: objectId,
					pageUrl: url,
					isBigViewer: true
				}
			}).done(function (response) {
				if (response.error === 0) {
					$('#btn-tested-claimed-items').attr('disabled', 'disabled');
					$('#btn-tested-claimed-items').addClass('disabled');
				} else if (response.error === 1) {
					MWindow.box.show({
						html: '<div>' + response.errorText + '</div>',
						btn1: {
							text: i18n._('Закрыть'),
							size: 'small',
							onClick: function () {
								MWindow.box.hide();
							}
						}
					});
				}
				if (typeof hideLoaderShade === 'function') {
					hideLoaderShade();
				}
				_module.updateModerationData();
			});
		},
		//переносит работу в промодерированные, убирает со страницы модерации
		postponeModeratedItems: function (objectId) {
			var _module = this;
			showLoaderShade();
			$.ajax({
				url: resolveBaseURL('moderationitems/postponeModeratedItems'),
				type: 'post',
				data: {
					objects: JSON.stringify([Number(objectId)]),
				}
			}).done(function (response) {
				if (!response.error) {
					$('#btn-tested-new-items').attr('disabled', 'disabled');
					$('#btn-tested-new-items').addClass('disabled');
				} else {
					alert(response.errorText);
				}
				hideLoaderShade();
				_module.updateModerationData();
			});
		},
		//Получает данные viewer'а текущей работы
		getNewItemViewer: function (listingItem, moderationType) {
			var _this = this;
			var newItemIndex;
			if (listingItem == 'next') {
				newItemIndex = $viewerItems.nextItem;
			} else if (listingItem == 'prev') {
				newItemIndex = $viewerItems.prevItem;
			} else if (listingItem == 'firstItem') {
				newItemIndex = 'firstItem';
			} else {
				newItemIndex = listingItem;
			}

			if (listingItem == 'firstItem') {
				_this.renderNewItemViewer(newItemIndex);
			} else {
				var objectId = $viewerItemsArray[newItemIndex].object_id;
				if (viewerData.pageName == 'purchasedDg') {
					var puid = $viewerItemsArray[newItemIndex].puid;
					var c2cPoId = $viewerItemsArray[newItemIndex].c2cPoId;
				}
				var nextItemIdIndex = newItemIndex + 1;
				var prevItemIdIndex = newItemIndex - 1;

				if (nextItemIdIndex == $viewerItemsArray.length) {
					nextItemIdIndex = 0;
				}
				if (prevItemIdIndex < 0) {
					prevItemIdIndex = $viewerItemsArray.length - 1;
				}
				var nextItemId = $viewerItemsArray[nextItemIdIndex].object_id;
				var prevItemId = $viewerItemsArray[prevItemIdIndex].object_id;
				var isModeration = '';
				var whatIsModeration = '';

				if (!moderationType) {
					// для модерирования новых работ
					var isLastlistModeration = $('#lastlistModerationNewItems').data('moderation');
					// для модерирования работ по жалобам
					var isClaimsModeration = $('#moderation-claims-for-viewer').data('moderation');
					var isRemoderationItem = $('#remoderation-item-for-viewer').data('moderation');
					var isModerationExcludedItem = $('#moderation-excluded-item-for-viewer').data('moderation');
					var isModerationModifiedItem = $('#moderation-modified-item-for-viewer').data('moderation');

					if (isLastlistModeration) {
						isModeration = isLastlistModeration;
						whatIsModeration = 'new-items';
					} else if (isClaimsModeration) {
						isModeration = isClaimsModeration;
						whatIsModeration = 'claims';
					} else if (isRemoderationItem) {
						isModeration = isRemoderationItem;
						whatIsModeration = 'remoderationItem';
					} else if (isModerationExcludedItem) {
						isModeration = isModerationExcludedItem;
						whatIsModeration = 'moderationExcludedItem';
					} else if (isModerationModifiedItem) {
						isModeration = isModerationModifiedItem;
						whatIsModeration = 'moderationModifiedItem';
					}
				} else {
					isModeration = Number(!!moderationType);
					whatIsModeration = moderationType;
				}

				var url;
				var data;
				if (viewerData.pageName == 'purchasedDg') {
					url = '/purchases/getObjectForViewer';
					data = {
						objectId: objectId,
						puid: puid,
						c2cPoId: c2cPoId,
						nextItemId: nextItemId,
						prevItemId: prevItemId,
						isModeration: isLastlistModeration
					};
				} else {
					url = '/item/getObjectForViewer';
					data = {
						objectId: objectId,
						nextItemId: nextItemId,
						prevItemId: prevItemId,
						isModeration: isModeration,
						whatIsModeration: whatIsModeration,
						isAdaptive: true // костыль для работы вьювера на странице магазина
					};
				}

				$.ajax({
					url: resolveBaseURL(url),
					type: 'post',
					data: data
				}).done(function (response) {
					if (typeof (response) == 'object') {
						var result = response;
					} else {
						var result = JSON.parse(response);
					}
					if (result.state === true) {

						$viewerItemsArray[newItemIndex].url = result.url;
						$viewerItemsArray[newItemIndex].imagesArray = result.imagesArray;
						$viewerItemsArray[newItemIndex].shareDesc = result.shareDesc;
						$viewerItemsArray[newItemIndex].shareTitle = result.shareTitle;

						if (!$viewerItemsArray[nextItemIdIndex].loaded) {
							$viewerItemsArray[nextItemIdIndex].imgPreview = result.imgPreviewNext;
						}
						if (!$viewerItemsArray[prevItemIdIndex].loaded) {
							$viewerItemsArray[prevItemIdIndex].imgPreview = result.imgPreviewPrev;
						}

						_this.renderNewItemViewer(newItemIndex, result);

						if (result.itemIsModerated) {
							$('#btn-tested-new-items').attr('disabled', 'disabled');
							$('#btn-tested-new-items').addClass('disabled');
						}

						if (
							result.isModeration &&
							lm.ui && lm.ui.moderateItemModule &&
							typeof lm.ui.moderateItemModule.init === 'function'
						) {
							lm.ui.moderateItemModule.init(result.objectId);
						}
					}
				});
			}
		},
		//Получает данные viewer'а для профиля
		getUserViewer: function (userId, listingItem) {
			var _this = this;
			var newItemIndex;
			if (listingItem == 'next') {
				newItemIndex = $viewerItems.nextItem;
			} else if (listingItem == 'prev') {
				newItemIndex = $viewerItems.prevItem;
			} else if (listingItem == 'firstItem') {
				newItemIndex = 'firstItem';
			} else {
				newItemIndex = listingItem;
			}

			if (listingItem == 'firstItem') {
				_this.renderNewItemViewer(newItemIndex);
			} else {
				var nextItemIdIndex = newItemIndex + 1;
				var prevItemIdIndex = newItemIndex - 1;

				if (nextItemIdIndex == $viewerItemsArray.length) {
					nextItemIdIndex = 0;
				}
				if (prevItemIdIndex < 0) {
					prevItemIdIndex = $viewerItemsArray.length - 1;
				}

				$.ajax({
					url: resolveBaseURL('profile/getAboutImagesForViewer'),
					type: 'post',
					data: {
						userId: userId
					}
				}).done(function (response) {
					var result = JSON.parse(response);
					if (result.state === true) {

						$viewerItemsArray[newItemIndex].url = result.url;
						$viewerItemsArray[newItemIndex].imagesArray = result.imagesArray;

						if (!$viewerItemsArray[nextItemIdIndex].loaded) {
							$viewerItemsArray[nextItemIdIndex].imgPreview = result.imgPreviewNext;
						}
						if (!$viewerItemsArray[prevItemIdIndex].loaded) {
							$viewerItemsArray[prevItemIdIndex].imgPreview = result.imgPreviewPrev;
						}

						_this.renderUserViewer(newItemIndex, result);
						// Костыль для переключения на нужное изображение после загрузки шаблона
						goToSlide(newItemIndex, 'next');
						markSketch(newItemIndex);
						showDesc();
					}
				});
			}
		},
		//Пересоздает окно viewer'а для текущей работы
		renderNewItemViewer: function (nextItemIndex, result) {
			var _this = this;
			var $viewerSlider = $('#viewer-slider');
			var currentWidth = $viewerSlider.width();
			var currentHeight = $viewerSlider.height();

			$('#viewer').remove();

			var tempItemIndex;
			if (nextItemIndex == 'firstItem') {
				tempItemIndex = 'firstItem';
				nextItemIndex = 0;
				$('#viewer-block').prepend($viewerItemsArray[0].tpl);
				toggleFavBtn();
			} else {
				$('#viewer-block').prepend(result.tpl);
			}
			$viewerSlider.width(currentWidth);
			$viewerSlider.height(currentHeight);
			$('#slide-current').css('line-height', currentHeight + 'px');
			updateViewerSize();
			viewerImages.slides = $viewerItemsArray[nextItemIndex].imagesArray;
			if (viewerImages.slides.length == 1) {
				viewerImages.clickable = false;
			} else {
				viewerImages.clickable = true;
			}
			$viewerItems.currentItem = nextItemIndex;
			assignViewerItems();
			if (tempItemIndex != 'firstItem') {
				$viewerShareParams = {
					itemFullUrl: $viewerItemsArray[nextItemIndex].url,
					itemDesc: $viewerItemsArray[nextItemIndex].shareDesc,
					itemTitle: $viewerItemsArray[nextItemIndex].shareTitle
				};
				goToSlide(0, 'next');
			} else {
				goToSlide(nextItemIndex, 'next');
			}
			_this.setControls();
			$('#viewer-item-name').addClass('text-multiline');
		},
		//Показать следующий слайд Внешняя функция для плагина
		showNextSlide: function () {
			var _this = this;
			if (viewerImages.clickable) {
				nextSlide();
				_this.setControls();
			}
		},
		//Показывает/скрывает кнопку 'увеличить/уменьшить'
		toggleZoomBtn: function () {
			setTimeout(function () { //Таймаут нужен, потому как плагин зума активируется не мгновенно
				var $btnZoom = $('#viewer-btn-slide-zoom');
				if ($('.apiz-overlay').length == 1) {
					var currentZoom = $('#current-image').apImageZoom('getCurrentZoom');
					if (1 - currentZoom >= 0.01) {
						$btnZoom.show();
					} else {
						$btnZoom.hide();
					}
				} else {
					$btnZoom.hide();
				}
			}, 50);
		},
		//Увелчивает изображение до 100% или уменьшает до вписывания
		zoomInOut: function () {
			var $currentImage = $('#current-image');
			var currentZoom = $currentImage.apImageZoom('getCurrentZoom');
			if (currentZoom == 1) {
				$currentImage.apImageZoom('reset');
			} else {
				$currentImage.apImageZoom('zoom', 1);
			}
		},
		//Включает зум и элементы управления
		setControls: function () {
			var _this = this;
			$('#current-image').bindImageLoad(function () {
				// Делаем инициализацию зума асинхронной, т.к после повторного открытия вьюера автовычисление размеров фото работает некорректно
				setTimeout(function() {
					setZoomer();
					_this.toggleZoomBtn();
				}, 0);
			});
			markSketch();
			showDesc();
		},
		//Изменяет размер viewer'а при ресайзе
		updateSliderSizeOnResize: function () {
			// var _this = this;
			widthSideBar = $(window).height() <= 800 ? 440 : 330;
			var maxViewerWidth = $(window).width() - 60 - widthSideBar;
			var maxViewerHeight = $(window).height() - 40;
			var $viewerSlider = $('#viewer-slider');
			var $slideCurrent = $('#slide-current');
			var $currentImage = $('#current-image');
			var $viewer = $('#viewer');
			$currentImage.apImageZoom('destroy');
			$viewerSlider.css('width', '740px'); //Переписать под togleclass
			$viewerSlider.css('height', '740px');
			$slideCurrent.css('line-height', '740px');
			$viewer.css('width', '1020px');
			$viewer.css('height', '890px');

			$currentImage.width('');
			$currentImage.height('');

			if ($currentImage.get(0).naturalWidth > maxViewerWidth) {
				$currentImage.width(maxViewerWidth);
			}
			if ($currentImage.height() > maxViewerHeight) {
				$currentImage.width('');
				$currentImage.height(maxViewerHeight);
			}
			if ($currentImage.width() > $slideCurrent.width()) {
				$viewerSlider.width($currentImage.width());
			}
			if ($currentImage.height() > $viewerSlider.height()) {
				$viewerSlider.height($currentImage.height());
				$slideCurrent.css('line-height', ($currentImage.height() + 'px'));
			}
			if ($currentImage.get(0).naturalWidth >= $currentImage.get(0).naturalHeight && $currentImage.width() < 690) {
				$currentImage.width('');
				$currentImage.height('');
				$currentImage.width(690);
			} else if ($currentImage.get(0).naturalHeight > $currentImage.get(0).naturalWidth && $currentImage.height() < 740) {
				$currentImage.width('');
				$currentImage.height('');
				$currentImage.height(740);
			}
			updateViewerSize();
		},
		//Переключает viewer по клавиатуре
		switchViewerByKey: function (keyEntered) {
			var _this = this;
			if ($('#viewer-container').css('visibility') == 'visible' && !$(document.activeElement).hasClass('viewer-block-slider-item')) {
				switch (keyEntered.keyCode) {
					case 27:
						toggleViewer();
						break;
					case 39:
						if (viewerImages.clickable) {
							nextSlide();
							_this.setControls();
						}
						break;
					case 37:
						if (viewerImages.clickable) {
							prevSlide();
							_this.setControls();
						}
						break;
					case 32:
						var modalOpened = $('.modal--opened').length;
						if (viewerImages.clickable && !modalOpened) {
							nextSlide();
							_this.setControls();
						}
						break;
					case 13:
						keyEntered.preventDefault();
						break;
				}
			}
		},
		appendCursor: function (elem, autoSize) {
			if (device.desktop()) {
				var $zoomBtn = $('<div />', {
					'class': 'viewer-start-photo-btn'
				});
				var $wrapper = $('<div />', {
					'class': 'viewer-start-photo'
				});
				if (!autoSize) {
					var width = $(elem).css('width');
					var height = $(elem).css('height');
					$wrapper.width(width);
					$wrapper.height(height);
				}
				elem.wrap($wrapper);
				elem.after($zoomBtn);
			}
		},
		updateModerationData: function () {
			if (
				window._moderationModule &&
				typeof window._moderationModule.reNewData === 'function'
			) {
				window._moderationModule.reNewData()
			}
		}
	}
})();

//Плагин определения прогрузки изображения
;(function ($) {
	$.fn.bindImageLoad = function (callback) {
		function isImageLoaded(img) {
			if (!img.complete) {
				return false;
			}
			if (typeof img.naturalWidth !== 'undefined' && img.naturalWidth === 0) {
				return false;
			}
			return true;
		}
		return this.each(function () {
			var ele = $(this);
			if (ele.is('img') && $.isFunction(callback)) {
				ele.one('load', callback);
				if (isImageLoaded(this)) {
					ele.trigger('load');
				}
			}
		});
	};
})(jQuery);
