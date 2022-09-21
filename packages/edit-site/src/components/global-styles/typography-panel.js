/**
 * WordPress dependencies
 */
import {
	LineHeightControl,
	__experimentalFontFamilyControl as FontFamilyControl,
	__experimentalFontAppearanceControl as FontAppearanceControl,
	__experimentalLetterSpacingControl as LetterSpacingControl,
} from '@wordpress/block-editor';
import {
	FontSizePicker,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getSupportedGlobalStylesPanels, useSetting, useStyle } from './hooks';

export function useHasTypographyPanel( name ) {
	const hasLineHeight = useHasLineHeightControl( name );
	const hasFontAppearance = useHasAppearanceControl( name );
	const hasLetterSpacing = useHasLetterSpacingControl( name );
	const supports = getSupportedGlobalStylesPanels( name );
	return (
		hasLineHeight ||
		hasFontAppearance ||
		hasLetterSpacing ||
		supports.includes( 'fontSize' )
	);
}

function useHasLineHeightControl( name ) {
	const supports = getSupportedGlobalStylesPanels( name );
	return (
		useSetting( 'typography.lineHeight', name )[ 0 ] &&
		supports.includes( 'lineHeight' )
	);
}

function useHasAppearanceControl( name ) {
	const supports = getSupportedGlobalStylesPanels( name );
	const hasFontStyles =
		useSetting( 'typography.fontStyle', name )[ 0 ] &&
		supports.includes( 'fontStyle' );
	const hasFontWeights =
		useSetting( 'typography.fontWeight', name )[ 0 ] &&
		supports.includes( 'fontWeight' );
	return hasFontStyles || hasFontWeights;
}

function useAppearanceControlLabel( name ) {
	const supports = getSupportedGlobalStylesPanels( name );
	const hasFontStyles =
		useSetting( 'typography.fontStyle', name )[ 0 ] &&
		supports.includes( 'fontStyle' );
	const hasFontWeights =
		useSetting( 'typography.fontWeight', name )[ 0 ] &&
		supports.includes( 'fontWeight' );
	if ( ! hasFontStyles ) {
		return __( 'Font weight' );
	}
	if ( ! hasFontWeights ) {
		return __( 'Font style' );
	}
	return __( 'Appearance' );
}

function useHasLetterSpacingControl( name ) {
	const supports = getSupportedGlobalStylesPanels( name );
	return (
		useSetting( 'typography.letterSpacing', name )[ 0 ] &&
		supports.includes( 'letterSpacing' )
	);
}

function useStyleWithReset( path, blockName ) {
	const [ style, setStyle ] = useStyle( path, blockName );
	const [ userStyle ] = useStyle( path, blockName, 'user' );
	const hasStyle = () => !! userStyle;
	const resetStyle = () => setStyle( undefined );
	return [ style, setStyle, hasStyle, resetStyle ];
}

function useFontAppearance( prefix, name ) {
	const [ fontStyle, setFontStyle ] = useStyle(
		prefix + 'typography.fontStyle',
		name
	);
	const [ userFontStyle ] = useStyle(
		prefix + 'typography.fontStyle',
		name,
		'user'
	);
	const [ fontWeight, setFontWeight ] = useStyle(
		prefix + 'typography.fontWeight',
		name
	);
	const [ userFontWeight ] = useStyle(
		prefix + 'typography.fontWeight',
		name,
		'user'
	);
	const hasFontAppearance = () => !! userFontStyle || !! userFontWeight;
	const resetFontAppearance = () => {
		setFontStyle( undefined );
		setFontWeight( undefined );
	};
	return {
		fontStyle,
		setFontStyle,
		fontWeight,
		setFontWeight,
		hasFontAppearance,
		resetFontAppearance,
	};
}

export default function TypographyPanel( { name, element, headingLevel } ) {
	const supports = getSupportedGlobalStylesPanels( name );
	let prefix = '';
	if ( element === 'heading' ) {
		prefix = `elements.${ headingLevel }.`;
	} else if ( element && element !== 'text' ) {
		prefix = `elements.${ element }.`;
	}
	const [ fontSizes ] = useSetting( 'typography.fontSizes', name );
	const disableCustomFontSizes = ! useSetting(
		'typography.customFontSize',
		name
	)[ 0 ];
	const [ fontFamilies ] = useSetting( 'typography.fontFamilies', name );
	const hasFontStyles =
		useSetting( 'typography.fontStyle', name )[ 0 ] &&
		supports.includes( 'fontStyle' );
	const hasFontWeights =
		useSetting( 'typography.fontWeight', name )[ 0 ] &&
		supports.includes( 'fontWeight' );
	const hasLineHeightEnabled = useHasLineHeightControl( name );
	const hasAppearanceControl = useHasAppearanceControl( name );
	const appearanceControlLabel = useAppearanceControlLabel( name );
	const hasLetterSpacingControl = useHasLetterSpacingControl( name );

	/* Disable font size controls when the option to style all headings is selected. */
	let hasFontSizeEnabled = supports.includes( 'fontSize' );
	if ( element === 'heading' && headingLevel === 'heading' ) {
		hasFontSizeEnabled = false;
	}

	const [ fontFamily, setFontFamily, hasFontFamily, resetFontFamily ] =
		useStyleWithReset( prefix + 'typography.fontFamily', name );
	const [ fontSize, setFontSize, hasFontSize, resetFontSize ] =
		useStyleWithReset( prefix + 'typography.fontSize', name );
	const {
		fontStyle,
		setFontStyle,
		fontWeight,
		setFontWeight,
		hasFontAppearance,
		resetFontAppearance,
	} = useFontAppearance( prefix, name );
	const [ lineHeight, setLineHeight, hasLineHeight, resetLineHeight ] =
		useStyleWithReset( prefix + 'typography.lineHeight', name );
	const [
		letterSpacing,
		setLetterSpacing,
		hasLetterSpacing,
		resetLetterSpacing,
	] = useStyleWithReset( prefix + 'typography.letterSpacing', name );

	const resetAll = () => {
		resetFontFamily();
		resetFontSize();
		resetFontAppearance();
		resetLineHeight();
		resetLetterSpacing();
	};

	return (
		<ToolsPanel label={ __( 'Typography' ) } resetAll={ resetAll }>
			{ supports.includes( 'fontFamily' ) && (
				<ToolsPanelItem
					label={ __( 'Font family' ) }
					hasValue={ hasFontFamily }
					onDeselect={ resetFontFamily }
					isShownByDefault
				>
					<FontFamilyControl
						fontFamilies={ fontFamilies }
						value={ fontFamily }
						onChange={ setFontFamily }
						size="__unstable-large"
						__nextHasNoMarginBottom
					/>
				</ToolsPanelItem>
			) }
			{ hasFontSizeEnabled && (
				<ToolsPanelItem
					label={ __( 'Font size' ) }
					hasValue={ hasFontSize }
					onDeselect={ resetFontSize }
					isShownByDefault
				>
					<FontSizePicker
						value={ fontSize }
						onChange={ setFontSize }
						fontSizes={ fontSizes }
						disableCustomFontSizes={ disableCustomFontSizes }
						size="__unstable-large"
						__nextHasNoMarginBottom
					/>
				</ToolsPanelItem>
			) }
			{ hasAppearanceControl && (
				<ToolsPanelItem
					className="single-column"
					label={ appearanceControlLabel }
					hasValue={ hasFontAppearance }
					onDeselect={ resetFontAppearance }
					isShownByDefault
				>
					<FontAppearanceControl
						value={ {
							fontStyle,
							fontWeight,
						} }
						onChange={ ( {
							fontStyle: newFontStyle,
							fontWeight: newFontWeight,
						} ) => {
							setFontStyle( newFontStyle );
							setFontWeight( newFontWeight );
						} }
						hasFontStyles={ hasFontStyles }
						hasFontWeights={ hasFontWeights }
						size="__unstable-large"
						__nextHasNoMarginBottom
					/>
				</ToolsPanelItem>
			) }
			{ hasLineHeightEnabled && (
				<ToolsPanelItem
					className="single-column"
					label={ __( 'Line height' ) }
					hasValue={ hasLineHeight }
					onDeselect={ resetLineHeight }
					isShownByDefault
				>
					<LineHeightControl
						__nextHasNoMarginBottom
						__unstableInputWidth="auto"
						value={ lineHeight }
						onChange={ setLineHeight }
						size="__unstable-large"
					/>
				</ToolsPanelItem>
			) }
			{ hasLetterSpacingControl && (
				<ToolsPanelItem
					className="single-column"
					label={ __( 'Letter spacing' ) }
					hasValue={ hasLetterSpacing }
					onDeselect={ resetLetterSpacing }
					isShownByDefault
				>
					<LetterSpacingControl
						value={ letterSpacing }
						onChange={ setLetterSpacing }
						size="__unstable-large"
						__unstableInputWidth="auto"
					/>
				</ToolsPanelItem>
			) }
		</ToolsPanel>
	);
}
