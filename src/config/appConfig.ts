/**
 * ==============================================================================
 * CV / RESUME MAKER CONFIGURATION
 * ==============================================================================
 * All pricing, limits, features, and payment collection account details are
 * defined here. Secrets (API keys, passwords, private tokens) MUST NEVER be stored
 * here — they belong strictly in the `.env` file!
 */

import configData from '../../config/app.config.json';

export interface AppConfig {
  credits: {
    FREE_SIGNUP_CREDITS: number;
    COST_UPLOAD: number;
    COST_DETECT: number;
    COST_GENERATE_PREBUILT: number;
    COST_EDIT: number;
    COST_GENERATE_CUSTOM: number;
  };
  payments: {
    MIN_PURCHASE_BDT: number;
    CREDITS_PER_BDT: number;
    bkashNumber: string;
    bkashType: string;
    nagadNumber: string;
    nagadType: string;
    rocketNumber: string;
    rocketType: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankBranch: string;
    bankRoutingNumber: string;
  };
  limits: {
    MAX_PAST_CV_MB: number;
    MAX_PHOTO_MB: number;
    MAX_GENERATED_CV_MB: number;
    CHAT_MAX_IMAGES: number;
    CHAT_MAX_IMAGES_SMALL: number;
    CHAT_IMAGE_MAX_MB: number;
    CHAT_MAX_PROMPT_WORDS: number;
  };
  features: {
    REQUIRE_PHONE_OTP: boolean;
    CANVA_ENABLED: boolean;
  };
}

export const APP_CONFIG: AppConfig = configData as AppConfig;

export default APP_CONFIG;
