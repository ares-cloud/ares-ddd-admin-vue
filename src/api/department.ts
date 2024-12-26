import request from '@/utils/request';
import type {
  DepartmentDto,
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
  MoveDepartmentCommand,
  DepartmentQueryParams
} from '@/types/api/department';

const BASE_URL = '/sys/dept';

export const departmentApi = {
  // 获取部门列表
  getDepartmentList: (params: DepartmentQueryParams): Promise<DepartmentDto[]> =>
    request(`${BASE_URL}`, {
      method: 'GET',
      params
    }),

  // 获取部门树
  getDepartmentTree: (parentId?: string): Promise<DepartmentDto[]> =>
    request(`${BASE_URL}/tree`, {
      method: 'GET',
      params: { parent_id: parentId }
    }),

  // 获取部门详情
  getDepartment: (id: string): Promise<DepartmentDto> =>
    request(`${BASE_URL}/${id}`, {
      method: 'GET'
    }),

  // 创建部门
  createDepartment: (body: CreateDepartmentCommand): Promise<void> =>
    request(BASE_URL, {
      method: 'POST',
      body
    }),

  // 更新部门
  updateDepartment: (body: UpdateDepartmentCommand): Promise<void> =>
    request(BASE_URL, {
      method: 'PUT',
      body
    }),

  // 删除部门
  deleteDepartment: (id: string): Promise<void> =>
    request(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    }),

  // 移动部门
  moveDepartment: (body: MoveDepartmentCommand): Promise<void> =>
    request(`${BASE_URL}/move`, {
      method: 'POST',
      body
    })
};

export default departmentApi;
