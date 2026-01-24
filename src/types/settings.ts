// Re-export types from the GraphQL service for consistency
export type {
  Setting,
  UpdateSettingInput,
  SettingType
} from '../services/settings.gql';

export { SETTING_CATEGORIES } from '../services/settings.gql';

// Additional types for the UI components
export interface SettingFormData {
  [key: string]: any;
}

export interface SettingValidationError {
  field: string;
  message: string;
}

export interface SettingCategoryInfo {
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface SettingsPageState {
  loading: boolean;
  error: string | null;
  settings: Setting[];
  selectedCategory: SettingType | null;
  searchQuery: string;
  showOnlyRequired: boolean;
  showOnlyPublic: boolean;
}

export interface SettingInputProps {
  setting: Setting;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export interface SettingFormProps {
  settings: Setting[];
  onSave: (updates: UpdateSettingInput[]) => Promise<void>;
  onReset: (key: string) => Promise<void>;
  loading?: boolean;
  category?: SettingType;
}

// Validation schema types
export interface SettingValidationRule {
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  options?: string[];
  message?: string;
}

export interface SettingConfig {
  key: string;
  type: SettingType;
  label: string;
  description?: string;
  defaultValue: any;
  isPublic: boolean;
  isRequired: boolean;
  validation?: SettingValidationRule;
}
