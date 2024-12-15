<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.user']" />
    <a-card class="general-card" :title="t('menu.authority.user')">
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
                  field="userName"
                  :label="t('authority.user.searchTable.form.userName')"
                >
                  <a-input
                    v-model="formModel.username"
                    :placeholder="
                      t('authority.user.searchTable.form.userName.placeholder')
                    "
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="email"
                  :label="t('authority.user.searchTable.form.email')"
                >
                  <a-input
                    v-model="formModel.email"
                    :placeholder="
                      t('authority.user.searchTable.form.email.placeholder')
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
              {{ t('authority.user.searchTable.operation.create') }}
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
    <!-- 创建/编辑用户的弹窗 -->
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
          field="username"
          :label="t('authority.user.searchTable.columns.userName')"
          :rules="[
            {
              required: true,
              message: t(
                'authority.user.searchTable.form.userName.placeholder'
              ),
            },
          ]"
        >
          <a-input
            v-model="modalForm.username"
            :placeholder="
              t('authority.user.searchTable.form.userName.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          v-if="!modalForm.id"
          field="password"
          :label="t('authority.user.searchTable.columns.password')"
          :rules="[
            {
              required: true,
              message: t(
                'authority.user.searchTable.form.password.placeholder'
              ),
            },
          ]"
        >
          <a-input-password
            v-model="modalForm.password"
            :placeholder="
              t('authority.user.searchTable.form.password.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="name"
          :label="t('authority.user.searchTable.columns.name')"
          :rules="[
            {
              required: true,
              message: t('authority.user.searchTable.form.name.placeholder'),
            },
          ]"
        >
          <a-input
            v-model="modalForm.name"
            :placeholder="t('authority.user.searchTable.form.name.placeholder')"
          />
        </a-form-item>
        <a-form-item
          field="email"
          :label="t('authority.user.searchTable.columns.email')"
          :rules="[
            {
              required: true,
              message: t('authority.user.searchTable.form.email.placeholder'),
            },
          ]"
        >
          <a-input
            v-model="modalForm.email"
            :placeholder="
              t('authority.user.searchTable.form.email.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="phone"
          :label="t('authority.user.searchTable.columns.phone')"
        >
          <a-input
            v-model="modalForm.phone"
            :placeholder="
              t('authority.user.searchTable.form.phone.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="roleIds"
          :label="t('authority.user.searchTable.columns.role')"
          :rules="[
            {
              required: true,
              message: t('authority.user.searchTable.form.role.placeholder'),
            },
          ]"
        >
          <a-select
            v-model="modalForm.roleIds"
            multiple
            :placeholder="t('authority.user.searchTable.form.role.placeholder')"
          >
            <!-- <a-option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.roleName }}
            </a-option> -->
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="!modalForm.id"
          field="invitationCode"
          :label="t('authority.user.searchTable.columns.invitationCode')"
        >
          <a-input
            v-model="modalForm.invitationCode"
            :placeholder="
              t('authority.user.searchTable.form.invitationCode.placeholder')
            "
          />
        </a-form-item>
        <a-form-item
          field="status"
          :label="t('authority.user.searchTable.columns.status')"
        >
          <a-switch v-model="modalForm.status" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import {
    IconPlus,
    IconRefresh,
    IconSearch,
  } from '@arco-design/web-vue/es/icon';
  import { userApi } from '@/api/authority';
  import type {
    UserCreateRequest,
    UserModel,
    UserUpdateRequest,
  } from '@/types/api/authority';

  const { t } = useI18n();

  const formModel = ref({
    username: '',
    email: '',
    roleId: undefined as string | undefined,
  });

  const loading = ref(false);
  const renderData = ref<UserModel[]>([]);
  const modalVisible = ref(false);
  const modalTitle = ref('');
  const formRef = ref();

  const modalForm = reactive({
    id: '',
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    roleIds: [] as number[],
    invitationCode: '',
    status: true,
  });

  const rules = {
    username: [
      {
        required: true,
        message: t('authority.user.searchTable.form.userName.placeholder'),
      },
    ],
    password: [{ required: true, message: '请输入密码' }],
    email: [
      {
        required: true,
        message: t('authority.user.searchTable.form.email.placeholder'),
      },
    ],
    roleId: [
      {
        required: true,
        message: t('authority.user.searchTable.form.role.placeholder'),
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
      const data = await userApi.getList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        ...formModel.value,
      });
      renderData.value = data.list;
      pagination.total = data.total;
    } catch (err) {
      Message.error('查询失败');
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    formModel.value = {
      username: '',
      email: '',
      roleId: undefined,
    };
    search();
  };

  const openEditModal = (record: UserModel) => {
    modalTitle.value = t('authority.user.modal.title.edit');
    modalForm.id = record.id;
    modalForm.username = record.username;
    modalForm.name = record.name;
    modalForm.email = record.email;
    modalForm.phone = record.phone;
    modalForm.roleIds = record.roleIds;
    modalForm.status = record.status === 1;
    modalVisible.value = true;
  };
  const handleDelete = async (record: UserModel) => {
    Modal.confirm({
      title: t('authority.user.delete.confirm.title'),
      content: t('authority.user.delete.confirm.content', {
        name: record.username,
      }),
      onOk: async () => {
        try {
          await userApi.delete(record.id);
          Message.success(t('common.success.operation'));
          search();
        } catch (err) {
          Message.error('删除失败');
        }
      },
    });
  };
  const columns: TableColumnData[] = [
    {
      title: t('authority.user.searchTable.columns.userName'),
      dataIndex: 'username',
    },
    {
      title: t('authority.user.searchTable.columns.name'),
      dataIndex: 'name',
    },
    {
      title: t('authority.user.searchTable.columns.email'),
      dataIndex: 'email',
    },
    {
      title: t('authority.user.searchTable.columns.phone'),
      dataIndex: 'phone',
    },
    {
      title: t('authority.user.searchTable.columns.role'),
      dataIndex: 'roleIds',
      render: ({ record }) => {
        return h('span', {}, record.roleIds.join(', '));
      },
    },
    {
      title: t('authority.user.searchTable.columns.status'),
      dataIndex: 'status',
      render: ({ record }) => {
        return h('span', {}, record.status === 1 ? '启用' : '禁用');
      },
    },
    {
      title: t('authority.user.searchTable.columns.createdTime'),
      dataIndex: 'createTime',
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
              onClick: () => openEditModal(record as UserModel),
            },
            '编辑'
          ),
          h(
            'a',
            {
              style: { color: '#FF7D00' },
              onClick: () => handleDelete(record as UserModel),
            },
            '删除'
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
    modalTitle.value = t('authority.user.modal.title.create');
    modalForm.id = '';
    modalForm.username = '';
    modalForm.password = '';
    modalForm.name = '';
    modalForm.email = '';
    modalForm.phone = '';
    modalForm.roleIds = [];
    modalForm.invitationCode = '';
    modalForm.status = true;
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
          await userApi.update(submitData as UserUpdateRequest);
        } else {
          await userApi.create(submitData as UserCreateRequest);
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
