// 用户相关类型
export interface UserModel {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  status: number;
  roleIds: number[];
  invitationCode: string;
  createTime: string;
}

export interface UserCreateRequest {
  username: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  roleIds: number[];
  invitationCode: string;
}

export interface UserUpdateRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleIds: number[];
  status: number;
}

// 角色相关类型
export interface RoleModel {
  id: string;
  name: string;
  code: string;
  description: string;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface RoleCreateRequest {
  name: string;
  code: string;
  description?: string;
}

export interface RoleUpdateRequest extends Partial<RoleCreateRequest> {
  id: string;
  status?: number;
}

// 权限相关类型
export interface ResourceModel {
  method: string | undefined;
  path: string | undefined;
}

export interface PermissionModel {
  id: string;
  name: string;
  code: string;
  type: number;
  icon?: string;
  path?: string;
  parentId?: number;
  sequence?: number;
  description?: string;
  localize?: string;
  properties?: string;
  resources: ResourceModel[];
  status: number;
  createTime?: number;
  updateTime?: number;
}

export interface PermissionCreateRequest {
  name: string;
  code: string;
  type: number;
  icon?: string;
  path?: string;
  parentId?: number;
  sequence?: number;
  description?: string;
  localize?: string;
  properties?: string;
  resources?: ResourceModel[];
}

export interface PermissionUpdateRequest {
  id: string;
  name: string;
  code: string;
  type: number;
  icon?: string;
  path?: string;
  parentId?: number;
  sequence?: number;
  description?: string;
  localize?: string;
  properties?: string;
  resources?: ResourceModel[];
  status: number;
}

// 租户相关类型
export interface TenantModel {
  id: string;
  tenantName: string;
  tenantCode: string;
  status: number;
  expireTime: string;
  createTime: string;
  updateTime: string;
  is_default: number;
  description: string;
}

export interface TenantCreateRequest {
  tenantName: string;
  tenantCode: string;
  expireTime: string;
}

export interface TenantUpdateRequest extends Partial<TenantCreateRequest> {
  id: string;
  status?: number;
}
