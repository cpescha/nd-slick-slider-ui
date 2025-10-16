(function(wp){
  const { registerBlockType } = wp.blocks;
  const { __ } = wp.i18n;
  const { Notice, PanelBody } = wp.components;
  const { InspectorControls } = wp.blockEditor || wp.editor;

  registerBlockType('nd/slick-assets', {
    title: __('Slick Slider – Assets', 'nd-slick-slider-ui'),
    icon: 'slides',
    category: 'widgets',
    description: __('Lädt Slick & Init NUR auf dieser Seite. Kein Frontend-Output – UI baust du frei mit GenerateBlocks.', 'nd-slick-slider-ui'),
    supports: { multiple: false, html: false },
    edit: () => {
      return [
        wp.element.createElement(InspectorControls, {},
          wp.element.createElement(PanelBody, { title: __('Hinweis', 'nd-slick-slider-ui'), initialOpen: true },
            wp.element.createElement('p', null, __('Setze im Inhalt deinen UI-Container (class `.slick-ui`, Attribut `data-for="slider-x"`), inkl. `.slick-nav-dots`, `.slick-nav-counter`, `.slider-autoplay-toggle`, `.slick-controls-row`/`.slick-nav-arrows` nach Bedarf.', 'nd-slick-slider-ui'))
          )
        ),
        wp.element.createElement('div', { className: 'nd-slick-assets-placeholder' },
          wp.element.createElement(Notice, { status: 'info', isDismissible: false },
            __('Slick Assets werden auf dieser Seite geladen.', 'nd-slick-slider-ui')
          )
        )
      ];
    },
    save: () => null,
  });
})(window.wp);