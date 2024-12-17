<template>
  <div class="login-form">
    <h1>{{ t('login.form.title') }}</h1>
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      class="form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <a-form-item
        field="username"
        :label="t('login.form.userName.label')"
        :validate-trigger="['change', 'blur']"
        :rules="[
          { required: true, message: t('login.form.userName.required') },
        ]"
      >
        <a-input
          v-model="form.username"
          :placeholder="t('login.form.userName.placeholder')"
        >
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :label="t('login.form.password.label')"
        :validate-trigger="['change', 'blur']"
        :rules="[
          { required: true, message: t('login.form.password.required') },
        ]"
      >
        <a-input-password
          v-model="form.password"
          :placeholder="t('login.form.password.placeholder')"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item
        field="captcha"
        :label="t('login.form.captcha.label')"
        :validate-trigger="['change', 'blur']"
        :rules="[{ required: true, message: t('login.form.captcha.required') }]"
      >
        <a-space>
          <a-input
            v-model="form.captchaCode"
            :placeholder="t('login.form.captcha.placeholder')"
          >
            <template #prefix>
              <icon-safe />
            </template>
          </a-input>
          <div class="captcha-wrapper" @click="refreshCaptcha">
            <img v-if="captcha.image" :src="captcha.image" alt="captcha" />
            <a-spin v-else />
          </div>
        </a-space>
      </a-form-item>
      <a-space :size="16" direction="vertical">
        <div class="login-form-password-actions">
          <a-checkbox
            v-model="rememberPassword"
            @change="setRememberPassword as any"
          >
            {{ t('login.form.rememberPassword') }}
          </a-checkbox>
        </div>
        <a-button type="primary" html-type="submit" long :loading="loading">
          {{ t('login.form.login') }}
        </a-button>
      </a-space>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { IconLock, IconSafe, IconUser } from '@arco-design/web-vue/es/icon';
  import useAuth from '@/hooks/auth';
  import authApi from '@/api/auth';
  import useLoading from '@/hooks/loading';

  const auth = useAuth();
  const { t } = useI18n();
  const { loading, setLoading } = useLoading();
  const formRef = ref();

  const captcha = reactive({
    id: '',
    image: '',
  });

  const form = reactive({
    username: '',
    password: '',
    captchaCode: '',
    captchaKey: '',
  });

  const rememberPassword = ref(false);

  const getCaptcha = async () => {
    try {
      const res = await authApi.getCaptcha();
      captcha.id = res.key;
      captcha.image = res.image;
      form.captchaKey = res.key;
    } catch (err) {
      console.log(err);
      // 处理错误
    }
  };

  const refreshCaptcha = () => {
    getCaptcha();
  };

  const rules = {
    username: [{ required: true, message: t('login.form.userName.required') }],
    password: [{ required: true, message: t('login.form.password.required') }],
    captcha: [{ required: true, message: t('login.form.captcha.required') }],
  };

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate();
    } catch (err) {
      return; // 如果表单验证失败，直接返回
    }
    try {
      setLoading(true);
      await auth.login(form);
    } catch (err: any) {
      refreshCaptcha();
      Message.error(t('login.form.login.error'));
    } finally {
      setLoading(false);
    }
  };

  const setRememberPassword = (value: boolean) => {
    rememberPassword.value = value;
  };

  // 初始化获取验证码
  getCaptcha();
</script>

<style lang="less" scoped>
  .login-form {
    &-wrapper {
      width: 320px;
    }

    &-title {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 24px;
      line-height: 32px;
    }

    &-sub-title {
      color: var(--color-text-3);
      font-size: 16px;
      line-height: 24px;
    }

    &-error-msg {
      height: 32px;
      color: rgb(var(--red-6));
      line-height: 32px;
    }

    &-password-actions {
      display: flex;
      justify-content: space-between;
    }

    &-register-btn {
      color: var(--color-text-3) !important;
    }
  }

  .captcha-wrapper {
    width: 160px;
    height: 40px;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
    }
  }
</style>
