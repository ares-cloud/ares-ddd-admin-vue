<template>
  <a-modal
    :visible="visible"
    :title="t('authority.tenant.modal.title.assignPermission')"
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="permission-transfer">
      <div class="transfer-box">
        <div class="box-header">
          <div class="header-content">
            {{ t('authority.tenant.permission.available') }}
            <a-button type="text" size="mini" @click="handleSelectAllAvailable">
              {{ t('common.selectAll') }}
            </a-button>
          </div>
        </div>
        <div class="box-content">
          <a-tree
            v-model:checked-keys="availableCheckedKeys"
            :data="convertToTreeData(availablePermissions)"
            checkable
            :check-strictly="false"
          />
        </div>
      </div>
      <div class="transfer-operation">
        <a-space direction="vertical">
          <a-button type="primary" @click="handleAdd">
            <template #icon>
              <icon-right />
            </template>
          </a-button>
          <a-button type="primary" @click="handleRemove">
            <template #icon>
              <icon-left />
            </template>
          </a-button>
        </a-space>
      </div>
      <div class="transfer-box">
        <div class="box-header">
          <div class="header-content">
            {{ t('authority.tenant.permission.current') }}
            <a-button type="text" size="mini" @click="handleSelectAllCurrent">
              {{ t('common.selectAll') }}
            </a-button>
          </div>
        </div>
        <div class="box-content">
          <a-tree
            v-model:checked-keys="checkedKeys"
            :data="convertToTreeData(currentPermissions)"
            checkable
            :check-strictly="false"
          />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { TreeNodeData } from '@arco-design/web-vue';
  import { Message } from '@arco-design/web-vue';
  import { IconLeft, IconRight } from '@arco-design/web-vue/es/icon';
  import type { SimplePermissionTreeNode } from '@/types/api/authority';
  import { permissionsApi, tenantApi } from '@/api/authority';

  const props = defineProps<{
    visible: boolean;
    tenantId: string;
  }>();

  const emit = defineEmits(['update:visible', 'success']);

  const { t } = useI18n();
  const currentPermissions = ref<SimplePermissionTreeNode[]>([]);
  const availablePermissions = ref<SimplePermissionTreeNode[]>([]);
  const checkedKeys = ref<number[]>([]);
  const availableCheckedKeys = ref<number[]>([]);
  const allPermissions = ref<SimplePermissionTreeNode[]>([]);
  // 获取所有权限ID（包括子权限）
  const getAllPermissionIds = (
    permissions: SimplePermissionTreeNode[]
  ): number[] => {
    const ids: number[] = [];
    const traverse = (perms: SimplePermissionTreeNode[]) => {
      perms.forEach((perm) => {
        ids.push(perm.id);
        if (perm.children?.length) {
          traverse(perm.children);
        }
      });
    };
    traverse(permissions);
    return ids;
  };
  // 过滤权限树
  const filterPermissions = (
    permissions: SimplePermissionTreeNode[],
    excludeIds: Set<number>
  ): SimplePermissionTreeNode[] => {
    return permissions
      .filter((perm) => !excludeIds.has(perm.id))
      .map((perm) => ({
        ...perm,
        children: perm.children?.length
          ? filterPermissions(perm.children, excludeIds)
          : [],
      }));
  };

  // 根据ID列表构建权限树
  const buildPermissionTree = (
    allPerms: SimplePermissionTreeNode[],
    permissionIds: number[]
  ): SimplePermissionTreeNode[] => {
    const idSet = new Set(permissionIds);

    const filterTree = (
      nodes: SimplePermissionTreeNode[]
    ): SimplePermissionTreeNode[] => {
      return nodes
        .filter((node) => idSet.has(node.id))
        .map((node) => ({
          ...node,
          children: node.children?.length ? filterTree(node.children) : [],
        }));
    };

    return filterTree(allPerms);
  };

  // 修改加载权限数据的方法
  const loadData = async () => {
    try {
      // 获取所有权限树
      const allPerms = await permissionsApi.getSimpleTree();
      allPermissions.value = allPerms.tree;

      // 获取租户当前权限ID列表
      const currentPerms = await tenantApi.getTenantPermissions(props.tenantId);

      // 从当前权限树中获取所有ID
      const currentPermIds = getAllPermissionIds(currentPerms);

      // 构建当前已分配的权限树
      currentPermissions.value = buildPermissionTree(
        allPerms.tree,
        currentPermIds
      );

      // 构建可用权限树
      const assignedIds = new Set(currentPermIds);
      availablePermissions.value = filterPermissions(
        allPerms.tree,
        assignedIds
      );
    } catch (err) {
      Message.error(t('authority.tenant.permission.load.failed'));
    }
  };

  // 根据ID查找权限节点
  const findPermissionsByIds = (
    permissions: SimplePermissionTreeNode[],
    ids: number[]
  ): SimplePermissionTreeNode[] => {
    const result: SimplePermissionTreeNode[] = [];
    const idSet = new Set(ids);

    const traverse = (perms: SimplePermissionTreeNode[]) => {
      perms.forEach((perm) => {
        if (idSet.has(perm.id)) {
          result.push({ ...perm });
        }
        if (perm.children?.length) {
          traverse(perm.children);
        }
      });
    };

    traverse(permissions);
    return result;
  };

  // 添加权限
  const handleAdd = () => {
    if (!availableCheckedKeys.value.length) {
      Message.warning(t('authority.tenant.permission.select.required'));
      return;
    }
    // 找到选中的权限及其子权限
    const selectedPerms = findPermissionsByIds(
      availablePermissions.value,
      availableCheckedKeys.value
    );

    // 保持树形结构，不展平子节点
    currentPermissions.value = buildPermissionTree(allPermissions.value, [
      ...getAllPermissionIds(currentPermissions.value),
      ...getAllPermissionIds(selectedPerms),
    ]);

    // 从可用权限中移除选中的权限
    const selectedIds = new Set(getAllPermissionIds(selectedPerms));
    availablePermissions.value = filterPermissions(
      allPermissions.value,
      selectedIds
    );

    // 清空选中状态
    availableCheckedKeys.value = [];
  };

  // 移除权限
  const handleRemove = () => {
    if (!checkedKeys.value.length) {
      Message.warning(t('authority.tenant.permission.select.required'));
      return;
    }
    // 找到选中的权限及其子权限
    const selectedPerms = findPermissionsByIds(
      currentPermissions.value,
      checkedKeys.value
    );

    // 保持树形结构，不展平子节点
    const newAvailablePerms = buildPermissionTree(allPermissions.value, [
      ...getAllPermissionIds(availablePermissions.value),
      ...getAllPermissionIds(selectedPerms),
    ]);
    availablePermissions.value = newAvailablePerms;

    // 从已分配权限中移除选中的权限
    const selectedIds = new Set(getAllPermissionIds(selectedPerms));
    currentPermissions.value = filterPermissions(
      currentPermissions.value,
      selectedIds
    );

    // 清空选中状态
    checkedKeys.value = [];
  };

  // 获取所有父节点ID
  const getParentIds = (
    tree: SimplePermissionTreeNode[],
    childId: number,
    parentMap: Map<number, number> = new Map()
  ): number[] => {
    const parentIds: number[] = [];

    const findParent = (
      nodes: SimplePermissionTreeNode[],
      targetId: number
    ) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const node of nodes) {
        if (node.children?.some((child) => child.id === targetId)) {
          parentIds.push(node.id);
          if (parentMap.has(node.id)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            findParent(tree, parentMap.get(node.id)!);
          }
        }
        if (node.children) {
          findParent(node.children, targetId);
        }
      }
    };

    findParent(tree, childId);
    return parentIds;
  };
  // 全选可用权限
  const handleSelectAllAvailable = () => {
    availableCheckedKeys.value = getAllPermissionIds(
      availablePermissions.value
    );
  };

  // 全选已分配权限
  const handleSelectAllCurrent = () => {
    checkedKeys.value = getAllPermissionIds(currentPermissions.value);
  };
  // 修改保存权限分配的方法
  const handleOk = async () => {
    try {
      // 获取所有已分配权限的ID
      const selectedIds = getAllPermissionIds(currentPermissions.value);

      const parentIds = selectedIds.flatMap((id) =>
        getParentIds(allPermissions.value, Number(id))
      );

      // 合并选中的ID和父节点ID
      const allPermissionIds = [...new Set([...selectedIds, ...parentIds])];

      // 调用分配权限接口
      await tenantApi.assignPermissions({
        tenantId: props.tenantId,
        permissionIds: allPermissionIds.map(Number),
      });

      Message.success(t('authority.tenant.permission.assign.success'));
      emit('success');
      emit('update:visible', false);
    } catch (err) {
      Message.error(t('authority.tenant.permission.assign.failed'));
    }
  };

  const handleCancel = () => {
    emit('update:visible', false);
  };

  // 修改转换方法
  const convertToTreeData = (
    permissions: SimplePermissionTreeNode[]
  ): TreeNodeData[] => {
    return permissions.map((perm) => ({
      key: perm.id,
      title: perm.name,
      children: perm.children ? convertToTreeData(perm.children) : undefined,
    }));
  };

  onMounted(() => {
    if (props.visible) {
      loadData();
    }
  });

  watch(
    () => props.visible,
    (val: boolean) => {
      if (val) {
        loadData();
      }
    }
  );
</script>

<style scoped lang="less">
  .permission-transfer {
    display: flex;
    height: 500px;

    .transfer-box {
      flex: 1;
      border: 1px solid var(--color-neutral-3);
      border-radius: 4px;

      .box-header {
        padding: 10px;
        font-weight: 500;
        border-bottom: 1px solid var(--color-neutral-3);

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }

      .box-content {
        height: calc(100% - 41px);
        padding: 10px;
        overflow: auto;
      }
    }

    .transfer-operation {
      display: flex;
      align-items: center;
      padding: 0 16px;
    }
  }
</style>
