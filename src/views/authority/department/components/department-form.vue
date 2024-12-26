<template>
  <a-modal
    :visible="visible"
    :title="title"
    @cancel="handleCancel"
    @ok="handleOk"
    @update:visible="(val) => $emit('update:visible', val)"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-align="right"
      :label-col-props="{ span: 6 }"
      :wrapper-col-props="{ span: 18 }"
    >
      <a-form-item field="parentId" :label="t('department.form.label.parentId')">
        <a-tree-select
          v-model="form.parentId"
          :data="departmentTree"
          :field-names="{
            key: 'id',
            title: 'name',
            children: 'children'
          }"
          :placeholder="t('department.form.placeholder.parentId')"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        field="name"
        :label="t('department.form.label.name')"
        :rules="[{ required: true, message: t('department.form.placeholder.name') }]"
      >
        <a-input
          v-model="form.name"
          :placeholder="t('department.form.placeholder.name')"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        field="code"
        :label="t('department.form.label.code')"
        :rules="[{ required: true, message: t('department.form.placeholder.code') }]"
      >
        <a-input
          v-model="form.code"
          :placeholder="t('department.form.placeholder.code')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="sort" :label="t('department.form.label.sort')">
        <a-input-number
          v-model="form.sort"
          :placeholder="t('department.form.placeholder.sort')"
          :min="0"
          :max="999"
        />
      </a-form-item>

      <a-form-item field="leader" :label="t('department.form.label.leader')">
        <a-input
          v-model="form.leader"
          :placeholder="t('department.form.placeholder.leader')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="phone" :label="t('department.form.label.phone')">
        <a-input
          v-model="form.phone"
          :placeholder="t('department.form.placeholder.phone')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="email" :label="t('department.form.label.email')">
        <a-input
          v-model="form.email"
          :placeholder="t('department.form.placeholder.email')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="status" :label="t('department.form.label.status')">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">{{ t('authority.status.enabled') }}</a-radio>
          <a-radio :value="0">{{ t('authority.status.disabled') }}</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item field="description" :label="t('department.form.label.description')">
        <a-textarea
          v-model="form.description"
          :placeholder="t('department.form.placeholder.description')"
          allow-clear
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FormInstance } from '@arco-design/web-vue';
import { DepartmentDto } from '@/types/api/department';
import { departmentApi } from '@/api/department';

const { t } = useI18n();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  formData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref<FormInstance>();
const departmentTree = ref<DepartmentDto[]>([]);

// 表单数据
const form = reactive<Partial<DepartmentDto>>({
  parentId: '',
  name: '',
  code: '',
  sort: 0,
  leader: '',
  phone: '',
  email: '',
  status: 1,
  description: ''
});

// 监听表单数据变化
watch(
  () => props.formData,
  (val) => {
    Object.assign(form, val);
  },
  { deep: true }
);

// 加载部门树
const loadDepartmentTree = async () => {
  try {
    departmentTree.value = await departmentApi.getDepartmentTree();
  } catch (err) {
    // handle error
  }
};

// 表单验证规则
const rules = {
  name: [{ required: true, message: t('department.form.placeholder.name') }],
  code: [{ required: true, message: t('department.form.placeholder.code') }]
};

// 处理取消
const handleCancel = () => {
  emit('update:visible', false);
};

// 处理确认
const handleOk = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    emit('submit', { ...form });
    emit('update:visible', false);
  } catch (err) {
    // 验证失败
  }
};

// 初始化加载部门树
loadDepartmentTree();
</script>
