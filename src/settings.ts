"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard  = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

// ─── Alignment items (shared) ─────────────────────────────────────
const ALIGNMENT_ITEMS = [
    { displayName: "Left",   value: "left"   },
    { displayName: "Center", value: "center" },
    { displayName: "Right",  value: "right"  },
];
const ALIGN_DEFAULT = { displayName: "Left", value: "left" };

// ─── Default palettes ─────────────────────────────────────────────
const ACCENT_DEFAULTS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];
const TITLE_DEFAULTS  = ["KPI 1",   "KPI 2",   "KPI 3",  "KPI 4",  "KPI 5" ];

class Card1Settings extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({
        name: "title", displayName: "KPI Name", placeholder: "Card 1 title", value: TITLE_DEFAULTS[0]
    });
    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor", displayName: "Accent Color", value: { value: ACCENT_DEFAULTS[0] },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor", displayName: "Background Color", value: { value: "#FFFFFF" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    textColor = new formattingSettings.ColorPicker({
        name: "textColor", displayName: "Value Text Color", value: { value: "#111111" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    alignment = new formattingSettings.ItemDropdown({
        name: "alignment", displayName: "Text Alignment",
        items: ALIGNMENT_ITEMS, value: ALIGN_DEFAULT
    });
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize", displayName: "Title Font Size", value: 13
    });
    valueFontSize = new formattingSettings.NumUpDown({
        name: "valueFontSize", displayName: "Value Font Size", value: 28
    });
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily", displayName: "Font Family", value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });
    show = new formattingSettings.ToggleSwitch({
        name: "show", displayName: "Show Card", value: true
    });
    name        = "card1";
    displayName = "Card 1";
    slices: Array<FormattingSettingsSlice> = [
        this.show, this.title, this.alignment,
        this.accentColor, this.backgroundColor, this.textColor,
        this.fontSize, this.valueFontSize, this.fontFamily
    ];
}

class Card2Settings extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({
        name: "title", displayName: "KPI Name", placeholder: "Card 2 title", value: TITLE_DEFAULTS[1]
    });
    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor", displayName: "Accent Color", value: { value: ACCENT_DEFAULTS[1] },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor", displayName: "Background Color", value: { value: "#FFFFFF" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    textColor = new formattingSettings.ColorPicker({
        name: "textColor", displayName: "Value Text Color", value: { value: "#111111" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    alignment = new formattingSettings.ItemDropdown({
        name: "alignment", displayName: "Text Alignment",
        items: ALIGNMENT_ITEMS, value: ALIGN_DEFAULT
    });
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize", displayName: "Title Font Size", value: 13
    });
    valueFontSize = new formattingSettings.NumUpDown({
        name: "valueFontSize", displayName: "Value Font Size", value: 28
    });
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily", displayName: "Font Family", value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });
    show = new formattingSettings.ToggleSwitch({
        name: "show", displayName: "Show Card", value: true
    });
    name        = "card2";
    displayName = "Card 2";
    slices: Array<FormattingSettingsSlice> = [
        this.show, this.title, this.alignment,
        this.accentColor, this.backgroundColor, this.textColor,
        this.fontSize, this.valueFontSize, this.fontFamily
    ];
}

class Card3Settings extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({
        name: "title", displayName: "KPI Name", placeholder: "Card 3 title", value: TITLE_DEFAULTS[2]
    });
    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor", displayName: "Accent Color", value: { value: ACCENT_DEFAULTS[2] },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor", displayName: "Background Color", value: { value: "#FFFFFF" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    textColor = new formattingSettings.ColorPicker({
        name: "textColor", displayName: "Value Text Color", value: { value: "#111111" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    alignment = new formattingSettings.ItemDropdown({
        name: "alignment", displayName: "Text Alignment",
        items: ALIGNMENT_ITEMS, value: { displayName: "Center", value: "center" }
    });
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize", displayName: "Title Font Size", value: 13
    });
    valueFontSize = new formattingSettings.NumUpDown({
        name: "valueFontSize", displayName: "Value Font Size", value: 28
    });
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily", displayName: "Font Family", value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });
    show = new formattingSettings.ToggleSwitch({
        name: "show", displayName: "Show Card", value: true
    });
    name        = "card3";
    displayName = "Card 3 (Center)";
    slices: Array<FormattingSettingsSlice> = [
        this.show, this.title, this.alignment,
        this.accentColor, this.backgroundColor, this.textColor,
        this.fontSize, this.valueFontSize, this.fontFamily
    ];
}

class Card4Settings extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({
        name: "title", displayName: "KPI Name", placeholder: "Card 4 title", value: TITLE_DEFAULTS[3]
    });
    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor", displayName: "Accent Color", value: { value: ACCENT_DEFAULTS[3] },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor", displayName: "Background Color", value: { value: "#FFFFFF" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    textColor = new formattingSettings.ColorPicker({
        name: "textColor", displayName: "Value Text Color", value: { value: "#111111" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    alignment = new formattingSettings.ItemDropdown({
        name: "alignment", displayName: "Text Alignment",
        items: ALIGNMENT_ITEMS, value: ALIGN_DEFAULT
    });
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize", displayName: "Title Font Size", value: 13
    });
    valueFontSize = new formattingSettings.NumUpDown({
        name: "valueFontSize", displayName: "Value Font Size", value: 28
    });
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily", displayName: "Font Family", value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });
    show = new formattingSettings.ToggleSwitch({
        name: "show", displayName: "Show Card", value: true
    });
    name        = "card4";
    displayName = "Card 4";
    slices: Array<FormattingSettingsSlice> = [
        this.show, this.title, this.alignment,
        this.accentColor, this.backgroundColor, this.textColor,
        this.fontSize, this.valueFontSize, this.fontFamily
    ];
}

class Card5Settings extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({
        name: "title", displayName: "KPI Name", placeholder: "Card 5 title", value: TITLE_DEFAULTS[4]
    });
    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor", displayName: "Accent Color", value: { value: ACCENT_DEFAULTS[4] },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor", displayName: "Background Color", value: { value: "#FFFFFF" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    textColor = new formattingSettings.ColorPicker({
        name: "textColor", displayName: "Value Text Color", value: { value: "#111111" },
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
    });
    alignment = new formattingSettings.ItemDropdown({
        name: "alignment", displayName: "Text Alignment",
        items: ALIGNMENT_ITEMS, value: ALIGN_DEFAULT
    });
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize", displayName: "Title Font Size", value: 13
    });
    valueFontSize = new formattingSettings.NumUpDown({
        name: "valueFontSize", displayName: "Value Font Size", value: 28
    });
    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily", displayName: "Font Family", value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });
    show = new formattingSettings.ToggleSwitch({
        name: "show", displayName: "Show Card", value: true
    });
    name        = "card5";
    displayName = "Card 5";
    slices: Array<FormattingSettingsSlice> = [
        this.show, this.title, this.alignment,
        this.accentColor, this.backgroundColor, this.textColor,
        this.fontSize, this.valueFontSize, this.fontFamily
    ];
}

// ─── Layout Settings ──────────────────────────────────────────────
class LayoutCardSettings extends FormattingSettingsCard {
    cardGap = new formattingSettings.NumUpDown({
        name: "cardGap", displayName: "Gap Between Cards (px)", value: 12
    });
    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius", displayName: "Corner Radius (px)", value: 16
    });
    showShadow = new formattingSettings.ToggleSwitch({
        name: "showShadow", displayName: "Card Shadow", value: false
    });
    showBorder = new formattingSettings.ToggleSwitch({
        name: "showBorder", displayName: "Accent Border", value: false
    });
    cardBorderColor = new formattingSettings.ColorPicker({
        name: "cardBorderColor", displayName: "Card Border Color", value: { value: "#4A6B82" }
    });
    name        = "layout";
    displayName = "Layout";
    slices: Array<FormattingSettingsSlice> = [
        this.cardGap, this.cornerRadius,
        this.showShadow, this.showBorder,
        this.cardBorderColor
    ];
}

// ─── Full Settings Model ──────────────────────────────────────────
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    card1       = new Card1Settings();
    card2       = new Card2Settings();
    card3       = new Card3Settings();
    card4       = new Card4Settings();
    card5       = new Card5Settings();
    layout      = new LayoutCardSettings();

    cards = [this.card1, this.card2, this.card3, this.card4, this.card5, this.layout];
}
