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
  password: string;
  createdAt?: number;
  updatedAt?: number;
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
  createdAt?: number;
  updatedAt?: number;
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
  createdAt?: number;
  updatedAt?: number;
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
export interface TenantAdminUser {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

export interface TenantModel {
  id: string;
  name: string;
  code: string;
  status: number;
  expireTime: number;
  description?: string;
  isDefault: number;
  createdAt?: number;
  updatedAt?: number;
  adminUser: TenantAdminUser;
  adminUsername: string;
}

export interface TenantCreateRequest {
  name: string;
  code: string;
  expireTime: number;
  description?: string;
  isDefault?: number;
  adminUser: TenantAdminUser;
}

export interface TenantUpdateRequest {
  id: string;
  name: string;
  code: string;
  expireTime: number;
  description?: string;
  isDefault?: number;
  status: number;
}

// 权限树节点模型
export interface PermissionTreeNode {
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
  children?: PermissionTreeNode[];
}
