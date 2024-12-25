import request from '@/utils/request';
import {
  FileDto,
  FolderDto,
  FolderTreeDto,
  FileShareDto,
  StorageQueryParams,
  BatchOperationCommand,
  CreateFolderCommand,
  ShareFileCommand,
  RenameFolderCommand
} from '@/types/api/storage';

const BASE_URL = '/storage';

export default {
  // 文件相关接口
  getFileList: (params: StorageQueryParams): Promise<FileDto[]> =>
    request(`${BASE_URL}/files`, {
      method: 'GET',
      params
    }),

  uploadFile: (file: File, folderId: string): Promise<FileDto> =>
    request('/storage/files', {
      method: 'POST',
      file,
      params: { folderId }
    }),

  deleteFile: (id: string): Promise<void> =>
    request(`${BASE_URL}/files/${id}`, {
      method: 'DELETE'
    }),

  downloadFile: (id: string): Promise<Blob> =>
    request(`${BASE_URL}/files/${id}/download`, {
      method: 'GET',
      responseType: 'blob'
    }),

  previewFile: (id: string): Promise<string> =>
    request(`${BASE_URL}/files/${id}/preview`, {
      method: 'GET'
    }),

  recycleFile: (id: string): Promise<void> =>
    request(`${BASE_URL}/files/${id}/recycle`, {
      method: 'POST'
    }),

  restoreFile: (id: string): Promise<void> =>
    request(`${BASE_URL}/files/${id}/restore`, {
      method: 'POST'
    }),

  shareFile: (id: string, body: ShareFileCommand): Promise<FileShareDto> =>
    request(`${BASE_URL}/files/${id}/share`, {
      method: 'POST',
      body
    }),

  batchDeleteFiles: (body: BatchOperationCommand): Promise<void> =>
    request(`${BASE_URL}/files/batch/delete`, {
      method: 'POST',
      body
    }),

  batchMoveFiles: (body: BatchOperationCommand): Promise<void> =>
    request(`${BASE_URL}/files/batch/move`, {
      method: 'POST',
      body
    }),

  // 文件夹相关接口
  getFolderList: (params: StorageQueryParams): Promise<FolderDto[]> =>
    request(`${BASE_URL}/folders`, {
      method: 'GET',
      params
    }),
  // 删除文件夹
  deleteFolder: (id: string): Promise<void> =>
    request(`${BASE_URL}/folders/${id}`, {
      method: 'DELETE'
    }),

  createFolder: (body: CreateFolderCommand): Promise<void> =>
    request(`${BASE_URL}/folders`, {
      method: 'POST',
      body
    }),

  renameFolder: (body: RenameFolderCommand): Promise<void> =>
    request(`${BASE_URL}/folders/${body.id}/rename`, {
      method: 'PUT',
      body
    }),
  getFolderTree: (): Promise<FolderTreeDto[]> =>
    request(`${BASE_URL}/folders/tree`, {
      method: 'GET'
    }),

  // 回收站相关接口
  getRecycleList: (params: StorageQueryParams): Promise<FileDto[]> =>
    request(`${BASE_URL}/recycle`, {
      method: 'GET',
      params
    }),

  // 分享相关接口
  getSharedFile: (code: string, password?: string): Promise<FileDto> =>
    request(`${BASE_URL}/share/${code}`, {
      method: 'GET',
      params: { password }
    })
};
