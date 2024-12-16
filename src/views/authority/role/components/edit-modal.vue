<template>
  <a-modal
    :visible="visible"
    :title="title"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-align="right"
      :label-col-props="{ span: 6 }"
      :wrapper-col-props="{ span: 18 }"
    >
      <a-form-item
        field="name"
        :label="t('authority.role.searchTable.columns.name')"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model="form.name"
          :placeholder="t('authority.role.searchTable.form.name.placeholder')"
        />
      </a-form-item>
      <a-form-item
        field="code"
        :label="t('authority.role.searchTable.columns.code')"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model="form.code"
          :placeholder="t('authority.role.searchTable.form.code.placeholder')"
        />
      </a-form-item>
      <a-form-item
        field="localize"
        :label="t('authority.role.searchTable.columns.localize')"
      >
        <a-input
          v-model="form.localize"
          :placeholder="
            t('authority.role.searchTable.form.localize.placeholder')
          "
        />
      </a-form-item>
      <a-form-item
        field="description"
        :label="t('authority.role.searchTable.columns.description')"
      >
        <a-textarea
          v-model="form.description"
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
          v-model="form.status"
          :checked-value="1"
          :unchecked-value="2"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import type { RoleModel } from '@/types/api/authority';
  import { roleApi } from '@/api/authority';

  const props = defineProps<{
    visible: boolean;
    data: RoleModel;
  }>();

  const emit = defineEmits(['update:visible', 'success']);

  const { t } = useI18n();
  const formRef = ref();
  const form = reactive<RoleModel>({ ...props.data });
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
  const title = computed(() =>
    form.id
      ? t('authority.role.modal.title.edit')
      : t('authority.role.modal.title.create')
  );

  const handleOk = async () => {
    const result = await formRef.value?.validate();
    if (!result) {
      try {
        if (form.id) {
          await roleApi.update(form);
        } else {
          await roleApi.create(form);
        }
        emit('update:visible', false);
        Message.success(t('common.success.operation'));
        emit('success', !form.id);
      } catch (err) {
        Message.error(t('authority.common.operation.failed'));
      }
    }
  };

  const handleCancel = () => {
    emit('update:visible', false);
  };
  watch(
    () => props.data,
    (val) => {
      Object.assign(form, val);
    },
    { deep: true }
  );
</script>
