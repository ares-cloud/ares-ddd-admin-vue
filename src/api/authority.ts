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
} from '@/types/api/authority';
import type { PageRequest, PageResult } from '@/types/api/base';

const BASE_URL = '/sys';

// 用户管理接口
export const userApi = {
  getList: (params: PageRequest & Partial<UserModel>) =>
    request<PageResult<UserModel>>(`${BASE_URL}/user`, {
      method: 'GET',
      params,
    }),

  create: (data: UserCreateRequest) =>
    request<UserModel>(`${BASE_URL}/user`, { method: 'POST', data }),

  update: (data: UserUpdateRequest) =>
    request<UserModel>(`${BASE_URL}/user`, { method: 'PUT', data }),

  updateStatus: (id: string, status: number) =>
    request<void>(`${BASE_URL}/user/${id}/status`, {
      method: 'PUT',
      data: { status },
    }),

  delete: (id: string) =>
    request<void>(`${BASE_URL}/user/${id}`, { method: 'DELETE' }),

  getById: (id: string) =>
    request<UserModel>(`${BASE_URL}/user/${id}`, { method: 'GET' }),
};

// 角色管理接口
export const roleApi = {
  getList: (params: PageRequest & Partial<RoleModel>) =>
    request<PageResult<RoleModel>>(`${BASE_URL}/role`, {
      method: 'GET',
      params,
    }),

  create: (data: RoleCreateRequest) =>
    request<RoleModel>(`${BASE_URL}/role`, { method: 'POST', data }),

  update: (data: RoleUpdateRequest) =>
    request<RoleModel>(`${BASE_URL}/role`, { method: 'PUT', data }),

  delete: (id: string) =>
    request<void>(`${BASE_URL}/role/${id}`, { method: 'DELETE' }),

  getById: (id: string) =>
    request<RoleModel>(`${BASE_URL}/role/${id}`, { method: 'GET' }),
};

// 权限管理接口
export const permissionsApi = {
  getList: (params: PageRequest & Partial<PermissionModel>) =>
    request<PageResult<PermissionModel>>(`${BASE_URL}/permissions`, {
      method: 'GET',
      params,
    }),

  getTree: () =>
    request<PermissionTreeNode[]>(`${BASE_URL}/permissions/tree`, {
      method: 'GET',
    }),

  create: (data: PermissionCreateRequest) =>
    request<PermissionModel>(`${BASE_URL}/permissions`, {
      method: 'POST',
      data,
    }),

  update: (data: PermissionUpdateRequest) =>
    request<PermissionModel>(`${BASE_URL}/permissions`, {
      method: 'PUT',
      data,
    }),

  delete: (id: string) =>
    request<void>(`${BASE_URL}/permissions/${id}`, { method: 'DELETE' }),

  getById: (id: string) =>
    request<PermissionModel>(`${BASE_URL}/permissions/${id}`, {
      method: 'GET',
    }),
};

// 租户管理接口
export const tenantApi = {
  getList: (params: PageRequest & Partial<TenantModel>) =>
    request<PageResult<TenantModel>>(`${BASE_URL}/tenant`, {
      method: 'GET',
      params,
    }),

  create: (data: TenantCreateRequest) =>
    request<TenantModel>(`${BASE_URL}/tenant`, { method: 'POST', data }),

  update: (data: TenantUpdateRequest) =>
    request<TenantModel>(`${BASE_URL}/tenant`, {
      method: 'PUT',
      data,
    }),

  delete: (id: string) =>
    request<void>(`${BASE_URL}/tenant/${id}`, { method: 'DELETE' }),

  getById: (id: string) =>
    request<TenantModel>(`${BASE_URL}/tenant/${id}`, { method: 'GET' }),

  // 获取租户权限
  getTenantPermissions: (tenantId: string) =>
    request<PermissionTreeNode[]>(
      `${BASE_URL}/tenant/${tenantId}/permissions`,
      {
        method: 'GET',
      }
    ),

  // 分配权限给租户
  assignPermissions: (tenantId: string, permissionIds: string[]) =>
    request<void>(`${BASE_URL}/tenant/${tenantId}/permissions`, {
      method: 'PUT',
      data: { permissionIds },
    }),
};
