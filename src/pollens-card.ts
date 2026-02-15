import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface PollensCardConfig {
  type: string;
  title?: string;
  location?: string;
}

interface HomeAssistant {
  states: any;
  callService: (domain: string, service: string, data?: any) => Promise<void>;
}

@customElement('pollens-card')
export class PollensCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private config!: PollensCardConfig;

  static getStubConfig(): PollensCardConfig {
    return {
      type: 'custom:pollens-card',
      title: 'Pollen',
      location: 'Bordeaux',
    };
  }

  public setConfig(config: PollensCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  private getPollenData(type: string) {
    const location = (this.config.location || 'Bordeaux').toLowerCase();
    const concentrationToday = this.hass?.states[`sensor.concentration_${type}_${location}`]?.state || '0';
    const concentrationTomorrow = this.hass?.states[`sensor.concentration_${type}_${location}_j_1`]?.state || '0';
    const levelToday = parseInt(this.hass?.states[`sensor.niveau_${type}_${location}`]?.state || '1');
    const levelTomorrow = parseInt(this.hass?.states[`sensor.niveau_${type}_${location}_j_1`]?.state || '1');

    return {
      concentrationToday: parseFloat(concentrationToday).toFixed(1),
      concentrationTomorrow: parseFloat(concentrationTomorrow).toFixed(1),
      levelToday,
      levelTomorrow,
    };
  }

  private getLevelColor(level: number): string {
    if (level <= 1) return '#34a853';
    if (level === 2) return '#fbbc04';
    if (level === 3) return '#ff9800';
    return '#f44336';
  }

  private getLevelLabel(level: number): string {
    if (level <= 1) return 'Faible';
    if (level === 2) return 'Modéré';
    if (level === 3) return 'Élevé';
    return 'Très élevé';
  }

  private renderPollenItem(
    icon: string,
    name: string,
    data: { concentrationToday: string; concentrationTomorrow: string; levelToday: number; levelTomorrow: number }
  ) {
    const colorToday = this.getLevelColor(data.levelToday);
    const colorTomorrow = this.getLevelColor(data.levelTomorrow);
    const percentToday = (data.levelToday / 4) * 100;
    const percentTomorrow = (data.levelTomorrow / 4) * 100;
    const circumference = 2 * Math.PI * 28;
    const offsetToday = circumference - (percentToday / 100) * circumference;
    const offsetTomorrow = circumference - (percentTomorrow / 100) * circumference;

    return html`
      <div class="pollen-item">
        <div class="pollen-left">
          <ha-icon icon="${icon}"></ha-icon>
          <span class="pollen-name">${name}</span>
        </div>

        <div class="pollen-right">
          <div class="pollen-day">
            <svg class="pollen-ring" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--divider-color, #e0e0e0)" stroke-width="5" opacity="0.2"/>
              <circle cx="32" cy="32" r="28" fill="none" stroke="${colorToday}" stroke-width="5"
                stroke-dasharray="${circumference}" stroke-dashoffset="${offsetToday}"
                stroke-linecap="round" transform="rotate(-90 32 32)" class="pollen-progress"/>
            </svg>
            <div class="day-info">
              <div class="day-value">${data.concentrationToday}</div>
            </div>
          </div>

          <ha-icon icon="mdi:chevron-right" class="arrow-icon"></ha-icon>

          <div class="pollen-day tomorrow">
            <svg class="pollen-ring" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--divider-color, #e0e0e0)" stroke-width="5" opacity="0.2"/>
              <circle cx="32" cy="32" r="28" fill="none" stroke="${colorTomorrow}" stroke-width="5"
                stroke-dasharray="${circumference}" stroke-dashoffset="${offsetTomorrow}"
                stroke-linecap="round" transform="rotate(-90 32 32)" class="pollen-progress"/>
            </svg>
            <div class="day-info">
              <div class="day-value">${data.concentrationTomorrow}</div>
            </div>
          </div>

          <span class="pollen-level" style="background-color: ${colorToday}20; color: ${colorToday}">
            ${this.getLevelLabel(data.levelToday)}
          </span>
        </div>
      </div>
    `;
  }

  protected render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const title = this.config.title || 'Pollen';
    const location = this.config.location || 'Bordeaux';

    const gramine = this.getPollenData('gramine');
    const aulne = this.getPollenData('aulne');
    const bouleau = this.getPollenData('bouleau');
    const olivier = this.getPollenData('olivier');
    const ambroisie = this.getPollenData('ambroisie');
    const armoise = this.getPollenData('armoise');

    return html`
      <div class="pollens-card">
        <div class="dashboard-header">
          <ha-icon icon="mdi:flower-pollen" class="header-icon"></ha-icon>
          <div class="header-text">
            <h1 class="title">${title}</h1>
            <div class="location">${location}</div>
          </div>
        </div>

        <div class="pollen-grid">
          ${this.renderPollenItem('mdi:grass', 'Graminées', gramine)}
          ${this.renderPollenItem('mdi:tree', 'Aulne', aulne)}
          ${this.renderPollenItem('mdi:tree-outline', 'Bouleau', bouleau)}
          ${this.renderPollenItem('mdi:leaf', 'Olivier', olivier)}
          ${this.renderPollenItem('mdi:flower', 'Ambroisie', ambroisie)}
          ${this.renderPollenItem('mdi:sprout', 'Armoise', armoise)}
        </div>

        <div class="legend">
          <div class="legend-item">
            <span class="legend-dot" style="background: #34a853"></span>
            <span>Faible (1)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #fbbc04"></span>
            <span>Modéré (2)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #ff9800"></span>
            <span>Élevé (3)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #f44336"></span>
            <span>Très élevé (4)</span>
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .pollens-card {
        background: var(--ha-card-background, var(--card-background-color, white));
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 20px;
        color: var(--primary-text-color);
        font-family: var(--ha-card-font-family, 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
      }

      .dashboard-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--primary-color);
      }

      .header-icon {
        --mdi-icon-size: 28px;
        color: var(--primary-color);
      }

      .header-text {
        flex: 1;
      }

      .title {
        font-size: 22px;
        font-weight: 500;
        margin: 0;
        letter-spacing: -0.5px;
        color: var(--primary-text-color);
      }

      .location {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .pollen-grid {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
      }

      .pollen-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--secondary-background-color, #f5f5f5);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        padding: 10px 14px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: all 0.2s;
      }

      .pollen-item:hover {
        background: var(--primary-background-color, #fafafa);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transform: translateX(2px);
      }

      .pollen-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }

      .pollen-left ha-icon {
        --mdi-icon-size: 22px;
        color: var(--secondary-text-color);
      }

      .pollen-name {
        font-size: 15px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .pollen-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .pollen-level {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 10px;
        white-space: nowrap;
      }

      .pollen-day {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pollen-day.tomorrow {
        opacity: 0.5;
      }

      .pollen-ring {
        width: 50px;
        height: 50px;
      }

      .pollen-progress {
        transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .day-info {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .day-value {
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        color: var(--primary-text-color);
      }

      .arrow-icon {
        --mdi-icon-size: 14px;
        color: var(--secondary-text-color);
        opacity: 0.4;
      }

      .legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        padding-top: 10px;
        margin-top: 6px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 10px;
        color: var(--secondary-text-color);
        padding: 2px 6px;
        border-radius: 6px;
        background: var(--secondary-background-color, #f5f5f5);
      }

      .legend-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      @media (max-width: 600px) {
        .pollens-card {
          padding: 16px;
        }

        .title {
          font-size: 20px;
        }

        .pollen-level {
          display: none;
        }

        .pollen-ring {
          width: 45px;
          height: 45px;
        }

        .day-value {
          font-size: 10px;
        }
      }
    `;
  }

  getCardSize(): number {
    return 4;
  }
}

// Register the card
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'pollens-card',
  name: 'Pollens Card',
  description: 'Carte moderne de visualisation des niveaux de pollen pour Home Assistant',
  preview: true,
});

console.info(
  `%c POLLENS-CARD %c v1.3.0 `,
  'color: white; background: #667eea; font-weight: 700;',
  'color: #667eea; background: white; font-weight: 700;'
);
