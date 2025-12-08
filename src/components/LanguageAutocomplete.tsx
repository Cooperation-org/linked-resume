import React, { useState, useEffect } from 'react'
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Chip
} from '@mui/material'
import { SVGSearch } from '../assets/svgs'
import { useDispatch, useSelector } from 'react-redux'
import { updateSection } from '../redux/slices/resume'
import { RootState } from '../redux/store'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

interface LanguageAutocompleteProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  placeholderStyle: any
}

const languages: Language[] = [
  { code: 'ab', name: 'Abkhazian', nativeName: 'Аҧсуа', flag: 'GE' },
  { code: 'aa', name: 'Afar', nativeName: 'Afaraf', flag: 'DJ' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: 'ZA' },
  { code: 'ak', name: 'Akan', nativeName: 'Akan', flag: 'GH' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: 'AL' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: 'ET' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'SA' },
  { code: 'an', name: 'Aragonese', nativeName: 'Aragonés', flag: 'ES' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: 'AM' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: 'IN' },
  { code: 'av', name: 'Avaric', nativeName: 'Авар мацӀ', flag: 'RU' },
  { code: 'ae', name: 'Avestan', nativeName: 'Avesta', flag: 'IR' },
  { code: 'ay', name: 'Aymara', nativeName: 'Aymar aru', flag: 'BO' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan dili', flag: 'AZ' },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan', flag: 'ML' },
  { code: 'ba', name: 'Bashkir', nativeName: 'Башҡорт теле', flag: 'RU' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: 'ES' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: 'BY' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: 'BD' },
  { code: 'bh', name: 'Bihari', nativeName: 'भोजपुरी', flag: 'IN' },
  { code: 'bi', name: 'Bislama', nativeName: 'Bislama', flag: 'VU' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', flag: 'BA' },
  { code: 'br', name: 'Breton', nativeName: 'Brezhoneg', flag: 'FR' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: 'BG' },
  { code: 'my', name: 'Burmese', nativeName: 'ဗမာစာ', flag: 'MM' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: 'ES' },
  { code: 'ch', name: 'Chamorro', nativeName: 'Chamoru', flag: 'GU' },
  { code: 'ce', name: 'Chechen', nativeName: 'Нохчийн мотт', flag: 'RU' },
  { code: 'ny', name: 'Chichewa', nativeName: 'ChiCheŵa', flag: 'MW' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: 'CN' },
  { code: 'cv', name: 'Chuvash', nativeName: 'Чӑваш чӗлхи', flag: 'RU' },
  { code: 'kw', name: 'Cornish', nativeName: 'Kernewek', flag: 'GB' },
  { code: 'co', name: 'Corsican', nativeName: 'Corsu', flag: 'FR' },
  { code: 'cr', name: 'Cree', nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ', flag: 'CA' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: 'HR' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: 'CZ' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: 'DK' },
  { code: 'dv', name: 'Divehi', nativeName: 'ދިވެހި', flag: 'MV' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'NL' },
  { code: 'dz', name: 'Dzongkha', nativeName: 'རྫོང་ཁ', flag: 'BT' },
  { code: 'en', name: 'English', nativeName: 'English', flag: 'GB' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto', flag: 'EU' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: 'EE' },
  { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe', flag: 'GH' },
  { code: 'fo', name: 'Faroese', nativeName: 'Føroyskt', flag: 'FO' },
  { code: 'fj', name: 'Fijian', nativeName: 'Vosa Vakaviti', flag: 'FJ' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: 'FI' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR' },
  { code: 'ff', name: 'Fulah', nativeName: 'Fulfulde', flag: 'SN' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: 'ES' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: 'GE' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: 'GR' },
  { code: 'gn', name: 'Guarani', nativeName: "Avañe'ẽ", flag: 'PY' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: 'IN' },
  { code: 'ht', name: 'Haitian', nativeName: 'Kreyòl ayisyen', flag: 'HT' },
  { code: 'ha', name: 'Hausa', nativeName: 'هَوُسَ', flag: 'NG' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: 'IL' },
  { code: 'hz', name: 'Herero', nativeName: 'Otjiherero', flag: 'NA' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'IN' },
  { code: 'ho', name: 'Hiri Motu', nativeName: 'Hiri Motu', flag: 'PG' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: 'HU' },
  { code: 'ia', name: 'Interlingua', nativeName: 'Interlingua', flag: 'EU' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: 'ID' },
  { code: 'ie', name: 'Interlingue', nativeName: 'Interlingue', flag: 'EU' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', flag: 'IE' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: 'NG' },
  { code: 'ik', name: 'Inupiaq', nativeName: 'Iñupiaq', flag: 'US' },
  { code: 'io', name: 'Ido', nativeName: 'Ido', flag: 'EU' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: 'IS' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT' },
  { code: 'iu', name: 'Inuktitut', nativeName: 'ᐃᓄᒃᑎᑐᑦ', flag: 'CA' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: 'JP' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', flag: 'ID' },
  { code: 'kl', name: 'Kalaallisut', nativeName: 'Kalaallisut', flag: 'GL' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: 'IN' },
  { code: 'kr', name: 'Kanuri', nativeName: 'Kanuri', flag: 'NG' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कश्मीरी', flag: 'IN' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі', flag: 'KZ' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: 'KH' },
  { code: 'ki', name: 'Kikuyu', nativeName: 'Gĩkũyũ', flag: 'KE' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: 'RW' },
  { code: 'ky', name: 'Kirghiz', nativeName: 'кыргыз тили', flag: 'KG' },
  { code: 'kv', name: 'Komi', nativeName: 'коми кыв', flag: 'RU' },
  { code: 'kg', name: 'Kongo', nativeName: 'KiKongo', flag: 'CD' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'KR' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', flag: 'IQ' },
  { code: 'kj', name: 'Kwanyama', nativeName: 'Kuanyama', flag: 'NA' },
  { code: 'la', name: 'Latin', nativeName: 'Latine', flag: 'VA' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', flag: 'LU' },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda', flag: 'UG' },
  { code: 'li', name: 'Limburgish', nativeName: 'Limburgs', flag: 'NL' },
  { code: 'ln', name: 'Lingala', nativeName: 'Lingála', flag: 'CD' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', flag: 'LA' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių kalba', flag: 'LT' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu valoda', flag: 'LV' },
  { code: 'gv', name: 'Manx', nativeName: 'Gaelg', flag: 'IM' },
  { code: 'mk', name: 'Macedonian', nativeName: 'македонски јазик', flag: 'MK' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy fiteny', flag: 'MG' },
  { code: 'ms', name: 'Malay', nativeName: 'بهاس ملايو', flag: 'MY' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: 'IN' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: 'MT' },
  { code: 'mi', name: 'Māori', nativeName: 'Te reo Māori', flag: 'NZ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: 'IN' },
  { code: 'mh', name: 'Marshallese', nativeName: 'Kajin M̧ajeļ', flag: 'MH' },
  { code: 'mn', name: 'Mongolian', nativeName: 'монгол', flag: 'MN' },
  { code: 'na', name: 'Nauru', nativeName: 'Ekakairũ Naoero', flag: 'NR' },
  { code: 'nv', name: 'Navajo', nativeName: 'Diné bizaad', flag: 'US' },
  { code: 'nb', name: 'Norwegian Bokmål', nativeName: 'Norsk bokmål', flag: 'NO' },
  { code: 'nd', name: 'North Ndebele', nativeName: 'isiNdebele', flag: 'ZW' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: 'NP' },
  { code: 'ng', name: 'Ndonga', nativeName: 'Owambo', flag: 'NA' },
  { code: 'nn', name: 'Norwegian Nynorsk', nativeName: 'Norsk nynorsk', flag: 'NO' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: 'NO' },
  { code: 'ii', name: 'Nuosu', nativeName: 'ꆈꌠ꒿ Nuosuhxop', flag: 'CN' },
  { code: 'nr', name: 'South Ndebele', nativeName: 'isiNdebele', flag: 'ZA' },
  { code: 'oc', name: 'Occitan', nativeName: 'Occitan', flag: 'FR' },
  { code: 'oj', name: 'Ojibwe', nativeName: 'ᐊᓂᔑᓈᐯᒧᐎᓐ', flag: 'CA' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', flag: 'ET' },
  { code: 'or', name: 'Oriya', nativeName: 'ଓଡ଼ିଆ', flag: 'IN' },
  { code: 'os', name: 'Ossetian', nativeName: 'ирон æвзаг', flag: 'GE' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: 'IN' },
  { code: 'pi', name: 'Pāli', nativeName: 'पाऴि', flag: 'IN' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: 'IR' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: 'PL' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', flag: 'AF' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'PT' },
  { code: 'qu', name: 'Quechua', nativeName: 'Runa Simi', flag: 'PE' },
  { code: 'rm', name: 'Romansh', nativeName: 'Rumantsch grischun', flag: 'CH' },
  { code: 'rn', name: 'Kirundi', nativeName: 'KiRundi', flag: 'BI' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: 'RO' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: 'IN' },
  { code: 'sc', name: 'Sardinian', nativeName: 'Sardu', flag: 'IT' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी', flag: 'PK' },
  { code: 'se', name: 'Northern Sami', nativeName: 'Davvisámegiella', flag: 'NO' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana faa Samoa', flag: 'WS' },
  { code: 'sg', name: 'Sango', nativeName: 'Yângâ tî sängö', flag: 'CF' },
  { code: 'sr', name: 'Serbian', nativeName: 'српски језик', flag: 'RS' },
  { code: 'gd', name: 'Gaelic', nativeName: 'Gàidhlig', flag: 'GB' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', flag: 'ZW' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: 'LK' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: 'SK' },
  { code: 'sl', name: 'Slovene', nativeName: 'Slovenščina', flag: 'SI' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaaliga', flag: 'SO' },
  { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho', flag: 'LS' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', flag: 'ID' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: 'TZ' },
  { code: 'ss', name: 'Swati', nativeName: 'SiSwati', flag: 'SZ' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: 'SE' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: 'IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: 'IN' },
  { code: 'tg', name: 'Tajik', nativeName: 'тоҷикӣ', flag: 'TJ' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: 'TH' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: 'ER' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་ཡིག', flag: 'CN' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmen', flag: 'TM' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Wikang Tagalog', flag: 'PH' },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', flag: 'BW' },
  { code: 'to', name: 'Tonga', nativeName: 'Faka Tonga', flag: 'TO' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'TR' },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', flag: 'ZA' },
  { code: 'tt', name: 'Tatar', nativeName: 'татарча', flag: 'RU' },
  { code: 'tw', name: 'Twi', nativeName: 'Twi', flag: 'GH' },
  { code: 'ty', name: 'Tahitian', nativeName: 'Reo Tahiti', flag: 'PF' },
  { code: 'ug', name: 'Uighur', nativeName: 'Uyƣurqə', flag: 'CN' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: 'UA' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: 'PK' },
  { code: 'uz', name: 'Uzbek', nativeName: 'zbek', flag: 'UZ' },
  { code: 've', name: 'Venda', nativeName: 'Tshivenḓa', flag: 'ZA' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: 'VN' },
  { code: 'vo', name: 'Volapük', nativeName: 'Volapük', flag: 'EU' },
  { code: 'wa', name: 'Walloon', nativeName: 'Walon', flag: 'BE' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: 'GB' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wollof', flag: 'SN' },
  { code: 'fy', name: 'Western Frisian', nativeName: 'Frysk', flag: 'NL' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: 'ZA' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', flag: 'IL' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: 'NG' },
  { code: 'za', name: 'Zhuang', nativeName: 'Saɯ cueŋƅ', flag: 'CN' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: 'ZA' }
]

const LanguageAutocomplete: React.FC<LanguageAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Which languages do you speak?',
  placeholderStyle
}) => {
  const [inputValue, setInputValue] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([])

  useEffect(() => {
    const mappedLanguages = value
      .filter(langName => langName !== undefined)
      .map(langName => {
        const foundLang = languages.find(
          lang => lang.name.toLowerCase() === langName.toLowerCase()
        )

        return (
          foundLang || {
            code: langName.toLowerCase().slice(0, 2),
            name: langName,
            nativeName: langName,
            flag: 'UN'
          }
        )
      })

    setSelectedLanguages(mappedLanguages)
  }, [value])

  const handleChange = (_: React.SyntheticEvent, newValue: Language[]) => {
    setSelectedLanguages(newValue)

    const languageNames = newValue.map(lang => lang.name)
    onChange(languageNames)
  }

  return (
    <Box>
      <Autocomplete
        multiple
        id='language-selector'
        options={languages.sort((a, b) => a.name.localeCompare(b.name))}
        value={selectedLanguages}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(_, newValue) => setInputValue(newValue)}
        getOptionLabel={option => option.name}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        renderOption={(props, option) => (
          <Box component='li' sx={{ '& > img': { flexShrink: 0 } }} {...props}>
            <img
              loading='lazy'
              width='20'
              src={`https://flagcdn.com/w20/${option.flag.toLowerCase()}.png`}
              srcSet={`https://flagcdn.com/w40/${option.flag.toLowerCase()}.png 2x`}
              alt='{option.name} flag'
              style={{ marginRight: 8 }}
            />
            <Typography variant='body2'>
              {option.name} ({option.nativeName})
            </Typography>
          </Box>
        )}
        renderInput={params => (
          <TextField
            {...params}
            placeholder={placeholder}
            size='small'
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment
                    sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
                    position='end'
                  >
                    <SVGSearch />
                  </InputAdornment>
                </>
              )
            }}
            sx={{
              bgcolor: '#F3F5F8',
              borderRadius: '3px',
              '& .MuiInputBase-input': {
                fontFamily: 'Nunito Sans'
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' }
              },
              ...placeholderStyle
            }}
          />
        )}
        renderTags={(tagValue, getTagProps) => null}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 1
        }}
      >
        {selectedLanguages.map((option, index) => (
          <Chip
            key={option.code}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={`https://flagcdn.com/w20/${option.flag.toLowerCase()}.png`}
                  alt=''
                  style={{ width: 16, marginRight: 4 }}
                />
                <span>{option.name}</span>
              </Box>
            }
            onDelete={() => {
              const newLanguages = [...selectedLanguages]
              newLanguages.splice(index, 1)
              setSelectedLanguages(newLanguages)
              onChange(newLanguages.map(lang => lang.name))
            }}
            sx={{
              borderRadius: '16px',
              bgcolor: '#E2E6EE',
              fontFamily: 'Nunito Sans',
              fontSize: '14px'
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

const LanguageField: React.FC = () => {
  const dispatch = useDispatch()
  const resume = useSelector((state: RootState) => state.resume.resume)

  const placeholderStyle = {
    '& .MuiInputBase-input::placeholder': {
      color: 'var(--neutral-light-n-100, #7A869A)',
      fontFamily: 'Nunito Sans',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
      opacity: 1
    }
  }

  const handleLanguageChange = (newLanguages: string[]) => {
    if (!resume) return

    dispatch(
      updateSection({
        sectionId: 'languages',
        content: {
          items: newLanguages.map(name => ({ name }))
        }
      })
    )
  }

  return (
    <LanguageAutocomplete
      value={
        resume?.languages?.items
          ?.filter(lang => lang?.name !== undefined)
          ?.map(lang => lang.name) || []
      }
      onChange={handleLanguageChange}
      placeholderStyle={placeholderStyle}
    />
  )
}

export default LanguageField
