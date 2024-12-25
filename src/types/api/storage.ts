// 文件DTO
export interface FileDto {
  id: string;
  name: string;
  type: string;
  size: number;
  storageType: string;
  path: string;
  url: string;
  folderId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// 文件夹DTO
export interface FolderDto {
  id: string;
  name: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

// 文件夹树形结构DTO
export interface FolderTreeDto {
  id: string;
  name: string;
  parentId: string;
  path: string;
  createdBy: string;
  createdAt: number;
  children: FolderTreeDto[];
}

// 文件分享DTO
export interface FileShareDto {
  code: string;
  password?: string;
  expireTime?: string;
  url: string;
}

// 查询参数
export interface StorageQueryParams {
  current: number;
  size: number;
  folderId?: string;
  parentId?: string;
  name?: string;
  type?: string;
  storageType?: string;
}

// 批量操作命令
export interface BatchOperationCommand {
  ids: string[];
  targetFolderId?: string;
}

// 创建文件夹命令
export interface CreateFolderCommand {
  name: string;
  parentId?: string;
}
// 重命名
export interface RenameFolderCommand {
  name: string;
  id?: string;
}

// 分享文件命令
export interface ShareFileCommand {
  password?: string;
  expireTime?: string;
}
