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
const ICON_GOOD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
const ICON_BAD  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const ICON_WARN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

const ROLE_NAMES = ["measure1", "measure2", "measure3", "measure4", "measure5"];
const CARD_KEYS  = ["card1", "card2", "card3", "card4", "card5"] as const;
type  CardKey    = typeof CARD_KEYS[number];
type  CfStatus   = "good" | "bad" | "neutral" | "none";

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
    cfStatus:        CfStatus;
    cfActiveColor:   string;
    cfEnabled:       boolean;
    cfGoodColor:     string;
    cfBadColor:      string;
    cfNeutralColor:  string;
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

function evaluateCF(
    val: number | null, enabled: boolean,
    higherIsBetter: boolean, good: number, bad: number
): CfStatus {
    if (!enabled || val === null) return "none";
    if (higherIsBetter) {
        if (val >= good) return "good";
        if (val <= bad)  return "bad";
        return "neutral";
    } else {
        if (val <= good) return "good";
        if (val >= bad)  return "bad";
        return "neutral";
    }
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
            this.container.innerHTML =
                `<div class="pbi-empty">Visual error: ${String(err)}</div>`;
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

            const cfEnabled      = cs.cfEnabled.value         ?? false;
            const higherIsBetter = cs.cfHigherIsBetter.value  ?? true;
            const goodThreshold  = cs.cfGoodThreshold.value   ?? 1000;
            const badThreshold   = cs.cfBadThreshold.value    ?? 500;
            const cfGoodColor    = cs.cfGoodColor.value?.value    ?? "#10B981";
            const cfBadColor     = cs.cfBadColor.value?.value     ?? "#EF4444";
            const cfNeutralColor = cs.cfNeutralColor.value?.value ?? "#F59E0B";
            const defaultAccent  = cs.accentColor.value?.value    ?? "#0A3D62";

            const cfStatus = evaluateCF(num, cfEnabled, higherIsBetter, goodThreshold, badThreshold);
            const cfActiveColor =
                cfStatus === "good"    ? cfGoodColor    :
                cfStatus === "bad"     ? cfBadColor     :
                cfStatus === "neutral" ? cfNeutralColor :
                defaultAccent;

            // Read alignment — ItemDropdown returns an IEnumMember with .value
            const alignRaw  = (cs.alignment.value as any)?.value ?? "center";
            const alignment = ["left", "center", "right"].includes(alignRaw) ? alignRaw : "center";

            return {
                title:           cs.title.value               ?? `KPI ${idx + 1}`,
                value:           formatValue(raw),
                numericValue:    num,
                accentColor:     defaultAccent,
                backgroundColor: cs.backgroundColor.value?.value ?? "#FFFFFF",
                textColor:       cs.textColor.value?.value        ?? "#0A3D62",
                alignment,
                fontSize:        cs.fontSize.value             ?? 12,
                valueFontSize:   cs.valueFontSize.value        ?? 26,
                show:            cs.show.value                 ?? true,
                cfStatus,
                cfActiveColor,
                cfEnabled,
                cfGoodColor,
                cfBadColor,
                cfNeutralColor,
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

        this.container.innerHTML = "";
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
            value.style.color = mainCard.cfEnabled && mainCard.cfStatus !== "none" ? mainCard.cfActiveColor : mainCard.textColor;
            value.textContent = mainCard.value;
            mainKpiSection.appendChild(value);

            const label = document.createElement("div");
            label.className = "pbi-consolidated-card__main-label";
            label.style.fontSize = `${mainCard.fontSize}px`;
            label.textContent = mainCard.title;
            mainKpiSection.appendChild(label);

            if (mainCard.cfEnabled && mainCard.cfStatus !== "none") {
                mainKpiSection.appendChild(this.buildCFPill(mainCard));
            }

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
                value.style.color = card.cfEnabled && card.cfStatus !== "none" ? card.cfActiveColor : card.textColor;
                value.textContent = card.value;
                item.appendChild(value);

                const label = document.createElement("div");
                label.className = "pbi-consolidated-card__sub-label";
                label.style.fontSize = `${card.fontSize}px`;
                label.textContent = card.title;
                item.appendChild(label);

                if (card.cfEnabled && card.cfStatus !== "none") {
                    item.appendChild(this.buildCFPill(card));
                } else if (showIcons && card.value !== "—" && card.numericValue !== null) {
                    const raw = card.numericValue;
                    const trend = document.createElement("div");
                    trend.className = "pbi-card__trend";
                    if (raw > 0) {
                        trend.classList.add("pbi-card__trend--up");
                        trend.innerHTML = `<span class="pbi-trend-icon">${ICON_UP}</span><span>Positive</span>`;
                    } else if (raw < 0) {
                        trend.classList.add("pbi-card__trend--down");
                        trend.innerHTML = `<span class="pbi-trend-icon">${ICON_DOWN}</span><span>Negative</span>`;
                    } else {
                        trend.classList.add("pbi-card__trend--flat");
                        trend.innerHTML = `<span class="pbi-trend-icon">${ICON_FLAT}</span><span>Neutral</span>`;
                    }
                    item.appendChild(trend);
                }

                subKpiGrid.appendChild(item);
            });

            this.container.appendChild(subKpiGrid);
        }
    }

    private buildCFPill(card: CardData): HTMLElement {
        const pill = document.createElement("div");
        pill.className = "pbi-card__cf-pill";

        const iconWrap = document.createElement("span");
        iconWrap.className = "pbi-cf-icon";

        const label = document.createElement("span");

        switch (card.cfStatus) {
            case "good":
                pill.style.background = card.cfGoodColor + "20";
                pill.style.border     = `1px solid ${card.cfGoodColor}40`;
                pill.style.color      = card.cfGoodColor;
                iconWrap.innerHTML    = ICON_GOOD;
                label.textContent     = "Good";
                break;
            case "bad":
                pill.style.background = card.cfBadColor + "20";
                pill.style.border     = `1px solid ${card.cfBadColor}40`;
                pill.style.color      = card.cfBadColor;
                iconWrap.innerHTML    = ICON_BAD;
                label.textContent     = "Warning";
                break;
            case "neutral":
                pill.style.background = card.cfNeutralColor + "20";
                pill.style.border     = `1px solid ${card.cfNeutralColor}40`;
                pill.style.color      = card.cfNeutralColor;
                iconWrap.innerHTML    = ICON_WARN;
                label.textContent     = "Watch";
                break;
        }

        pill.appendChild(iconWrap);
        pill.appendChild(label);
        return pill;
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