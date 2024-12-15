<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.permission']" />
    <a-card class="general-card" :title="t('menu.authority.permission')">
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
                  :label="t('authority.permission.searchTable.form.name')"
                >
                  <a-input
                    v-model="formModel.name"
                    :placeholder="
                      t(
                        'authority.permission.searchTable.form.name.placeholder'
                      )
                    "
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="code"
                  :label="t('authority.permission.searchTable.form.code')"
                >
                  <a-input
                    v-model="formModel.code"
                    :placeholder="
                      t(
                        'authority.permission.searchTable.form.code.placeholder'
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
              {{ t('authority.permission.searchTable.operation.create') }}
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

    <!-- 创建/编辑权限的弹窗 -->
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
          :label="t('authority.permission.searchTable.columns.name')"
          :rules="[
            {
              required: true,
              message: t(
                'authority.permission.searchTable.form.name.placeholder'
              ),
            },
          ]"
        >
          <a-input
            v-model="modalForm.name"
            :placeholder="
              t('authority.permission.searchTable.form.name.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="code"
          :label="t('authority.permission.searchTable.columns.code')"
          :rules="[
            {
              required: true,
              message: t(
                'authority.permission.searchTable.form.code.placeholder'
              ),
            },
          ]"
        >
          <a-input
            v-model="modalForm.code"
            :placeholder="
              t('authority.permission.searchTable.form.code.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="type"
          :label="t('authority.permission.searchTable.columns.type')"
          :rules="[{ required: true, message: '请选择权限类型' }]"
        >
          <a-select v-model="modalForm.type">
            <a-option :value="1">{{
              t('authority.permission.type.menu')
            }}</a-option>
            <a-option :value="2">{{
              t('authority.permission.type.button')
            }}</a-option>
            <a-option :value="3">{{
              t('authority.permission.type.api')
            }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item
          field="status"
          :label="t('authority.permission.searchTable.columns.status')"
        >
          <a-switch
            v-model="modalForm.status"
            :checked-value="1"
            :unchecked-value="2"
          />
        </a-form-item>
        <a-form-item
          field="resources"
          :label="t('authority.permission.searchTable.columns.resources')"
        >
          <div class="resource-list">
            <div
              v-for="(resource, index) in modalForm.resources"
              :key="index"
              class="resource-item"
            >
              <a-select
                v-model="resource.method"
                style="width: 120px"
                :placeholder="t('authority.permission.form.method.placeholder')"
              >
                <a-option value="GET">GET</a-option>
                <a-option value="POST">POST</a-option>
                <a-option value="PUT">PUT</a-option>
                <a-option value="DELETE">DELETE</a-option>
              </a-select>
              <a-input
                v-model="resource.path"
                :placeholder="t('authority.permission.form.path.placeholder')"
                style="width: calc(100% - 160px); margin: 0 8px"
              />
              <a-button
                type="text"
                status="danger"
                @click="removeResource(index)"
              >
                <icon-delete />
              </a-button>
            </div>
            <div class="resource-add">
              <a-button type="outline" @click="addResource">
                <template #icon>
                  <icon-plus />
                </template>
                {{ t('authority.permission.form.resource.add') }}
              </a-button>
            </div>
          </div>
        </a-form-item>
        <a-form-item
          field="icon"
          :label="t('authority.permission.searchTable.columns.icon')"
        >
          <a-input
            v-model="modalForm.icon"
            :placeholder="
              t('authority.permission.searchTable.form.icon.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="path"
          :label="t('authority.permission.searchTable.columns.path')"
        >
          <a-input
            v-model="modalForm.path"
            :placeholder="
              t('authority.permission.searchTable.form.path.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="parentId"
          :label="t('authority.permission.searchTable.columns.parentId')"
        >
          <a-input-number
            v-model="modalForm.parentId"
            :placeholder="
              t('authority.permission.searchTable.form.parentId.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="sequence"
          :label="t('authority.permission.searchTable.columns.sequence')"
        >
          <a-input-number
            v-model="modalForm.sequence"
            :placeholder="
              t('authority.permission.searchTable.form.sequence.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="description"
          :label="t('authority.permission.searchTable.columns.description')"
        >
          <a-textarea
            v-model="modalForm.description"
            :placeholder="
              t('authority.permission.searchTable.form.description.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="localize"
          :label="t('authority.permission.searchTable.columns.localize')"
        >
          <a-input
            v-model="modalForm.localize"
            :placeholder="
              t('authority.permission.searchTable.form.localize.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="properties"
          :label="t('authority.permission.searchTable.columns.properties')"
        >
          <a-textarea
            v-model="modalForm.properties"
            :placeholder="
              t('authority.permission.searchTable.form.properties.placeholder')
            "
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, h, getCurrentInstance } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import {
    IconSearch,
    IconRefresh,
    IconPlus,
    IconDelete,
  } from '@arco-design/web-vue/es/icon';
  import { permissionsApi } from '@/api/authority';
  import type {
    PermissionModel,
    PermissionCreateRequest,
    PermissionUpdateRequest,
    ResourceModel,
  } from '@/types/api/authority';

  const { t } = useI18n();
  const instance = getCurrentInstance();
  const proxy = instance?.proxy;
  const formModel = ref({
    name: '',
    code: '',
  });

  const loading = ref(false);
  const renderData = ref<PermissionModel[]>([]);
  const modalVisible = ref(false);
  const modalTitle = ref('');
  const formRef = ref();

  const defaultFormData = {
    id: '',
    name: '',
    code: '',
    type: 1,
    icon: undefined,
    path: undefined,
    parentId: undefined,
    sequence: undefined,
    description: undefined,
    localize: undefined,
    properties: undefined,
    resources: [] as ResourceModel[],
    status: 1,
  };
  const modalForm = reactive<PermissionModel>({ ...defaultFormData });

  const rules = {
    name: [
      {
        required: true,
        message: t('authority.permission.searchTable.form.name.placeholder'),
      },
    ],
    code: [
      {
        required: true,
        message: t('authority.permission.searchTable.form.code.placeholder'),
      },
    ],
    type: [{ required: true, message: '请选择权限类型' }],
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
      const data = await permissionsApi.getList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
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

  const openEditModal = (record: PermissionModel) => {
    modalTitle.value = t('authority.permission.modal.title.edit');
    modalForm.id = record.id;
    modalForm.name = record.name;
    modalForm.code = record.code;
    modalForm.type = record.type;
    modalForm.icon = record.icon;
    modalForm.path = record.path;
    modalForm.parentId = record.parentId;
    modalForm.sequence = record.sequence;
    modalForm.description = record.description;
    modalForm.localize = record.localize;
    modalForm.properties = record.properties;
    modalForm.resources = record.resources?.map((r) => ({ ...r })) || [];
    modalForm.status = record.status;
    modalVisible.value = true;
  };

  const handleDelete = async (record: PermissionModel) => {
    Modal.confirm({
      title: t('authority.permission.delete.confirm.title'),
      content: t('authority.permission.delete.confirm.content', {
        name: record.name,
      }),
      onOk: async () => {
        try {
          await permissionsApi.delete(record.id);
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
      title: t('authority.permission.searchTable.columns.name'),
      dataIndex: 'name',
    },
    {
      title: t('authority.permission.searchTable.columns.code'),
      dataIndex: 'code',
    },
    {
      title: t('authority.permission.searchTable.columns.type'),
      dataIndex: 'type',
      render: ({ record }) => {
        const typeMap = {
          0: t('authority.permission.type.menu'),
          1: t('authority.permission.type.button'),
          2: t('authority.permission.type.api'),
        };
        return h('span', {}, typeMap[record.type as keyof typeof typeMap]);
      },
    },
    {
      title: t('authority.permission.searchTable.columns.path'),
      dataIndex: 'path',
    },
    {
      title: t('authority.permission.searchTable.columns.sequence'),
      dataIndex: 'sequence',
    },
    {
      title: t('authority.permission.searchTable.columns.status'),
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
              onClick: () => openEditModal(record as PermissionModel),
            },
            t('authority.button.edit')
          ),
          h(
            'a',
            {
              style: { color: '#FF7D00' },
              onClick: () => handleDelete(record as PermissionModel),
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

  const openCreateModal = () => {
    modalTitle.value = t('authority.permission.searchTable.operation.create');
    Object.assign(modalForm, defaultFormData);
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
          await permissionsApi.update(submitData as PermissionUpdateRequest);
        } else {
          await permissionsApi.create(submitData as PermissionCreateRequest);
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

  const addResource = () => {
    modalForm.resources.push({
      method: 'GET',
      path: '',
    } as ResourceModel);
  };

  const removeResource = (index: number) => {
    modalForm.resources.splice(index, 1);
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

  .resource-list {
    .resource-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .resource-add {
      margin-top: 8px;
    }
  }
</style>
