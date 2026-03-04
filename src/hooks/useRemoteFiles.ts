import { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import useGoogleDrive, { DriveFileMeta } from './useGoogleDrive'
import StorageService from '../storage-singlton'
import { FileItem } from '../components/ResumeEditor/types/section.types'

function getDriveUrl(id: string): string {
  return `https://drive.google.com/uc?export=view&id=${id}`
}

interface UseRemoteFilesReturn {
  remoteFiles: DriveFileMeta[]
  reloadRemoteFiles: () => Promise<void>
  getAllFiles: () => FileItem[]
}

/**
 * Manages fetching file metadata from Google Drive and merging them
 * with locally-uploaded files into a single combined list.
 */
export function useRemoteFiles(localFiles: FileItem[]): UseRemoteFilesReturn {
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const { listFilesMetadata } = useGoogleDrive()
  const [remoteFiles, setRemoteFiles] = useState<DriveFileMeta[]>([])

  const reloadRemoteFiles = useCallback(async () => {
    if (!accessToken) return
    try {
      const storageService = StorageService.getInstance()
      storageService.initialize(accessToken)
      const fetched = await storageService.handleApiCall(async () => {
        const storage = storageService.getStorage()
        const folderId = await storage.getMediaFolderId()
        return await listFilesMetadata(folderId)
      })
      setRemoteFiles(fetched)
    } catch (error) {
      console.error('Error fetching remote files:', error)
      setRemoteFiles([])
    }
  }, [accessToken, listFilesMetadata])

  // Auto-reload when access token becomes available
  useEffect(() => {
    if (accessToken) reloadRemoteFiles()
  }, [accessToken, reloadRemoteFiles])

  const getAllFiles = useCallback((): FileItem[] => {
    const convertedRemoteFiles: FileItem[] = remoteFiles.map(rf => ({
      id: rf.id,
      file: new File([], rf.name),
      name: rf.name,
      url: getDriveUrl(rf.id),
      uploaded: true,
      fileExtension: rf.name.split('.').pop() ?? '',
      googleId: rf.id
    }))
    return [...localFiles, ...convertedRemoteFiles]
  }, [localFiles, remoteFiles])

  return { remoteFiles, reloadRemoteFiles, getAllFiles }
}
