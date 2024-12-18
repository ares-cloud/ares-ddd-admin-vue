<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.role']" />
    <a-card class="general-card" :title="t('menu.authority.role')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item
                  field="name"
                  :label="t('authority.role.searchTable.form.name')"
                >
                  <a-input
                    v-model="formModel.name"
                    :placeholder="
                      t('authority.role.searchTable.form.name.placeholder')
                    "
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="code"
                  :label="t('authority.role.searchTable.form.code')"
                >
                  <a-input
                    v-model="formModel.code"
                    :placeholder="
                      t('authority.role.searchTable.form.code.placeholder')
                    "
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider style="height: 84px" direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
          <a-space direction="vertical" :size="18">
            <a-button v-permission="['010402']" type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ t('common.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('common.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button
              v-permission="['010401']"
              type="primary"
              @click="openCreateModal"
            >
              <template #icon>
                <icon-plus />
              </template>
              {{ t('authority.role.searchTable.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="renderData"
        @page-change="onPageChange"
      />
    </a-card>

    <!-- 创建/编辑角色的弹窗 -->
    <edit-modal
      v-model:visible="modalVisible"
      :data="modalForm"
      @success="handleSuccess"
    />

    <!-- 权限分配弹窗 -->
    <assign-permission-modal
      v-model:visible="assignPermissionVisible"
      :role-id="currentRoleId"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
  import { getCurrentInstance, h, reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import {
    IconPlus,
    IconRefresh,
    IconSearch,
  } from '@arco-design/web-vue/es/icon';
  import { roleApi } from '@/api/authority';
  import type { RoleModel } from '@/types/api/authority';
  import { formatTimestamp } from '@/filters/date';
  import Permission from '@/components/check-permission/index.vue';
  import EditModal from './components/edit-modal.vue';
  import AssignPermissionModal from './components/assign-permission-modal.vue';

  const instance = getCurrentInstance();
  const proxy = instance?.proxy;
  const { t } = useI18n();

  const formModel = ref({
    name: '',
    code: '',
  });

  const loading = ref(false);
  const renderData = ref<RoleModel[]>([]);
  const modalVisible = ref(false);
  const defaultFormData = {
    id: 0,
    name: '',
    code: '',
    description: '',
    status: 1,
    localize: '',
    permIds: [] as number[],
  };

  const modalForm = reactive<RoleModel>({ ...defaultFormData });

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
  });

  const search = async () => {
    loading.value = true;
    try {
      const data = await roleApi.getList({
        current: pagination.current,
        size: pagination.pageSize,
        ...formModel.value,
      });
      renderData.value = data.list;
      pagination.total = data.total;
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const openCreateModal = () => {
    Object.assign(modalForm, defaultFormData);
    modalVisible.value = true;
  };

  const openEditModal = (record: RoleModel) => {
    modalForm.id = record.id;
    modalForm.name = record.name;
    modalForm.code = record.code;
    modalForm.description = record.description;
    modalForm.status = record.status;
    modalForm.localize = record.localize;
    modalForm.permIds = record.permIds;
    modalVisible.value = true;
  };

  const handleDelete = async (record: RoleModel) => {
    Modal.confirm({
      title: t('authority.role.delete.confirm.title'),
      content: t('authority.role.delete.confirm.content', {
        name: record.name,
      }),
      onOk: async () => {
        try {
          await roleApi.delete(record.id);
          Message.success(t('common.success.operation'));
          search();
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const assignPermissionVisible = ref(false);
  const currentRoleId = ref<number>(0);

  // 打开权限分配弹窗
  const openAssignPermissionModal = (record: RoleModel) => {
    currentRoleId.value = record.id;
    assignPermissionVisible.value = true;
  };

  // 处理权限分配成功
  const handleAssignSuccess = () => {
    assignPermissionVisible.value = false;
    Message.success(t('authority.role.permission.assign.success'));
  };

  const columns: TableColumnData[] = [
    {
      title: t('authority.role.searchTable.columns.name'),
      dataIndex: 'name',
    },
    {
      title: t('authority.role.searchTable.columns.code'),
      dataIndex: 'code',
    },
    {
      title: t('authority.role.searchTable.columns.description'),
      dataIndex: 'description',
    },
    {
      title: t('authority.role.searchTable.columns.status'),
      dataIndex: 'status',
      render: ({ record }) => {
        return h(
          'span',
          {},
          record.status === 1
            ? t('authority.status.enabled')
            : t('authority.status.disabled')
        );
      },
    },
    {
      title: t('common.table.columns.createdAt'),
      dataIndex: 'createdAt',
      render: ({ record }) => {
        return h('span', {}, formatTimestamp(record.createdAt));
      },
    },
    {
      title: t('common.table.columns.updatedAt'),
      dataIndex: 'updatedAt',
      render: ({ record }) => {
        return h('span', {}, formatTimestamp(record.updatedAt));
      },
    },
    {
      title: t('common.operations'),
      dataIndex: 'operations',
      render: ({ record }) => {
        return h('div', [
          h(
            Permission,
            { requiredPermissions: ['010403'] },
            {
              default: () =>
                h(
                  'a',
                  {
                    style: { marginRight: '15px' },
                    onClick: () => openEditModal(record as RoleModel),
                  },
                  t('authority.button.edit')
                ),
            }
          ),
          h(
            Permission,
            { requiredPermissions: ['010306'] },
            {
              default: () =>
                h(
                  'a',
                  {
                    style: { marginRight: '15px' },
                    onClick: () =>
                      openAssignPermissionModal(record as RoleModel),
                  },
                  t('authority.button.assign')
                ),
            }
          ),
          h(
            Permission,
            { requiredPermissions: ['010304'] },
            {
              default: () =>
                h(
                  'a',
                  {
                    style: { color: '#FF7D00' },
                    onClick: () => handleDelete(record as RoleModel),
                  },
                  t('authority.button.delete')
                ),
            }
          ),
        ]);
      },
    },
  ];

  const reset = () => {
    formModel.value = {
      name: '',
      code: '',
    };
    search();
  };

  const onPageChange = (current: number) => {
    pagination.current = current;
    search();
  };

  const handleSuccess = (needReset?: boolean) => {
    if (needReset) {
      reset();
    } else {
      search();
    }
  };

  // 初始加载
  search();
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px;
  }

  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
</style>
