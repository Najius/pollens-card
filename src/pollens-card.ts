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
    const labelToday = this.getLevelLabel(data.levelToday);
    const percentToday = (data.levelToday / 4) * 100;
    const percentTomorrow = (data.levelTomorrow / 4) * 100;
    const circumference = 2 * Math.PI * 40;
    const offsetToday = circumference - (percentToday / 100) * circumference;
    const offsetTomorrow = circumference - (percentTomorrow / 100) * circumference;

    return html`
      <div class="pollen-item">
        <div class="pollen-header">
          <ha-icon icon="${icon}"></ha-icon>
          <span class="pollen-name">${name}</span>
        </div>

        <div class="pollen-comparison">
          <!-- Today -->
          <div class="pollen-day">
            <div class="day-label">Aujourd'hui</div>
            <svg class="pollen-ring" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                stroke-width="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="${colorToday}"
                stroke-width="8"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offsetToday}"
                stroke-linecap="round"
                transform="rotate(-90 50 50)"
                class="pollen-progress"
              />
              <text x="50" y="50" text-anchor="middle" dy=".3em" class="level-text">${data.levelToday}/4</text>
            </svg>
            <div class="concentration">${data.concentrationToday} μg/m³</div>
            <div class="level-label" style="color: ${colorToday}">${labelToday}</div>
          </div>

          <!-- Tomorrow -->
          <div class="pollen-day">
            <div class="day-label">Demain</div>
            <svg class="pollen-ring" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                stroke-width="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="${colorTomorrow}"
                stroke-width="8"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offsetTomorrow}"
                stroke-linecap="round"
                transform="rotate(-90 50 50)"
                class="pollen-progress"
              />
              <text x="50" y="50" text-anchor="middle" dy=".3em" class="level-text">${data.levelTomorrow}/4</text>
            </svg>
            <div class="concentration">${data.concentrationTomorrow} μg/m³</div>
            <div class="level-label" style="color: ${colorTomorrow}">${this.getLevelLabel(data.levelTomorrow)}</div>
          </div>
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 20px;
        color: white;
        font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .dashboard-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .header-icon {
        --mdi-icon-size: 32px;
        color: rgba(255, 255, 255, 0.9);
      }

      .header-text {
        flex: 1;
      }

      .title {
        font-size: 24px;
        font-weight: 500;
        margin: 0;
        letter-spacing: -0.5px;
      }

      .location {
        font-size: 13px;
        opacity: 0.8;
        margin-top: 2px;
      }

      .pollen-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 10px;
        margin-bottom: 16px;
      }

      .pollen-item {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 12px;
        backdrop-filter: blur(20px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .pollen-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .pollen-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }

      .pollen-header ha-icon {
        --mdi-icon-size: 20px;
        color: rgba(255, 255, 255, 0.9);
      }

      .pollen-name {
        font-size: 14px;
        font-weight: 500;
      }

      .pollen-comparison {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .pollen-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .day-label {
        font-size: 10px;
        font-weight: 500;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .pollen-ring {
        width: 60px;
        height: 60px;
      }

      .pollen-progress {
        transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .level-text {
        font-size: 14px;
        font-weight: 600;
        fill: white;
      }

      .concentration {
        font-size: 10px;
        font-weight: 500;
        opacity: 0.9;
      }

      .level-label {
        font-size: 9px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.2);
      }

      .legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        opacity: 0.9;
      }

      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: 0 0 6px currentColor;
      }

      @media (max-width: 600px) {
        .pollens-card {
          padding: 16px;
        }

        .pollen-grid {
          grid-template-columns: 1fr;
        }

        .title {
          font-size: 20px;
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
  `%c POLLENS-CARD %c v1.0.2 `,
  'color: white; background: #667eea; font-weight: 700;',
  'color: #667eea; background: white; font-weight: 700;'
);
