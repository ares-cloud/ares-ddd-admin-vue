import request from '@/utils/request';
import type {
  UserModel,
  UserCreateRequest,
  UserUpdateRequest,
  RoleModel,
  RoleCreateRequest,
  RoleUpdateRequest,
  PermissionModel,
  PermissionCreateRequest,
  PermissionUpdateRequest,
  TenantModel,
  TenantCreateRequest,
  TenantUpdateRequest,
  PermissionTreeNode,
  SimplePermissionTreeResponse,
} from '@/types/api/authority';
import type { PageRequest, PageResult } from '@/types/api/base';
import { SimplePermissionTreeNode } from '@/types/api/authority';

const BASE_URL = '/sys';

// 用户管理接口
export const userApi = {
  getList: (
    params: PageRequest & Partial<UserModel>
  ): Promise<PageResult<UserModel>> =>
    request(`${BASE_URL}/user`, {
      method: 'GET',
      params,
    }),

  create: (data: UserCreateRequest): Promise<UserModel> =>
    request(`${BASE_URL}/user`, {
      method: 'POST',
      body: data,
    }),

  update: (data: UserUpdateRequest): Promise<UserModel> =>
    request(`${BASE_URL}/user`, {
      method: 'PUT',
      body: data,
    }),

  updateStatus: (id: string, status: number): Promise<void> =>
    request(`${BASE_URL}/user/status`, {
      method: 'PUT',
      body: { id, status },
    }),

  delete: (id: string): Promise<void> =>
    request(`${BASE_URL}/user/${id}`, {
      method: 'DELETE',
    }),

  getById: (id: string): Promise<UserModel> =>
    request(`${BASE_URL}/user/${id}`, {
      method: 'GET',
    }),
};

// 角色管理接口
export const roleApi = {
  getList: (
    params: PageRequest & Partial<RoleModel>
  ): Promise<PageResult<RoleModel>> =>
    request(`${BASE_URL}/role`, {
      method: 'GET',
      params,
    }),

  create: (data: RoleCreateRequest): Promise<RoleModel> =>
    request(`${BASE_URL}/role`, {
      method: 'POST',
      body: data,
    }),

  update: (data: RoleUpdateRequest): Promise<RoleModel> =>
    request(`${BASE_URL}/role`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: number): Promise<void> =>
    request(`${BASE_URL}/role/${id}`, {
      method: 'DELETE',
    }),

  getById: (id: string): Promise<RoleModel> =>
    request(`${BASE_URL}/role/${id}`, {
      method: 'GET',
    }),

  getAllEnabled: (): Promise<RoleModel> =>
    request(`${BASE_URL}/role/enabled`, {
      method: 'GET',
    }),
};

// 权限管理接口
export const permissionsApi = {
  getList: (
    params: PageRequest & Partial<PermissionModel>
  ): Promise<PageResult<PermissionModel>> =>
    request(`${BASE_URL}/permissions`, {
      method: 'GET',
      params,
    }),

  getTree: (): Promise<PermissionTreeNode[]> =>
    request(`${BASE_URL}/permissions/tree`, {
      method: 'GET',
    }),

  getSimpleTree: (): Promise<SimplePermissionTreeResponse> =>
    request(`${BASE_URL}/permissions/simple/tree`, {
      method: 'GET',
    }),

  create: (data: PermissionCreateRequest): Promise<PermissionModel> =>
    request(`${BASE_URL}/permissions`, {
      method: 'POST',
      body: data,
    }),

  update: (data: PermissionUpdateRequest): Promise<PermissionModel> =>
    request(`${BASE_URL}/permissions`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: number): Promise<void> =>
    request(`${BASE_URL}/permissions/${id}`, {
      method: 'DELETE',
    }),

  getById: (id: string): Promise<PermissionModel> =>
    request(`${BASE_URL}/permissions/${id}`, {
      method: 'GET',
    }),
};

// 租户管理接口
export const tenantApi = {
  getList: (
    params: PageRequest & Partial<TenantModel>
  ): Promise<PageResult<TenantModel>> =>
    request(`${BASE_URL}/tenant`, {
      method: 'GET',
      params,
    }),

  create: (data: TenantCreateRequest): Promise<TenantModel> =>
    request(`${BASE_URL}/tenant`, {
      method: 'POST',
      body: data,
    }),

  update: (data: TenantUpdateRequest): Promise<TenantModel> =>
    request(`${BASE_URL}/tenant`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string): Promise<void> =>
    request(`${BASE_URL}/tenant/${id}`, {
      method: 'DELETE',
    }),

  getById: (id: string): Promise<TenantModel> =>
    request(`${BASE_URL}/tenant/${id}`, {
      method: 'GET',
    }),

  getTenantPermissions: (
    tenantId: string
  ): Promise<SimplePermissionTreeNode[]> =>
    request(`${BASE_URL}/tenant/permissions/${tenantId}`, {
      method: 'GET',
    }),

  assignPermissions: (data: {
    tenantId: string;
    permissionIds: number[];
  }): Promise<void> =>
    request(`${BASE_URL}/tenant/permissions`, {
      method: 'PUT',
      body: data,
    }),
};
