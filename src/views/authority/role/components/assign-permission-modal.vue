<template>
  <a-modal
    :visible="visible"
    :title="t('authority.role.modal.title.assignPermission')"
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="permission-transfer">
      <div class="transfer-box">
        <div class="box-header">
          {{ t('authority.role.permission.available') }}
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
          {{ t('authority.role.permission.current') }}
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
  import type {
    RoleModel,
    SimplePermissionTreeNode,
  } from '@/types/api/authority';
  import { permissionsApi, roleApi } from '@/api/authority';

  const props = defineProps<{
    visible: boolean;
    roleId: number;
  }>();

  const emit = defineEmits(['update:visible', 'success']);

  const { t } = useI18n();
  const currentPermissions = ref<SimplePermissionTreeNode[]>([]);
  const availablePermissions = ref<SimplePermissionTreeNode[]>([]);
  const checkedKeys = ref<number[]>([]);
  const availableCheckedKeys = ref<number[]>([]);
  const allPermissions = ref<SimplePermissionTreeNode[]>([]);
  const currentRole = ref<RoleModel>();

  // 获取所有权���ID（包括子权限）
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
    return permissions.map((perm) => ({
      ...perm,
      children: perm.children?.length
        ? perm.children
            .filter((child) => !excludeIds.has(child.id))
            .map((child) => ({
              ...child,
              children: child.children?.length
                ? child.children.filter(
                    (grandChild) => !excludeIds.has(grandChild.id)
                  )
                : [],
            }))
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
        .map((node) => ({
          ...node,
          children: node.children?.length
            ? node.children
                .filter((child) => idSet.has(child.id))
                .map((child) => ({
                  ...child,
                  children: child.children?.length
                    ? child.children.filter((grandChild) =>
                        idSet.has(grandChild.id)
                      )
                    : [],
                }))
            : [],
        }))
        .filter(
          (node) =>
            idSet.has(node.id) || (node.children && node.children.length > 0)
        );
    };

    return filterTree(allPerms);
  };

  // 加载权限数据
  const loadData = async () => {
    try {
      // 获取角色最新详情
      const roleDetail = await roleApi.getById(String(props.roleId));
      currentRole.value = roleDetail;

      // 获取所有权限树
      const allPerms = await permissionsApi.getSimpleTree();
      allPermissions.value = allPerms.tree;

      // 使用角色详情中的权限ID
      const currentPermIds = roleDetail.permIds || [];

      // 先构建可用权限树（所有权限）
      availablePermissions.value = JSON.parse(JSON.stringify(allPerms.tree));

      // 构建当前已分配的权限树
      currentPermissions.value = buildPermissionTree(
        allPerms.tree,
        currentPermIds
      );

      // 从可用权限中移除已分配的权限
      const assignedIds = new Set(currentPermIds);
      availablePermissions.value = filterPermissions(
        availablePermissions.value,
        assignedIds
      ).filter(
        (node) => node.children?.length > 0 || !assignedIds.has(node.id)
      );
    } catch (err) {
      Message.error(t('authority.role.permission.load.failed'));
    }
  };

  // 处理添加权限
  const handleAdd = () => {
    if (!availableCheckedKeys.value.length) {
      Message.warning(t('authority.role.permission.select.required'));
      return;
    }

    const selectedPerms = buildPermissionTree(
      availablePermissions.value,
      availableCheckedKeys.value
    );

    currentPermissions.value = buildPermissionTree(allPermissions.value, [
      ...getAllPermissionIds(currentPermissions.value),
      ...getAllPermissionIds(selectedPerms),
    ]);

    const selectedIds = new Set(getAllPermissionIds(selectedPerms));
    availablePermissions.value = filterPermissions(
      allPermissions.value,
      selectedIds
    );

    availableCheckedKeys.value = [];
  };

  // 处理移除权限
  const handleRemove = () => {
    if (!checkedKeys.value.length) {
      Message.warning(t('authority.role.permission.select.required'));
      return;
    }

    const selectedPerms = buildPermissionTree(
      currentPermissions.value,
      checkedKeys.value
    );

    availablePermissions.value = buildPermissionTree(allPermissions.value, [
      ...getAllPermissionIds(availablePermissions.value),
      ...getAllPermissionIds(selectedPerms),
    ]);

    const selectedIds = new Set(getAllPermissionIds(selectedPerms));
    currentPermissions.value = filterPermissions(
      currentPermissions.value,
      selectedIds
    );

    checkedKeys.value = [];
  };

  // 保存权限分配
  const handleOk = async () => {
    try {
      const permissionIds = getAllPermissionIds(currentPermissions.value);
      // 直接更新角色的权限
      await roleApi.update({
        id: props.roleId,
        ...currentRole.value,
        permIds: permissionIds,
      });

      Message.success(t('authority.role.permission.assign.success'));
      emit('success');
      emit('update:visible', false);
    } catch (err) {
      Message.error(t('authority.role.permission.assign.failed'));
    }
  };

  const handleCancel = () => {
    emit('update:visible', false);
  };

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
    (val) => {
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
