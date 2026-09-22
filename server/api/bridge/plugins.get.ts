import { getPlugins, nuxtPluginInfo, registerNuxtSelf } from '../../utils/pluginRegistry'

export default defineEventHandler(async () => {
  registerNuxtSelf()
  return { plugins: getPlugins(), self: nuxtPluginInfo() }
})