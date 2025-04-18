export interface IUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_access: number;
  created_at?: Date;
}

export interface ITemplate {
  template_id: number;
  template_name: string;
  template_desc?: string;
  template_type: string;
  pdf_path?: string;
  created_at?: Date;
}

export interface IUserTemplate {
  utemplate_id: number;
  user_id: number;
  template_id: number;
  template_config: Record<string, any>;
  created_at?: Date;
} 