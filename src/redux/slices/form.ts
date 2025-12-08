import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Location {
  city: string
  state: string
  country: string
}

interface SocialLinks {
  linkedin: string
  website?: string
  instagram?: string
  custom?: string
}

interface ContactDetails {
  fullName: string
  email: string
  phone: string
  location: Location
  socialLinks: SocialLinks
}

interface FormState {
  contact: ContactDetails
  languages: {
    items: Array<{
      language: string
      proficiency?: string
    }>
  }
  customSections: { [key: string]: any }
}

const initialState: FormState = {
  contact: {
    fullName: '',
    email: '',
    phone: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    socialLinks: {
      linkedin: '',
      website: '',
      instagram: '',
      custom: ''
    }
  },
  languages: {
    items: []
  },
  customSections: {}
}

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    updateContact: (state, action: PayloadAction<Partial<ContactDetails>>) => {
      state.contact = { ...state.contact, ...action.payload }
    },
    updateLocation: (state, action: PayloadAction<Partial<Location>>) => {
      state.contact.location = { ...state.contact.location, ...action.payload }
    },
    updateSocialLinks: (state, action: PayloadAction<Partial<SocialLinks>>) => {
      state.contact.socialLinks = { ...state.contact.socialLinks, ...action.payload }
    },
    addLanguage: (
      state,
      action: PayloadAction<{ language: string; proficiency?: string }>
    ) => {
      state.languages.items.push(action.payload)
    },
    removeLanguage: (state, action: PayloadAction<number>) => {
      state.languages.items.splice(action.payload, 1)
    },
    updateLanguages: (state, action: PayloadAction<typeof state.languages.items>) => {
      state.languages.items = action.payload
    },
    addCustomSection: (state, action: PayloadAction<{ key: string; value: any }>) => {
      state.customSections[action.payload.key] = action.payload.value
    }
  }
})

export const {
  updateContact,
  updateLocation,
  updateSocialLinks,
  addLanguage,
  removeLanguage,
  updateLanguages,
  addCustomSection
} = formSlice.actions

export default formSlice.reducer
