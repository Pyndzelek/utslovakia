// Design-sync stub: next-intl reading straight from the English message file.
import messages from '../../../src/messages/en.json'

export function useLocale() {
  return 'en'
}

export function useTranslations(namespace?: string) {
  return (key: string) => {
    const path = [...(namespace ? namespace.split('.') : []), ...key.split('.')]
    let node: unknown = messages
    for (const part of path) node = (node as Record<string, unknown> | undefined)?.[part]
    return typeof node === 'string' ? node : path.join('.')
  }
}
