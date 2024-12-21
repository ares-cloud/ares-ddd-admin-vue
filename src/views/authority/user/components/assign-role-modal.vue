<template>
  <a-modal
    :visible="visible"
    :title="t('authority.user.modal.title.assignRole')"
    :width="600"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="role-transfer">
      <div class="transfer-box">
        <div class="box-header">
          {{ t('authority.user.role.available') }}
        </div>
        <div class="box-content">
          <a-checkbox-group
            v-model="availableCheckedKeys"
            :options="
              availableRoles.map((role) => ({
                label: role.name,
                value: role.id
              }))
            "
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
          {{ t('authority.user.role.current') }}
        </div>
        <div class="box-content">
          <a-checkbox-group
            v-model="checkedKeys"
            :options="
              currentRoles.map((role) => ({
                label: role.name,
                value: role.id
              }))
            "
          />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import { IconLeft, IconRight } from '@arco-design/web-vue/es/icon';
import type { RoleModel, UserModel } from '@/types/api/authority';
import { roleApi, userApi } from '@/api/authority';

const props = defineProps<{
  visible: boolean;
  userId: string;
}>();

const emit = defineEmits(['update:visible', 'success']);

const { t } = useI18n();
const currentRoles = ref<RoleModel[]>([]);
const availableRoles = ref<RoleModel[]>([]);
const checkedKeys = ref<number[]>([]);
const availableCheckedKeys = ref<number[]>([]);
const allRoles = ref<RoleModel[]>([]);
const currentUser = ref<UserModel>();

// 加载数据
const loadData = async () => {
  try {
    // 获取用户最新详情
    const userDetail = await userApi.getById(props.userId);
    currentUser.value = userDetail;

    // 获��所有可用角色
    const allEnabledRoles = await roleApi.getAllEnabled();
    allRoles.value = allEnabledRoles;

    // 构建当前已分配的角色列表
    const currentRoleIds = new Set(userDetail.roleIds || []);
    currentRoles.value = allEnabledRoles.filter((role) => currentRoleIds.has(role.id));

    // 构建可用角色列表
    availableRoles.value = allEnabledRoles.filter((role) => !currentRoleIds.has(role.id));
  } catch (err) {
    Message.error(t('authority.user.role.load.failed'));
  }
};

// 处理添加角色
const handleAdd = () => {
  if (!availableCheckedKeys.value.length) {
    Message.warning(t('authority.user.role.select.required'));
    return;
  }

  const selectedRoles = availableRoles.value.filter((role) =>
    availableCheckedKeys.value.includes(role.id)
  );

  currentRoles.value = [...currentRoles.value, ...selectedRoles];
  availableRoles.value = availableRoles.value.filter(
    (role) => !availableCheckedKeys.value.includes(role.id)
  );

  availableCheckedKeys.value = [];
};

// 处理移除角色
const handleRemove = () => {
  if (!checkedKeys.value.length) {
    Message.warning(t('authority.user.role.select.required'));
    return;
  }

  const selectedRoles = currentRoles.value.filter((role) => checkedKeys.value.includes(role.id));

  availableRoles.value = [...availableRoles.value, ...selectedRoles];
  currentRoles.value = currentRoles.value.filter((role) => !checkedKeys.value.includes(role.id));

  checkedKeys.value = [];
};

// 保存角色分配
const handleOk = async () => {
  try {
    const roleIds = currentRoles.value.map((role) => role.id);
    await userApi.update({
      id: props.userId,
      ...currentUser.value,
      roleIds
    });

    Message.success(t('authority.user.role.assign.success'));
    emit('success');
    emit('update:visible', false);
  } catch (err) {
    Message.error(t('authority.user.role.assign.failed'));
  }
};

const handleCancel = () => {
  emit('update:visible', false);
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
.role-transfer {
  display: flex;
  height: 400px;

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

      :deep(.arco-checkbox-group) {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }

  .transfer-operation {
    display: flex;
    align-items: center;
    padding: 0 16px;
  }
}
</style>
