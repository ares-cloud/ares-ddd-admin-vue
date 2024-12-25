<template>
  <div class="container">
    <Breadcrumb :items="['menu.storage']" />
    <div class="view-mode-switch">
      <a-radio-group v-model="viewMode" type="button">
        <a-radio value="tree">
          <icon-mind-mapping :style="{ color: viewMode === 'tree' ? '#165DFF' : '' }" />
          {{ t('storage.viewMode.tree') }}
        </a-radio>
        <a-radio value="list">
          <icon-list :style="{ color: viewMode === 'list' ? '#165DFF' : '' }" />
          {{ t('storage.viewMode.list') }}
        </a-radio>
      </a-radio-group>
    </div>

    <a-row :gutter="16">
      <!-- 左侧文件夹树/列表 -->
      <a-col :span="viewMode === 'tree' ? 6 : 24">
        <a-card class="folder-tree-card">
          <template #title>
            <a-space>
              <icon-folder />
              {{ t('storage.folder.title') }}
            </a-space>
          </template>
          <template #extra>
            <a-button type="text" @click="handleAddRootFolder">
              <template #icon>
                <icon-plus />
              </template>
            </a-button>
          </template>

          <!-- 树形模式 -->
          <a-tree
            v-if="viewMode === 'tree'"
            :data="folderTree"
            :field-names="{
              key: 'id',
              title: 'name',
              children: 'children'
            }"
            :show-line="true"
            :selected-keys="[currentFolderId]"
            @select="handleSelectFolder"
          >
            <template #extra="node">
              <a-dropdown trigger="contextMenu">
                <icon-menu class="icon-menu" />
                <template #content>
                  <a-doption @click="handleAddSubFolder(node)">
                    <icon-plus />
                    {{ t('storage.folder.add') }}
                  </a-doption>
                  <a-doption @click="handleRenameFolder(node)">
                    <icon-edit />
                    {{ t('storage.folder.rename') }}
                  </a-doption>
                  <a-doption @click="handleDeleteFolder(node)">
                    <icon-delete />
                    {{ t('storage.folder.delete') }}
                  </a-doption>
                </template>
              </a-dropdown>
            </template>
          </a-tree>

          <!-- 列表模式 -->
          <template v-else>
            <div class="folder-list">
              <a-button
                v-if="currentFolderId !== '0'"
                class="back-button"
                @click="handleBackFolder"
              >
                <template #icon>
                  <icon-up />
                </template>
                {{ t('storage.folder.back') }}
              </a-button>

              <a-list :data="currentFolderList" :bordered="false">
                <template #item="{ item }">
                  <a-list-item>
                    <a-space @click="handleOpenFolder(item)">
                      <icon-folder />
                      {{ item.name }}
                    </a-space>
                    <template #extra>
                      <a-dropdown trigger="hover">
                        <a-button type="text">
                          <icon-more-vertical />
                        </a-button>
                        <template #content>
                          <a-doption @click="handleAddSubFolder(item)">
                            <icon-plus />
                            {{ t('storage.folder.add') }}
                          </a-doption>
                          <a-doption @click="handleRenameFolder(item)">
                            <icon-edit />
                            {{ t('storage.folder.rename') }}
                          </a-doption>
                          <a-doption @click="handleDeleteFolder(item)">
                            <icon-delete />
                            {{ t('storage.folder.delete') }}
                          </a-doption>
                        </template>
                      </a-dropdown>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </div>
          </template>
        </a-card>
      </a-col>

      <!-- 右侧文件列表，仅在树形模式下显示 -->
      <a-col v-if="viewMode === 'tree'" :span="18">
        <a-card class="file-list-card">
          <template #title>
            <a-breadcrumb>
              <a-breadcrumb-item v-for="item in folderPath" :key="item.id">
                <a @click="handleNavigateFolder(item)">{{ item.name }}</a>
              </a-breadcrumb-item>
            </a-breadcrumb>
          </template>
          <template #extra>
            <a-space>
              <a-upload
                :custom-request="handleUpload"
                :show-file-list="false"
                accept="*/*"
                :multiple="false"
              >
                <a-button type="primary">
                  <template #icon>
                    <icon-upload />
                  </template>
                  {{ t('storage.file.upload') }}
                </a-button>
              </a-upload>
              <a-button
                status="danger"
                :disabled="!selectedFiles.length"
                @click="handleBatchDelete"
              >
                <template #icon>
                  <icon-delete />
                </template>
                {{ t('storage.file.batchDelete') }}
              </a-button>
            </a-space>
          </template>

          <!-- 文件列表 -->
          <a-table
            row-key="id"
            :loading="loading"
            :pagination="pagination"
            :columns="columns"
            :data="fileList"
            :row-selection="rowSelection"
            @page-change="onPageChange"
          >
            <template #name="{ record }">
              <a-space>
                <icon-file v-if="record.type === 'file'" />
                <icon-folder v-else />
                {{ record.name }}
              </a-space>
            </template>
            <template #operations="{ record }">
              <a-space>
                <a-button v-if="record.type === 'file'" type="text" @click="handlePreview(record)">
                  <icon-eye />
                </a-button>
                <a-button v-if="record.type === 'file'" type="text" @click="handleDownload(record)">
                  <icon-download />
                </a-button>
                <a-button type="text" @click="handleShare(record)">
                  <icon-share />
                </a-button>
                <a-button type="text" status="danger" @click="handleDelete(record)">
                  <icon-delete />
                </a-button>
              </a-space>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 新建/重命名文件夹对话框 -->
    <a-modal
      v-model:visible="folderModalVisible"
      :title="folderModalTitle"
      @ok="handleFolderModalOk"
      @cancel="handleFolderModalCancel"
    >
      <a-form ref="folderFormRef" :model="folderForm">
        <a-form-item
          field="name"
          :label="t('storage.folder.name')"
          :rules="[{ required: true, message: t('storage.folder.nameRequired') }]"
        >
          <a-input v-model="folderForm.name" :placeholder="t('storage.folder.namePlaceholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分享对话框 -->
    <a-modal
      v-model:visible="shareModalVisible"
      :title="t('storage.share.title')"
      @ok="handleShareModalOk"
      @cancel="handleShareModalCancel"
    >
      <a-form ref="shareFormRef" :model="shareForm">
        <a-form-item field="password" :label="t('storage.share.password')">
          <a-input-password
            v-model="shareForm.password"
            :placeholder="t('storage.share.passwordPlaceholder')"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="expireTime" :label="t('storage.share.expireTime')">
          <a-date-picker
            v-model="shareForm.expireTime"
            :placeholder="t('storage.share.expireTimePlaceholder')"
            show-time
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message, Modal, TreeNodeData } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
import type { FileDto, FolderTreeDto } from '@/types/api/storage';
import storageApi from '@/api/storage';
import useLoading from '@/hooks/loading';
import formatBytes from '@/utils/format';
import { formatTimestamp } from '@/filters/date';
import { useI18n } from 'vue-i18n';
import { RequestOption, UploadRequest } from '@arco-design/web-vue/es/upload/interfaces';

const { t } = useI18n();
const { loading, setLoading } = useLoading();

// 文件夹树相关
const folderTree = ref<FolderTreeDto[]>([]);
const currentFolderId = ref<string>('0');
const folderPath = ref<FolderTreeDto[]>([]);

// 文件列表相关
const fileList = ref<FileDto[]>([]);
const selectedFiles = ref<FileDto[]>([]);
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 表格列定义
const columns: TableColumnData[] = [
  {
    title: t('storage.file.name'),
    dataIndex: 'name',
    slotName: 'name'
  },
  {
    title: t('storage.file.size'),
    dataIndex: 'size',
    render: ({ record }) => formatBytes(record.size)
  },
  {
    title: t('storage.file.updatedAt'),
    dataIndex: 'updatedAt',
    render: ({ record }) => formatTimestamp(record.updatedAt)
  },
  {
    title: t('storage.file.operations'),
    slotName: 'operations',
    width: 160,
    fixed: 'right'
  }
];

// 表格选择配置
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onSelect: (selectedRowKeys: string[]) => {
    selectedFiles.value = selectedRowKeys.map((key) =>
      fileList.value.find((item) => item.id === key)
    );
  }
};

// 加载文件夹树
const loadFolderTree = async () => {
  try {
    folderTree.value = await storageApi.getFolderTree();
  } catch (err) {
    Message.error(t('storage.folder.loadError'));
  }
};

// 加载文件列表
const loadFileList = async () => {
  setLoading(true);
  try {
    const { list, total } = await storageApi.getFileList({
      current: pagination.current,
      size: pagination.pageSize,
      folderId: currentFolderId.value
    });
    fileList.value = list;
    pagination.total = total;
  } catch (err) {
    Message.error(t('storage.file.loadError'));
  } finally {
    setLoading(false);
  }
};

// 文件夹操作相关
const folderModalVisible = ref(false);
const folderModalTitle = ref('');
const folderForm = reactive({
  name: '',
  parentId: '0',
  id: ''
});
const folderFormRef = ref();

// 添加根目录
const handleAddRootFolder = () => {
  folderModalTitle.value = t('storage.folder.addRoot');
  folderForm.parentId = '0';
  folderForm.name = '';
  folderForm.id = '';
  folderModalVisible.value = true;
};

// 添加子目录
const handleAddSubFolder = (node: FolderTreeDto) => {
  folderModalTitle.value = t('storage.folder.addSub');
  folderForm.parentId = node.id;
  folderForm.name = '';
  folderForm.id = '';
  folderModalVisible.value = true;
};

// 重命名目录
const handleRenameFolder = (node: FolderTreeDto) => {
  folderModalTitle.value = t('storage.folder.rename');
  folderForm.parentId = node.parentId;
  folderForm.id = node.id;
  folderForm.name = node.name;
  folderModalVisible.value = true;
};

// 删除目录
const handleDeleteFolder = async (node: FolderTreeDto) => {
  Modal.confirm({
    title: t('storage.folder.deleteConfirmTitle'),
    content: t('storage.folder.deleteConfirmContent'),
    onOk: async () => {
      try {
        await storageApi.deleteFolder(node.id);
        Message.success(t('storage.folder.deleteSuccess'));
        loadFolderTree();
      } catch (err) {
        Message.error(t('storage.folder.deleteError'));
      }
    }
  });
};

// 确认新建/重命名文件夹
const handleFolderModalOk = async () => {
  if (!folderForm.name) {
    Message.error(t('storage.folder.nameRequired'));
    return;
  }
  try {
    if (folderForm.id) {
      await storageApi.renameFolder({
        name: folderForm.name,
        id: folderForm.id
      });
    } else {
      await storageApi.createFolder({
        name: folderForm.name,
        parentId: folderForm.parentId
      });
    }
    Message.success(t('storage.folder.createSuccess'));
    folderModalVisible.value = false;
    // 重新加载文件夹树
    loadFolderTree();
    // 如果当前在列表模式，也需要刷新当前文件夹列表
    // eslint-disable-next-line no-use-before-define
    if (viewMode.value === 'list') {
      loadFileList();
    }
  } catch (err) {
    Message.error(t('storage.folder.createError'));
  }
};

// 取消新建/重命名文件夹
const handleFolderModalCancel = () => {
  folderModalVisible.value = false;
  folderForm.name = '';
  folderForm.parentId = '0';
};

// 文件操作相关
// 上传文件
const handleUpload = (option: RequestOption): UploadRequest => {
  const { fileItem, onSuccess, onError } = option;

  // 返回一个控制上传操作的对象
  const abortController = new AbortController();
  if (fileItem.file) {
    storageApi
      .uploadFile(fileItem.file, currentFolderId.value)
      .then((res) => {
        // 成功回调
        Message.success(t('storage.file.uploadSuccess'));
        loadFileList(); // 刷新文件列表
        onSuccess?.(res);
      })
      .catch((err) => {
        Message.error(t('storage.file.uploadError'));
        onError?.(err as Error);
      });
  }
  // 返回控制操作对象
  return {
    abort: () => {
      abortController.abort();
    }
  };
};

// 预览文件
const handlePreview = async (record: FileDto) => {
  try {
    const url = await storageApi.previewFile(record.id);
    window.open(url);
  } catch (err) {
    Message.error(t('storage.file.previewError'));
  }
};

// 下载文件
const handleDownload = async (record: FileDto) => {
  try {
    const blob = await storageApi.downloadFile(record.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = record.name;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    Message.error(t('storage.file.downloadError'));
  }
};

// 删除文件
const handleDelete = async (record: FileDto) => {
  Modal.confirm({
    title: t('storage.file.deleteConfirmTitle'),
    content: t('storage.file.deleteConfirmContent'),
    onOk: async () => {
      try {
        await storageApi.deleteFile(record.id);
        Message.success(t('storage.file.deleteSuccess'));
        loadFileList();
      } catch (err) {
        Message.error(t('storage.file.deleteError'));
      }
    }
  });
};

// 批量删除文件
const handleBatchDelete = async () => {
  Modal.confirm({
    title: t('storage.file.batchDeleteConfirmTitle'),
    content: t('storage.file.batchDeleteConfirmContent'),
    onOk: async () => {
      try {
        const deletePromises = selectedFiles.value.map((file) => storageApi.deleteFile(file.id));
        await Promise.all(deletePromises);
        Message.success(t('storage.file.batchDeleteSuccess'));
        loadFileList();
      } catch (err) {
        Message.error(t('storage.file.batchDeleteError'));
      }
    }
  });
};

// 视图模式
const viewMode = ref<'tree' | 'list'>('tree');

// 当前文件夹的子文件夹列表
const currentFolderList = computed(() => {
  if (viewMode.value === 'list') {
    return folderTree.value.filter((folder) => folder.parentId === currentFolderId.value);
  }
  return [];
});

// 更新文件夹路径
const updateFolderPath = (folder: FolderTreeDto) => {
  const path: FolderTreeDto[] = [];
  let current: FolderTreeDto | undefined = folder;

  const findParent = (parentId: string) => folderTree.value.find((f) => f.id === parentId);

  while (current) {
    path.unshift(current);
    current = findParent(current.parentId);
  }

  folderPath.value = path;
};

// 处理文件夹导航
const handleOpenFolder = (folder: FolderTreeDto) => {
  currentFolderId.value = folder.id;
  updateFolderPath(folder);
  loadFileList();
};

const handleBackFolder = async () => {
  if (folderPath.value.length > 1) {
    const parentFolder = folderPath.value[folderPath.value.length - 2];
    currentFolderId.value = parentFolder.id;
    folderPath.value.pop();
    loadFileList();
  } else {
    currentFolderId.value = '0';
    folderPath.value = [];
    loadFileList();
  }
};

// 处理树形模式下的文件夹选择
const handleSelectFolder = (
  selectedKeys: (string | number)[],
  data: {
    selected?: boolean;
    selectedNodes: TreeNodeData[];
    node?: TreeNodeData;
    e?: Event;
  }
) => {
  if (selectedKeys.length > 0 && data.selectedNodes.length > 0) {
    const stringKeys = selectedKeys.map((key) => key.toString());
    const folderId = stringKeys[0];
    if (folderId) {
      currentFolderId.value = folderId;
      // updateFolderPath(data.selectedNodes[0]);
      loadFileList();
    }
  }
};

// 初始化
onMounted(() => {
  loadFolderTree();
  loadFileList();
});
</script>

<style scoped lang="less">

.container {
  padding: 0 20px 20px;
}

.folder-tree-card {
  min-height: calc(100vh - 160px);
}

.file-list-card {
  min-height: calc(100vh - 160px);
}

.icon-menu {
  position: absolute;
  right: 8px;
  font-size: 12px;
  top: 10px;
  color: #3370ff;
}

.view-mode-switch {
  margin-bottom: 16px;
  text-align: right;
}

.folder-list {
  .back-button {
    margin-bottom: 16px;
  }

  .arco-list-item {
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--color-fill-2);
    }
  }
}
</style>
