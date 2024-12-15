<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.tenant']" />
    <a-card :title="t('menu.authority.tenant')">
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
                  field="tenantName"
                  :label="t('authority.tenant.searchTable.form.tenantName')"
                >
                  <a-input
                    v-model="formModel.tenantName"
                    :placeholder="
                      t(
                        'authority.tenant.searchTable.form.tenantName.placeholder'
                      )
                    "
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="tenantCode"
                  :label="t('authority.tenant.searchTable.form.tenantCode')"
                >
                  <a-input
                    v-model="formModel.tenantCode"
                    :placeholder="
                      t(
                        'authority.tenant.searchTable.form.tenantCode.placeholder'
                      )
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
              {{ t('authority.tenant.searchTable.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="storeLoading"
        :pagination="pagination"
        :columns="columns"
        :data="renderData"
        @page-change="onPageChange"
      />
    </a-card>

    <!-- 创建/编辑租户的弹窗 -->
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
          field="tenantName"
          :label="t('authority.tenant.searchTable.columns.tenantName')"
          :rules="[
            {
              required: true,
              message: t(
                'authority.tenant.searchTable.form.tenantName.placeholder'
              ),
            },
          ]"
        >
          <a-input
            v-model="modalForm.tenantName"
            :placeholder="
              t('authority.tenant.searchTable.form.tenantName.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="tenantCode"
          :label="t('authority.tenant.searchTable.columns.tenantCode')"
          :rules="[
            {
              required: true,
              message: t(
                'authority.tenant.searchTable.form.tenantCode.placeholder'
              ),
            },
          ]"
        >
          <a-input
            v-model="modalForm.tenantCode"
            :placeholder="
              t('authority.tenant.searchTable.form.tenantCode.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="description"
          :label="t('authority.tenant.searchTable.columns.description')"
        >
          <a-textarea
            v-model="modalForm.description"
            :placeholder="
              t('authority.tenant.searchTable.form.description.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="is_default"
          :label="t('authority.tenant.searchTable.columns.is_default')"
        >
          <a-switch v-model="modalForm.is_default" />
        </a-form-item>
        <a-form-item
          field="expireTime"
          :label="t('authority.tenant.searchTable.columns.expireTime')"
          :rules="[{ required: true, message: '请选择过期时间' }]"
        >
          <a-date-picker
            v-model="modalForm.expireTime"
            show-time
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item
          field="status"
          :label="t('authority.tenant.searchTable.columns.status')"
        >
          <a-switch v-model="modalForm.status" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, h, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import {
    IconSearch,
    IconRefresh,
    IconPlus,
  } from '@arco-design/web-vue/es/icon';
  import { tenantApi } from '@/api/authority';
  import type {
    TenantModel,
    TenantCreateRequest,
    TenantUpdateRequest,
  } from '@/types/api/authority';
  import { useAppStore } from '@/store';

  const { t } = useI18n();
  const appStore = useAppStore();
  const storeLoading = computed(() => appStore.loading);

  const formModel = ref({
    tenantName: '',
    tenantCode: '',
  });

  const renderData = ref<TenantModel[]>([]);
  const modalVisible = ref(false);
  const modalTitle = ref('');
  const formRef = ref();

  const modalForm = reactive({
    id: '',
    tenantName: '',
    tenantCode: '',
    expireTime: '',
    status: true,
    description: '',
    is_default: 0,
  });

  const rules = {
    tenantName: [
      {
        required: true,
        message: t('authority.tenant.searchTable.form.tenantName.placeholder'),
      },
    ],
    tenantCode: [
      {
        required: true,
        message: t('authority.tenant.searchTable.form.tenantCode.placeholder'),
      },
    ],
    expireTime: [{ required: true, message: '请选择过期时间' }],
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
    try {
      const data = await tenantApi.getList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        ...formModel.value,
      });
      renderData.value = data.list;
      pagination.total = data.total;
    } catch (err) {
      Message.error('查询失败');
    }
  };

  const reset = () => {
    formModel.value = {
      tenantName: '',
      tenantCode: '',
    };
    search();
  };

  const openEditModal = (record: TenantModel) => {
    modalTitle.value = t('authority.tenant.modal.title.edit');
    modalForm.id = record.id;
    modalForm.tenantName = record.tenantName;
    modalForm.tenantCode = record.tenantCode;
    modalForm.expireTime = record.expireTime;
    modalForm.status = record.status === 1;
    modalForm.description = record.description;
    modalForm.is_default = record.is_default;
    modalVisible.value = true;
  };

  const handleDelete = async (record: TenantModel) => {
    Modal.confirm({
      title: t('authority.tenant.delete.confirm.title'),
      content: t('authority.tenant.delete.confirm.content', {
        name: record.tenantName,
      }),
      onOk: async () => {
        try {
          await tenantApi.delete(record.id);
          Message.success(t('common.success.operation'));
          search();
        } catch (err) {
          Message.error('操作失败');
        }
      },
    });
  };

  const columns: TableColumnData[] = [
    {
      title: t('authority.tenant.searchTable.columns.tenantName'),
      dataIndex: 'tenantName',
    },
    {
      title: t('authority.tenant.searchTable.columns.tenantCode'),
      dataIndex: 'tenantCode',
    },
    {
      title: t('authority.tenant.searchTable.columns.description'),
      dataIndex: 'description',
    },
    {
      title: t('authority.tenant.searchTable.columns.expireTime'),
      dataIndex: 'expireTime',
    },
    {
      title: t('authority.tenant.searchTable.columns.is_default'),
      dataIndex: 'is_default',
      render: ({ record }) => {
        return h('span', {}, record.is_default === 1 ? '是' : '否');
      },
    },
    {
      title: t('authority.tenant.searchTable.columns.status'),
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
      title: t('common.operations'),
      dataIndex: 'operations',
      render: ({ record }) => {
        return h('div', [
          h(
            'a',
            {
              style: { marginRight: '15px' },
              onClick: () => openEditModal(record as TenantModel),
            },
            t('authority.button.edit')
          ),
          h(
            'a',
            {
              style: { color: '#FF7D00' },
              onClick: () => handleDelete(record as TenantModel),
            },
            t('authority.button.delete')
          ),
        ]);
      },
    },
  ];

  const onPageChange = (current: number) => {
    pagination.current = current;
    search();
  };

  const openCreateModal = () => {
    modalTitle.value = t('authority.tenant.modal.title.create');
    modalForm.id = '';
    modalForm.tenantName = '';
    modalForm.tenantCode = '';
    modalForm.expireTime = '';
    modalForm.status = true;
    modalForm.description = '';
    modalForm.is_default = 0;
    modalVisible.value = true;
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
          await tenantApi.update(submitData as TenantUpdateRequest);
        } else {
          await tenantApi.create(submitData as TenantCreateRequest);
        }
        modalVisible.value = false;
        Message.success(t('common.success.operation'));
        search();
      } catch (err) {
        Message.error('操作失败');
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
