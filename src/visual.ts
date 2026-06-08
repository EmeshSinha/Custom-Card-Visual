"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions       = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual                   = powerbi.extensibility.visual.IVisual;
import DataView                  = powerbi.DataView;

import { VisualFormattingSettingsModel } from "./settings";

// ─── SVG icons ───────────────────────────────────────────────────
const ICON_UP   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
const ICON_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
const ICON_FLAT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

const ROLE_NAMES = ["measure1", "measure2", "measure3", "measure4", "measure5"];
const CARD_KEYS  = ["card1", "card2", "card3", "card4", "card5"] as const;

interface CardData {
    title:           string;
    value:           string;
    numericValue:    number | null;
    accentColor:     string;
    backgroundColor: string;
    textColor:       string;        // value text color
    alignment:       string;        // "left" | "center" | "right"
    fontSize:        number;
    valueFontSize:   number;
    show:            boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────
function formatValue(raw: powerbi.PrimitiveValue): string {
    if (raw === null || raw === undefined) return "—";
    const n = typeof raw === "number" ? raw : Number(raw);
    if (isNaN(n)) return String(raw);
    if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
    if (Math.abs(n) >= 1_000_000)     return (n / 1_000_000).toFixed(1) + "M";
    if (Math.abs(n) >= 1_000)         return (n / 1_000).toFixed(1) + "K";
    if (Number.isInteger(n))          return n.toLocaleString();
    return n.toFixed(2);
}

function toNumber(raw: powerbi.PrimitiveValue): number | null {
    if (raw === null || raw === undefined) return null;
    const n = typeof raw === "number" ? raw : Number(raw);
    return isNaN(n) ? null : n;
}

function parseSVG(svgString: string): Element {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    return doc.documentElement;
}

// ─── Visual ──────────────────────────────────────────────────────
export class Visual implements IVisual {
    private readonly target:    HTMLElement;
    private readonly container: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private readonly formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.target.style.overflow = "hidden";
        this.target.style.width    = "100%";
        this.target.style.height   = "100%";

        this.container = document.createElement("div");
        this.container.className = "pbi-consolidated-card";
        this.target.appendChild(this.container);
    }

    public update(options: VisualUpdateOptions): void {
        try {
            const firstDv = options.dataViews?.length > 0 ? options.dataViews[0] : undefined;
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, firstDv);

            const cardData = this.extractCardData(firstDv);
            this.render(cardData, options.viewport);
        } catch (err) {
            console.error("Consolidated KPI Card Visual Error:", err);
            this.container.textContent = "";
            const errDiv = document.createElement("div");
            errDiv.className = "pbi-empty";
            errDiv.textContent = `Visual error: ${String(err)}`;
            this.container.appendChild(errDiv);
        }
    }

    private extractCardData(dataView: DataView | undefined): CardData[] {
        const s = this.formattingSettings;

        const roleRawMap: Record<string, powerbi.PrimitiveValue> = {};
        if (dataView?.table) {
            const cols = dataView.table.columns ?? [];
            const rows = dataView.table.rows    ?? [];
            const row  = rows.length > 0 ? rows[0] : [];
            cols.forEach((col, colIdx) => {
                Object.keys(col.roles ?? {}).forEach(role => {
                    roleRawMap[role] = row[colIdx] ?? null;
                });
            });
        }

        return CARD_KEYS.map((key, idx) => {
            const cs  = s[key];
            const raw = roleRawMap[ROLE_NAMES[idx]] ?? null;
            const num = toNumber(raw);

            const defaultAccent  = cs.accentColor.value?.value    ?? "#0A3D62";

            // Read alignment — ItemDropdown returns an IEnumMember with .value
            const alignRaw  = (cs.alignment.value as any)?.value ?? "center";
            const alignment = ["left", "center", "right"].includes(alignRaw) ? alignRaw : "center";

            return {
                title:           cs.title.value               ?? `KPI ${idx + 1}`,
                value:           formatValue(raw),
                numericValue:    num,
                accentColor:     defaultAccent,
                backgroundColor: cs.backgroundColor.value?.value ?? "#FFFFFF",
                textColor:       cs.textColor.value?.value        ?? "#111111",
                alignment,
                fontSize:        cs.fontSize.value             ?? 12,
                valueFontSize:   cs.valueFontSize.value        ?? 26,
                show:            cs.show.value                 ?? true
            };
        });
    }

    private render(cards: CardData[], viewport: powerbi.IViewport): void {
        const s            = this.formattingSettings;
        const gap          = s.layout.cardGap.value      ?? 12;
        const cornerRadius = s.layout.cornerRadius.value ?? 16;
        const showIcons    = s.layout.showIcons.value    ?? true;
        const showShadow   = s.layout.showShadow.value   ?? true;
        const showBorder   = s.layout.showBorder.value   ?? true;
        const cardBorderColor = s.layout.cardBorderColor.value?.value ?? "#4A6B82";

        this.container.textContent = "";
        this.container.style.width  = `${viewport.width}px`;
        this.container.style.height = `${viewport.height}px`;
        this.container.style.background = cards[0]?.backgroundColor ?? "#FFFFFF";
        this.container.style.borderRadius = `${cornerRadius}px`;

        if (showBorder) {
            this.container.style.border = `1.5px solid ${cardBorderColor}`;
        } else {
            this.container.style.border = "none";
        }

        if (showShadow) {
            this.container.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
        } else {
            this.container.style.boxShadow = "none";
        }

        // ── 1. Render Main KPI (Card 1) ──────────────────────────
        const mainCard = cards[0];
        if (mainCard && mainCard.show) {
            const mainKpiSection = document.createElement("div");
            mainKpiSection.className = `pbi-consolidated-card__main-kpi pbi-card--align-${mainCard.alignment}`;

            const value = document.createElement("div");
            value.className = "pbi-consolidated-card__main-value";
            value.style.fontSize = `${mainCard.valueFontSize}px`;
            value.style.color = mainCard.textColor;
            value.textContent = mainCard.value;
            mainKpiSection.appendChild(value);

            const label = document.createElement("div");
            label.className = "pbi-consolidated-card__main-label";
            label.style.fontSize = `${mainCard.fontSize}px`;
            label.textContent = mainCard.title;
            mainKpiSection.appendChild(label);

            this.container.appendChild(mainKpiSection);
        }

        // ── 2. Filter & Render 2x2 Grid of Sub KPIs (Cards 2-5) ──
        const subCards = cards.slice(1);
        const visibleSubCards = subCards.filter(c => c.show);

        if (visibleSubCards.length > 0) {
            // Sub Grid Container
            const subKpiGrid = document.createElement("div");
            subKpiGrid.className = "pbi-consolidated-card__sub-grid";
            subKpiGrid.style.gap = `${gap}px`;

            visibleSubCards.forEach((card) => {
                const item = document.createElement("div");
                item.className = `pbi-consolidated-card__sub-item pbi-card--align-${card.alignment}`;

                const value = document.createElement("div");
                value.className = "pbi-consolidated-card__sub-value";
                value.style.fontSize = `${card.valueFontSize}px`;
                value.style.color = card.textColor;
                value.textContent = card.value;
                item.appendChild(value);

                const label = document.createElement("div");
                label.className = "pbi-consolidated-card__sub-label";
                label.style.fontSize = `${card.fontSize}px`;
                label.textContent = card.title;
                item.appendChild(label);

                if (showIcons && card.value !== "—" && card.numericValue !== null) {
                    const raw = card.numericValue;
                    const trend = document.createElement("div");
                    trend.className = "pbi-card__trend";

                    const iconSpan = document.createElement("span");
                    iconSpan.className = "pbi-trend-icon";
                    
                    const textSpan = document.createElement("span");

                    if (raw > 0) {
                        trend.classList.add("pbi-card__trend--up");
                        iconSpan.appendChild(parseSVG(ICON_UP));
                        textSpan.textContent = "Positive";
                    } else if (raw < 0) {
                        trend.classList.add("pbi-card__trend--down");
                        iconSpan.appendChild(parseSVG(ICON_DOWN));
                        textSpan.textContent = "Negative";
                    } else {
                        trend.classList.add("pbi-card__trend--flat");
                        iconSpan.appendChild(parseSVG(ICON_FLAT));
                        textSpan.textContent = "Neutral";
                    }

                    trend.appendChild(iconSpan);
                    trend.appendChild(textSpan);
                    item.appendChild(trend);
                }

                subKpiGrid.appendChild(item);
            });

            this.container.appendChild(subKpiGrid);
        }
    }

    private renderEmpty(msg: string): void {
        const div = document.createElement("div");
        div.className   = "pbi-empty";
        div.textContent = msg;
        this.container.appendChild(div);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}