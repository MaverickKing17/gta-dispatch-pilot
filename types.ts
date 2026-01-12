
export interface VoiceConfig {
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}

export interface TranscriptionItem {
  speaker: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export enum DispatchStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}

export interface WebhookPayload {
  name: string;
  phone: string;
  age: string;
  summary: string;
  temp: string;
  agent: string;
}
