.. include:: ../../Includes.txt

==========================================
Feature: #90522 - Introduce AssetCollector
==========================================

See :issue:`90522`

Description
===========

AssetCollector is a concept to allow custom CSS/JS code, inline or external, to be added multiple
times in e.g. a Fluid template (via :html:`<f:asset.script>` or :html:`<f:asset.css>` ViewHelpers) but only rendered once
in the output.

It supports best practices for optimizing page performance by having a "priority" flag to either
move the asset to the :html:`<head>` section (useful for CSS in above-the-fold concepts) or to the
bottom of the :html:`<body>` tag.

AssetCollector helps to work with content elements as components, effectively reducing the amount
of CSS to be loaded. It also incorporates the HTTP/2 power where it is not relevant to have all
files compressed and concatenated in one file (although this could be added later-on).

AssetCollector is implemented as singleton and should slowly replace the various existing options
in TypoScript.

AssetCollector also collects information about "imagesOnPage", effectively taking off pressure from
PageRenderer and TSFE to store common data in FE - as this is now handled in AssetCollector,
which can be used in cached and non-cached components.

The new API
-----------

- :php:`\TYPO3\CMS\Core\Page\AssetCollector::addJavaScript(string $identifier, string $source, array $attributes, array $options = []): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::addInlineJavaScript(string $identifier, string $source, array $attributes, array $options = []): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::addStyleSheet(string $identifier, string $source, array $attributes, array $options = []): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::addInlineStyleSheet(string $identifier, string $source, array $attributes, array $options = []): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::addMedia(string $fileName, array $additionalInformation): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::removeJavaScript(string $identifier): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::removeInlineJavaScript(string $identifier): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::removeStyleSheet(string $identifier): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::removeInlineStyleSheet(string $identifier): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::removeMedia(string $identifier): self`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::getJavaScripts(): array`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::getInlineJavaScripts(): array`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::getStyleSheets(): array`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::getInlineStyleSheets(): array`
- :php:`\TYPO3\CMS\Core\Page\AssetCollector::getMedia(): array`

New ViewHelpers
---------------

There are also two new ViewHelpers, the :html:`<f:asset.css>` and the - :html:`<f:asset.script>` ViewHelper which use the AssetCollector API.

.. code-block:: html

   <f:asset.css identifier="identifier123" href="EXT:my_ext/Resources/Public/Css/foo.css" />
   <f:asset.css identifier="identifier123">
      .foo { color: black; }
   </f:asset.css>

   <f:asset.script identifier="identifier123" src="EXT:my_ext/Resources/Public/JavaScript/foo.js" />
   <f:asset.script identifier="identifier123">
      alert('hello world');
   </f:asset.script>

Considerations
--------------

Currently, assets registered with the AssetCollector are not included in callbacks of these hooks:

- :php:`$GLOBALS['TYPO3_CONF_VARS'][TYPO3_MODE]['cssCompressHandler']`
- :php:`$GLOBALS['TYPO3_CONF_VARS'][TYPO3_MODE]['jsCompressHandler']`
- :php:`$GLOBALS['TYPO3_CONF_VARS'][TYPO3_MODE]['cssConcatenateHandler']`
- :php:`$GLOBALS['TYPO3_CONF_VARS'][TYPO3_MODE]['jsConcatenateHandler']`

Currently, CSS and JavaScript registered with the AssetCollector will always be rendered after their
PageRenderer counterparts. The order is:

- :html:`<head>`
- :ts:`page.includeJSLibs.forceOnTop`
- :ts:`page.includeJSLibs`
- :ts:`page.includeJS.forceOnTop`
- :ts:`page.includeJS`
- :php:`AssetCollector::addJavaScript()` with 'priority'
- :ts:`page.jsInline`
- :php:`AssetCollector::addInlineJavaScript()` with 'priority'
- :html:`</head>`

- :ts:`page.includeJSFooterlibs.forceOnTop`
- :ts:`page.includeJSFooterlibs`
- :ts:`page.includeJSFooter.forceOnTop`
- :ts:`page.includeJSFooter`
- :php:`AssetCollector::addJavaScript()`
- :ts:`page.jsFooterInline`
- :php:`AssetCollector::addInlineJavaScript()`

Currently, JavaScript registered with AssetCollector is not affected by
:ts:`config.moveJsFromHeaderToFooter`.

Examples
--------

Add a JavaScript file to the collector with script attribute data-foo="bar":

.. code-block:: php

    GeneralUtility::makeInstance(AssetCollector::class)
       ->addJavaScript('my_ext_foo', 'EXT:my_ext/Resources/Public/JavaScript/foo.js', ['data-foo' => 'bar']);

Add a JavaScript file to the collector with script attribute :html:`data-foo="bar"` and priority which means rendering before other script tags:

.. code-block:: php

    GeneralUtility::makeInstance(AssetCollector::class)
       ->addJavaScript('my_ext_foo', 'EXT:my_ext/Resources/Public/JavaScript/foo.js', ['data-foo' => 'bar'], ['priority' => true]);

Add a JavaScript file to the collector with :html:`type="module"` (by default, no type= is output for JavaScript):

.. code-block:: php

    GeneralUtility::makeInstance(AssetCollector::class)
       ->addJavaScript('my_ext_foo', 'EXT:my_ext/Resources/Public/JavaScript/foo.js', ['type' => 'module']);

.. index:: Backend, Frontend, PHP-API, ext:core
