// storage-singleton.ts
import { GoogleDriveStorage, Resume, ResumeVC } from '@cooperation/vc-storage'
import { refreshAccessToken, logout } from './tools/auth'
import { getLocalStorage } from './tools/cookie'

// Singleton class to maintain storage instances
class StorageService {
  private static instance: StorageService
  private storage: GoogleDriveStorage | null = null
  private resumeManager: Resume | null = null
  private resumeVC: ResumeVC | null = null
  private token: string | null = null
  private onTokenUpdate?: (token: string) => void

  private constructor() {}

  // Static method to get the singleton instance
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  // Set the token update callback
  public setTokenUpdateCallback(callback: (token: string) => void): void {
    this.onTokenUpdate = callback
  }

  // Initialize or update with token
  public initialize(accessToken: string): void {
    // Only initialize if token is different or instances don't exist
    if (this.token !== accessToken || !this.storage || !this.resumeManager) {
      this.token = accessToken
      this.storage = new GoogleDriveStorage(accessToken)
      this.resumeManager = new Resume(this.storage)
      this.resumeVC = new ResumeVC()
    }
  }

  public async refreshAndReinitialize(): Promise<void> {
    try {
      const newToken = await refreshAccessToken(undefined, this.onTokenUpdate)
      this.initialize(newToken)
    } catch (error) {
      console.error('Failed to refresh token and re-initialize storage:', error)
      logout()
      throw error
    }
  }

  public async handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall()
    } catch (error: any) {
      if (
        error?.message?.includes('401') ||
        error?.message?.includes('Invalid Credentials') ||
        error?.message?.includes('authentication')
      ) {
        await this.refreshAndReinitialize()

        return await apiCall()
      }

      throw error
    }
  }

  // Getters with automatic token refresh on auth errors
  public getStorage(): GoogleDriveStorage {
    if (!this.storage) {
      const token = getLocalStorage('auth')
      if (token) {
        this.initialize(token)
      } else {
        throw new Error('No access token available. Please log in.')
      }
    }
    return this.storage!
  }

  public getResumeManager(): Resume {
    if (!this.resumeManager) {
      const token = getLocalStorage('auth')
      if (token) {
        this.initialize(token)
      } else {
        throw new Error('No access token available. Please log in.')
      }
    }
    return this.resumeManager!
  }

  public getResumeVC(): ResumeVC {
    if (!this.resumeVC) {
      this.resumeVC = new ResumeVC()
    }
    return this.resumeVC
  }

  // Check if initialized
  public isInitialized(): boolean {
    return !!this.storage && !!this.resumeManager
  }
}

export default StorageService
