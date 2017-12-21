/**
 * BLOCK: Basic
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 *
 * Styles:
 *        editor.css — Editor styles for the block.
 *        style.css  — Editor & Front end styles for the block.
 */
(function () {
	var __ = wp.i18n.__; // The __() for internationalization.
	var el = wp.element.createElement; // The wp.element.createElement() function to create elements.
	var registerBlockType = wp.blocks.registerBlockType; // The registerBlockType() to register blocks.
	var BlockControls = wp.blocks.BlockControls;
	var InspectorControls = wp.blocks.InspectorControls;
	var Editable = wp.blocks.Editable; // Editable component of React.
	var MediaUploadButton = wp.blocks.MediaUploadButton;
	var BlockDescription = wp.blocks.BlockDescription;
	var Dashicon = wp.components.Dashicon;
	var DropZone = wp.components.DropZone;
	var Toolbar = wp.components.Toolbar;
	var Placeholder = wp.components.Placeholder;
	var FormFileUpload = wp.components.FormFileUpload;
	var PanelBody = wp.components.PanelBody;
	var mediaUpload = wp.utils.mediaUpload;



	/**
	 * Register Basic Block.
	 *
	 * Registers a new block provided a unique name and an object defining its
	 * behavior. Once registered, the block is made available as an option to any
	 * editor interface where blocks are implemented.
	 *
	 * @param  {string}   name     Block name.
	 * @param  {Object}   settings Block settings.
	 * @return {?WPBlock}          The block, if it has been successfully
	 *                             registered; otherwise `undefined`.
	 */
	registerBlockType('gb/slider', { // Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
		title: __('GB Slider', 'GB'), // Block title.
		icon: 'slides', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
		category: 'common', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.

		attributes: {
			slides: {
				type: 'number',
				default: 0,
			},
			showArrows: {
				type: 'boolean',
				default: false,
			},
			showDots: {
				type: 'boolean',
				default: false,
			},
			spaceBetween: {
				type: 'number',
				default: 0,
			},
			images: {
				type: 'Array',
				default: []
			}
		},

		// The "edit" property must be a valid function.
		edit: function (props) {
			var blockAPI = {
				slider: null,
				onSlidesNumberChange: function (num) {
					props.setAttributes({ slides: num });
					blockAPI.initSwiper();
				},
				onSelectImages: function (imgs) {
					props.setAttributes({ images: imgs });
					blockAPI.initSwiper();
				},
				setArrows: function () {
					props.setAttributes({ showArrows: !props.attributes.showArrows });
					blockAPI.initSwiper();
				},
				setDots: function () {
					props.setAttributes({ showDots: !props.attributes.showDots });

					blockAPI.initSwiper();
				},
				setSpaceBetween: function (num) {
					console.log(num);
					props.setAttributes({ spaceBetween: num });

					blockAPI.initSwiper();
				},
				uploadFromFiles: function (event) {
					mediaUpload(event.target.files, this.props.setAttributes, isGallery);
				},
				getSliderProps: function () {
					var attrs = {};
					if (props.attributes.showDots) {
						attrs.pagination = {
							el: '.swiper-pagination',
							type: 'bullets',
							clickable: true,
						};
					}
					if (props.attributes.showArrows) {
						attrs.navigation = {
							nextEl: '.swiper-button-next',
							prevEl: '.swiper-button-prev',
						};
					}
					if (props.attributes.spaceBetween) {
						attrs.spaceBetween = props.attributes.spaceBetween;
					}

					return attrs;
				},

				getControls: function () {
					if (!!focus) {
						return el(
							InspectorControls,
							{ key: 'inspector' },
							el(
								PanelBody,
								{
									title: 'Slider Settings',
								},
								el(
									BlockDescription,
									null,
									'Right now the number of slides is ' + props.attributes.slides,
								),
								el(
									InspectorControls.ToggleControl,
									{
										label: __('Show Arrows'),
										checked: props.attributes.showArrows,
										onChange: this.setArrows
									}
								),
								el(
									InspectorControls.ToggleControl,
									{
										label: __('Show dots'),
										checked: props.attributes.showDots,
										onChange: this.setDots
									}
								),
								el(
									InspectorControls.TextControl,
									{
										label: __('Space between slides (in pixels)'),
										type: 'number',
										value: props.attributes.spaceBetween,
										onChange: this.setSpaceBetween,
									}
								),
								// el(
								// 	InspectorControls.RangeControl,
								// 	{
								// 		label: 'Slides',
								// 		value: props.attributes.slides,
								// 		min: 1,
								// 		max: 10,
								// 		onChange: this.onSlidesNumberChange
								// 	}
								// ),
							),
						);
					}

					return false;

				},

				_generateSlide: function (img) {
					return el(
						'div',
						{
							className: 'swiper-slide',
						},
						el(
							'img',
							{
								src: img.sizes.full.url,
								alt: img.alt,
								'data-id': img.id,
							},
						),
					);
				},

				_generateSlideControls: function () {
					var controls = [];

					if (props.attributes.showArrows) {
						controls.push(el(
							'div',
							{ className: 'swiper-button-prev' }
						));
						controls.push(el(
							'div',
							{ className: 'swiper-button-next' }
						));
					}

					// if( props.attributes.showDots ){
					// 	controls.push( el(
					// 		'div',
					// 		{ className: 'swiper-pagination' }
					// 	) );
					// }

					return controls;
				},

				getUI: function () {
					var self = this;
					if (Object.keys(props.attributes.images).length === 0) {
						return [
							el(
								Placeholder,
								{
									key: "placeholder",
									instructions: __('Drag images here or insert from media library'),
									icon: "slides",
									label: __('Slideshow'),
									className: props.className,
								},
								el(
									DropZone,
									{
										onFilesDrop: self.dropFiles,
									}
								),
								el(
									FormFileUpload,
									{
										isLarge: true,
										className: "wp-block-image__upload-button",
										onChange: self.uploadFromFiles,
										accept: "image/*",
										multiple: true,
									},
									__('Upload'),
								),
								el(
									MediaUploadButton,
									{
										buttonProps: {
											isLarge: true,
										},
										onSelect: self.onSelectImages,
										type: "image",
										multiple: true,
										gallery: true,
									},
									__('Insert from Media Library'),
								),
							),
						];
					} else {
						var slides = props.attributes.images.map(function (img, index) {
							return self._generateSlide(img);
						}),
							sliderControls = this._generateSlideControls();
						slider = el(
							'div',
							{ className: 'swiper-container' },
							el(
								'div',
								{ className: 'swiper-wrapper' },
								slides
							),
							props.attributes.showDots && el(
								'div',
								{ className: 'swiper-pagination' },
							),
							props.attributes.showArrows && el(
								'div',
								{ className: 'swiper-button-prev' },
							),
							props.attributes.showArrows && el(
								'div',
								{ className: 'swiper-button-next' },
							),
							// sliderControls
						);

						return slider;
					}
				},

				initSwiper: function () {
					if (this.slider) {
						this.slider.destroy();
					}
					if (Object.keys(props.attributes.images).length > 0) {
						this.slider = new Swiper('.swiper-container', this.getSliderProps());
					}
				}

			};

			blockAPI.initSwiper();

			var controls = blockAPI.getControls();
			var UI = blockAPI.getUI();
			return [
				controls,
				UI,
			];
		},

		// The "save" property must be specified and must be a valid function.
		save: function (props) {
			return el(
				'p', // Tag type.
				{ className: props.className }, // The class="wp-block-gb-basic-01" : The class name is generated using the block's name prefixed with wp-block-, replacing the / namespace separator with a single -.
				'Hello World! — from the frontend (01 Basic Block).' // Content inside the tag.
			);
		},
	});
})();
