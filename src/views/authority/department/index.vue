<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.department']" />
    <a-card class="general-card" :title="t('department.title')">
      <!-- 搜索表单 -->
      <a-row class="mb-4">
        <a-col :flex="1">
          <a-form
            :model="searchForm"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="right"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="name" :label="t('department.search.name')">
                  <a-input
                    v-model="searchForm.name"
                    :placeholder="t('department.search.placeholder.name')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="code" :label="t('department.search.code')">
                  <a-input
                    v-model="searchForm.code"
                    :placeholder="t('department.search.placeholder.code')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="status" :label="t('department.search.status')">
                  <a-select
                    v-model="searchForm.status"
                    :options="[
                      { label: t('authority.status.enabled'), value: 1 },
                      { label: t('authority.status.disabled'), value: 0 }
                    ]"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
          <a-space>
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
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button v-permission="['010501']" type="primary" @click="handleCreate">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('authority.role.searchTable.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <!-- 部门表格 -->
      <a-table
        row-key="id"
        :loading="loading"
        :data="renderData"
        :columns="columns"
        :pagination="false"
        :bordered="false"
      >
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{
              record.status === 1 ? t('authority.status.enabled') : t('authority.status.disabled')
            }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleEdit(record)">
              <icon-edit />
              {{ t('authority.button.edit') }}
            </a-button>
            <a-button type="text" size="small" @click="handleDelete(record)">
              <icon-delete />
              {{ t('authority.button.delete') }}
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 部门表单弹窗 -->
    <DepartmentForm
      v-model:visible="visible"
      :title="formTitle"
      :form-data="formData"
      @submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
import useLoading from '@/hooks/loading';
import { DepartmentDto, DepartmentQueryParams } from '@/types/api/department';
import { departmentApi } from '@/api/department';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import DepartmentForm from './components/department-form.vue';

const { t } = useI18n();
const { loading, setLoading } = useLoading();
const visible = ref(false);
const formTitle = ref('');
const formData = ref<Partial<DepartmentDto>>({});
const renderData = ref<DepartmentDto[]>([]);

// 搜索表单
const searchForm = reactive<DepartmentQueryParams>({
  name: '',
  code: '',
  status: undefined
});

// 表格列定义
const columns = computed<TableColumnData[]>(() => [
  {
    title: t('department.columns.name'),
    dataIndex: 'name'
  },
  {
    title: t('department.columns.code'),
    dataIndex: 'code'
  },
  {
    title: t('department.columns.sort'),
    dataIndex: 'sort'
  },
  {
    title: t('department.columns.leader'),
    dataIndex: 'leader'
  },
  {
    title: t('department.columns.phone'),
    dataIndex: 'phone'
  },
  {
    title: t('department.columns.email'),
    dataIndex: 'email'
  },
  {
    title: t('department.columns.status'),
    dataIndex: 'status',
    slotName: 'status'
  },
  {
    title: t('department.columns.createdAt'),
    dataIndex: 'createdAt'
  },
  {
    title: t('department.columns.operations'),
    dataIndex: 'operations',
    slotName: 'operations',
    width: 160,
    fixed: 'right'
  }
]);

// 加载部门列表
const fetchData = async () => {
  setLoading(true);
  try {
    const data = await departmentApi.getDepartmentList(searchForm);
    renderData.value = data;
  } catch (err) {
    Message.error(t('authority.common.search.failed'));
  } finally {
    setLoading(false);
  }
};

// 搜索和重置
const search = () => {
  fetchData();
};

const reset = () => {
  searchForm.name = '';
  searchForm.code = '';
  searchForm.status = undefined;
  search();
};

// 创建部门
const handleCreate = () => {
  formTitle.value = t('department.form.title.create');
  formData.value = {
    status: 1,
    sort: 0
  };
  visible.value = true;
};

// 编辑部门
const handleEdit = (record: DepartmentDto) => {
  formTitle.value = t('department.form.title.edit');
  formData.value = { ...record };
  visible.value = true;
};

// 删除部门
const handleDelete = (record: DepartmentDto) => {
  Modal.confirm({
    title: t('department.operation.delete.confirm.title'),
    content: t('department.operation.delete.confirm.content'),
    onOk: async () => {
      try {
        await departmentApi.deleteDepartment(record.id);
        Message.success(t('department.operation.delete.success'));
        fetchData();
      } catch (err) {
        Message.error(t('department.operation.delete.error'));
      }
    }
  });
};

// 表单提交
const handleSubmit = async (data: DepartmentDto) => {
  try {
    if (data.id) {
      await departmentApi.updateDepartment(data);
      Message.success(t('department.operation.update.success'));
    } else {
      await departmentApi.createDepartment(data);
      Message.success(t('department.operation.create.success'));
    }
    visible.value = false;
    fetchData();
  } catch (err) {
    Message.error(
      data.id ? t('department.operation.update.error') : t('department.operation.create.error')
    );
  }
};

// 初始化
fetchData();
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px;
}

.general-card {
  min-height: calc(100vh - 160px);
}

.mb-4 {
  margin-bottom: 24px;
}
</style>
