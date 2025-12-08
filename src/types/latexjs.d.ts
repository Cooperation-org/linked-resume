declare module 'latex.js' {
  interface HtmlGeneratorOptions {
    hyphenate?: boolean
    languagePatterns?: unknown
    documentClass?: string
    CustomMacros?: Record<string, unknown>
    styles?: string[]
  }

  class HtmlGenerator {
    constructor(options?: HtmlGeneratorOptions)
    domFragment(): DocumentFragment
    htmlDocument(baseURL?: string | null): Document
  }

  function parse(
    input: string,
    options?: {
      generator?: HtmlGenerator
    }
  ): HtmlGenerator

  const he: {
    encode: (value: string, options?: Record<string, unknown>) => string
  }

  export { HtmlGenerator, HtmlGeneratorOptions, parse, he }
}
