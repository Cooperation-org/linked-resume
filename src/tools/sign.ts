// import { GoogleDriveStorage, Resume, ResumeVC } from '@cooperation/vc-storage'

const signResume = async ({
  resume,
  accessToken
}: {
  resume: Resume
  accessToken: string
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let keyPair

  // const storage = new GoogleDriveStorage(accessToken)
  // const resumeManager = new Resume(storage)
  // const resumeVC = new ResumeVC()

  //   const keyPairs = (await storage.getAllFilesByType('KEYPAIRs')) as unknown as {
  //     data: any
  //   }[]
  //   if (keyPairs.length === 0) {
  //     console.log('No keypairs found, generating a new one...')
  //     keyPair = await resumeVC.generateKeyPair()
  //     const authorId = await resumeManager.getOrCreateFolder('RESUMES_AUTHOR', 'root')
  //     const keypairsFolderId = await resumeManager.getOrCreateFolder('KEYPAIRs', authorId)
  //     await storage.saveFile({
  //       folderId: keypairsFolderId.id,
  //       data: { ...keyPair, fileName: 'KEYPAIR1' }
  //     })
  //   } else {
  //     console.log('Keypairs found, using the first one...')
  //     keyPair = keyPairs[0].data
  //   }

  //   try {
  //     const didDoc = await resumeVC.createDID({
  //       keyPair
  //     })
  //     // Save the resume
  //     const signedResume = await resumeVC.sign({
  //       formData: resume,
  //       issuerDid: didDoc.id,
  //       keyPair
  //     })
  //     console.log('🚀 ~ main ~ signedResume:', signedResume)
  //     const savedResume = await resumeManager.saveResume({
  //       resume: resume,
  //       type: 'unsigned'
  //     })
  //     console.log('Resume saved successfully UNSGINED:', savedResume)
  //     const savedSResume = await resumeManager.saveResume({
  //       resume: resume,
  //       type: 'sign'
  //     })
  //     console.log('Resume saved successfully SIGNED:', savedSResume)
  //   } catch (error: any) {
  //     console.error('Error saving resume:', error.message)
  //   }
}

export default signResume
