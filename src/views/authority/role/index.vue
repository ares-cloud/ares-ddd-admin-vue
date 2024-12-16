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
            <a-button type="primary" @click="search">
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
            <a-button type="primary" @click="openCreateModal">
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
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="modalForm"
        :rules="rules"
        label-align="right"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item
          field="name"
          :label="t('authority.role.searchTable.columns.name')"
          :rules="[
            {
              required: true,
              message: t('authority.role.searchTable.form.name.placeholder'),
            },
          ]"
        >
          <a-input
            v-model="modalForm.name"
            :placeholder="t('authority.role.searchTable.form.name.placeholder')"
          />
        </a-form-item>
        <a-form-item
          field="code"
          :label="t('authority.role.searchTable.columns.code')"
          :rules="[
            {
              required: true,
              message: t('authority.role.searchTable.form.code.placeholder'),
            },
          ]"
        >
          <a-input
            v-model="modalForm.code"
            :placeholder="t('authority.role.searchTable.form.code.placeholder')"
          />
        </a-form-item>
        <a-form-item
          field="description"
          :label="t('authority.role.searchTable.columns.description')"
        >
          <a-textarea
            v-model="modalForm.description"
            :placeholder="
              t('authority.role.searchTable.form.description.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="status"
          :label="t('authority.role.searchTable.columns.status')"
        >
          <a-switch
            v-model="modalForm.status"
            :checked-value="1"
            :unchecked-value="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>
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
  import type {
    RoleCreateRequest,
    RoleModel,
    RoleUpdateRequest,
  } from '@/types/api/authority';

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
  const modalTitle = ref('');
  const formRef = ref();

  const modalForm = reactive({
    id: '',
    name: '',
    code: '',
    description: '',
    status: true,
  });

  const rules = {
    name: [
      {
        required: true,
        message: t('authority.role.searchTable.form.name.placeholder'),
      },
    ],
    code: [
      {
        required: true,
        message: t('authority.role.searchTable.form.code.placeholder'),
      },
    ],
  };
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
    modalTitle.value = t('authority.role.searchTable.operation.create');
    modalForm.id = '';
    modalForm.name = '';
    modalForm.code = '';
    modalForm.description = '';
    modalForm.status = true;
    modalVisible.value = true;
  };

  const openEditModal = (record: RoleModel) => {
    modalTitle.value = t('authority.role.modal.title.edit');
    modalForm.id = record.id;
    modalForm.name = record.name;
    modalForm.code = record.code;
    modalForm.description = record.description;
    modalForm.status = record.status === 1;
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
        return h('span', {}, proxy?.$filters.formatTimestamp(record.createdAt));
      },
    },
    {
      title: t('common.table.columns.updatedAt'),
      dataIndex: 'updatedAt',
      render: ({ record }) => {
        return h('span', {}, proxy?.$filters.formatTimestamp(record.updatedAt));
      },
    },
    {
      title: t('common.operations'),
      dataIndex: 'operations',
      render: ({ record }) => {
        return h('div', [
          h(
            'a',
            {
              style: { marginRight: '15px' },
              onClick: () => openEditModal(record as RoleModel),
            },
            t('authority.button.edit')
          ),
          h(
            'a',
            {
              style: { color: '#FF7D00' },
              onClick: () => handleDelete(record as RoleModel),
            },
            t('authority.button.delete')
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

  const handleModalOk = async () => {
    const result = await formRef.value?.validate();
    if (!result) {
      try {
        const submitData = {
          ...modalForm,
          status: modalForm.status ? 1 : 0,
        };
        if (modalForm.id) {
          await roleApi.update(submitData as RoleUpdateRequest);
        } else {
          await roleApi.create(submitData as RoleCreateRequest);
        }
        modalVisible.value = false;
        Message.success(t('common.success.operation'));
        search();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
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
