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

  getById: (id: number): Promise<RoleModel> =>
    request(`${BASE_URL}/role/${id}`, {
      method: 'GET',
    }),

  getAllEnabled: (): Promise<RoleModel[]> =>
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
  getAllList: (): Promise<SimplePermissionTreeNode[]> =>
    request(`${BASE_URL}/permissions/enabled`, {
      method: 'GET',
    }),
  buildFilteredTree: (
    allNodes: SimplePermissionTreeNode[],
    selectedIds: number[]
  ): SimplePermissionTreeNode[] => {
    if (selectedIds.length === 0) {
      return [];
    }
    // 1. 先将扁平数组转换为树形结构
    const nodeMap = new Map<number, SimplePermissionTreeNode>();
    const roots: SimplePermissionTreeNode[] = [];

    // 2. 首先创建所有节点的映射
    allNodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // 3. 构建树形结构
    allNodes.forEach((node) => {
      const currentNode = nodeMap.get(node.id)!;
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(currentNode);
      } else {
        roots.push(currentNode);
      }
    });

    // 4. 获取所有选中节点的父节点ID
    const getAllParentIds = (nodeId: number): number[] => {
      const parentIds: number[] = [];
      let currentNode = nodeMap.get(nodeId);
      while (currentNode?.parentId) {
        parentIds.push(currentNode.parentId);
        currentNode = nodeMap.get(currentNode.parentId);
      }
      return parentIds;
    };

    // 5. 获取所有需要显示的节点ID（包括父节点）
    const allRequiredIds = new Set([
      ...selectedIds,
      ...selectedIds.flatMap((id) => getAllParentIds(id)),
    ]);

    // 6. 过滤树，只保留需要显示的节点
    const filterTree = (
      nodes: SimplePermissionTreeNode[]
    ): SimplePermissionTreeNode[] => {
      return nodes
        .filter((node) => allRequiredIds.has(node.id))
        .map((node) => ({
          ...node,
          children: node.children?.length ? filterTree(node.children) : [],
        }))
        .filter(
          (node) => node.children.length > 0 || allRequiredIds.has(node.id)
        );
    };

    // 7. 返回过滤后的树
    return filterTree(roots);
  },

  getAllParentIds: (
    nodes: SimplePermissionTreeNode[],
    targetIds: number[]
  ): number[] => {
    // 创建节点映射
    const nodeMap = new Map<number, SimplePermissionTreeNode>();
    const parentIds = new Set<number>();

    // 构建节点映射
    const buildNodeMap = (items: SimplePermissionTreeNode[]) => {
      items.forEach((node) => {
        nodeMap.set(node.id, node);
        if (node.children?.length) {
          buildNodeMap(node.children);
        }
      });
    };

    // 查找父节点
    const findParents = (nodeId: number) => {
      const node = nodeMap.get(nodeId);
      if (node?.parentId) {
        parentIds.add(node.parentId);
        findParents(node.parentId);
      }
    };

    // 1. 构建节点映射
    buildNodeMap(nodes);

    // 2. 查找所有目标节点的父节点
    targetIds.forEach((id) => findParents(id));

    return Array.from(parentIds);
  },
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
