declare global {
  const ALL_PERMISSIONS_MASK: typeof import('../../server/utils/permissions').ALL_PERMISSIONS_MASK
  const BADGE_ASSIGNMENTS: typeof import('../../server/utils/userExtras').BADGE_ASSIGNMENTS
  const H3Error: typeof import('../../node_modules/h3').H3Error
  const H3Event: typeof import('../../node_modules/h3').H3Event
  const MAX_MESSAGE_LENGTH: typeof import('../../server/utils/rateLimit').MAX_MESSAGE_LENGTH
  const NUXT_PLUGIN_ID: typeof import('../../server/utils/pluginRegistry').NUXT_PLUGIN_ID
  const PERMISSIONS: typeof import('../../server/utils/permissions').PERMISSIONS
  const PERMISSION_GROUPS: typeof import('../../server/utils/permissions').PERMISSION_GROUPS
  const __buildAssetsURL: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/paths').buildAssetsURL
  const __publicAssetsURL: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/paths').publicAssetsURL
  const appendCorsHeaders: typeof import('../../node_modules/h3').appendCorsHeaders
  const appendCorsPreflightHeaders: typeof import('../../node_modules/h3').appendCorsPreflightHeaders
  const appendHeader: typeof import('../../node_modules/h3').appendHeader
  const appendHeaders: typeof import('../../node_modules/h3').appendHeaders
  const appendResponseHeader: typeof import('../../node_modules/h3').appendResponseHeader
  const appendResponseHeaders: typeof import('../../node_modules/h3').appendResponseHeaders
  const assertMethod: typeof import('../../node_modules/h3').assertMethod
  const broadcast: typeof import('../../server/utils/realtime').broadcast
  const broadcastToUsers: typeof import('../../server/utils/realtime').broadcastToUsers
  const cachedEventHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').cachedEventHandler
  const cachedFunction: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').cachedFunction
  const callNodeListener: typeof import('../../node_modules/h3').callNodeListener
  const checkMessageFlood: typeof import('../../server/utils/rateLimit').checkMessageFlood
  const clearAuthCookie: typeof import('../../server/utils/auth').clearAuthCookie
  const clearResponseHeaders: typeof import('../../node_modules/h3').clearResponseHeaders
  const clearSession: typeof import('../../node_modules/h3').clearSession
  const computeTitles: typeof import('../../server/utils/userExtras').computeTitles
  const configBadges: typeof import('../../server/utils/userExtras').configBadges
  const createApp: typeof import('../../node_modules/h3').createApp
  const createAppEventHandler: typeof import('../../node_modules/h3').createAppEventHandler
  const createError: typeof import('../../node_modules/h3').createError
  const createEvent: typeof import('../../node_modules/h3').createEvent
  const createEventStream: typeof import('../../node_modules/h3').createEventStream
  const createRouter: typeof import('../../node_modules/h3').createRouter
  const createSession: typeof import('../../server/utils/auth').createSession
  const createToken: typeof import('../../server/utils/auth').createToken
  const defaultContentType: typeof import('../../node_modules/h3').defaultContentType
  const defineAppConfig: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/config').defineAppConfig
  const defineCachedEventHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').defineCachedEventHandler
  const defineCachedFunction: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').defineCachedFunction
  const defineEventHandler: typeof import('../../node_modules/h3').defineEventHandler
  const defineLazyEventHandler: typeof import('../../node_modules/h3').defineLazyEventHandler
  const defineNitroErrorHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/error/utils').defineNitroErrorHandler
  const defineNitroPlugin: typeof import('../../node_modules/nitropack/dist/runtime/internal/plugin').defineNitroPlugin
  const defineNodeListener: typeof import('../../node_modules/h3').defineNodeListener
  const defineNodeMiddleware: typeof import('../../node_modules/h3').defineNodeMiddleware
  const defineRenderHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/renderer').defineRenderHandler
  const defineRequestMiddleware: typeof import('../../node_modules/h3').defineRequestMiddleware
  const defineResponseMiddleware: typeof import('../../node_modules/h3').defineResponseMiddleware
  const defineRouteMeta: typeof import('../../node_modules/nitropack/dist/runtime/internal/meta').defineRouteMeta
  const defineTask: typeof import('../../node_modules/nitropack/dist/runtime/internal/task').defineTask
  const defineWebSocket: typeof import('../../node_modules/h3').defineWebSocket
  const defineWebSocketHandler: typeof import('../../node_modules/h3').defineWebSocketHandler
  const deleteCookie: typeof import('../../node_modules/h3').deleteCookie
  const dynamicEventHandler: typeof import('../../node_modules/h3').dynamicEventHandler
  const emit: typeof import('../../server/utils/eventBus').emit
  const enrichUsers: typeof import('../../server/utils/userExtras').enrichUsers
  const ensureDir: typeof import('../../server/utils/upload').ensureDir
  const eventHandler: typeof import('../../node_modules/h3').eventHandler
  const fetchWithEvent: typeof import('../../node_modules/h3').fetchWithEvent
  const fromNodeMiddleware: typeof import('../../node_modules/h3').fromNodeMiddleware
  const fromPlainHandler: typeof import('../../node_modules/h3').fromPlainHandler
  const fromWebHandler: typeof import('../../node_modules/h3').fromWebHandler
  const getCookie: typeof import('../../node_modules/h3').getCookie
  const getCurrentUser: typeof import('../../server/utils/auth').getCurrentUser
  const getHeader: typeof import('../../node_modules/h3').getHeader
  const getHeaders: typeof import('../../node_modules/h3').getHeaders
  const getMethod: typeof import('../../node_modules/h3').getMethod
  const getPlugins: typeof import('../../server/utils/pluginRegistry').getPlugins
  const getProxyRequestHeaders: typeof import('../../node_modules/h3').getProxyRequestHeaders
  const getQuery: typeof import('../../node_modules/h3').getQuery
  const getRequestFingerprint: typeof import('../../node_modules/h3').getRequestFingerprint
  const getRequestHeader: typeof import('../../node_modules/h3').getRequestHeader
  const getRequestHeaders: typeof import('../../node_modules/h3').getRequestHeaders
  const getRequestHost: typeof import('../../node_modules/h3').getRequestHost
  const getRequestIP: typeof import('../../node_modules/h3').getRequestIP
  const getRequestPath: typeof import('../../node_modules/h3').getRequestPath
  const getRequestProtocol: typeof import('../../node_modules/h3').getRequestProtocol
  const getRequestURL: typeof import('../../node_modules/h3').getRequestURL
  const getRequestWebStream: typeof import('../../node_modules/h3').getRequestWebStream
  const getResponseHeader: typeof import('../../node_modules/h3').getResponseHeader
  const getResponseHeaders: typeof import('../../node_modules/h3').getResponseHeaders
  const getResponseStatus: typeof import('../../node_modules/h3').getResponseStatus
  const getResponseStatusText: typeof import('../../node_modules/h3').getResponseStatusText
  const getRoomMembers: typeof import('../../server/utils/voice').getRoomMembers
  const getRouteRules: typeof import('../../node_modules/nitropack/dist/runtime/internal/route-rules').getRouteRules
  const getRouterParam: typeof import('../../node_modules/h3').getRouterParam
  const getRouterParams: typeof import('../../node_modules/h3').getRouterParams
  const getServerContext: typeof import('../../server/utils/serverAuth').getServerContext
  const getSession: typeof import('../../node_modules/h3').getSession
  const getValidatedQuery: typeof import('../../node_modules/h3').getValidatedQuery
  const getValidatedRouterParams: typeof import('../../node_modules/h3').getValidatedRouterParams
  const handleCacheHeaders: typeof import('../../node_modules/h3').handleCacheHeaders
  const handleCors: typeof import('../../node_modules/h3').handleCors
  const hasAdministrator: typeof import('../../server/utils/permissions').hasAdministrator
  const hasPermission: typeof import('../../server/utils/permissions').hasPermission
  const hasPlugin: typeof import('../../server/utils/pluginRegistry').hasPlugin
  const hashPassword: typeof import('../../server/utils/auth').hashPassword
  const isCorsOriginAllowed: typeof import('../../node_modules/h3').isCorsOriginAllowed
  const isError: typeof import('../../node_modules/h3').isError
  const isEvent: typeof import('../../node_modules/h3').isEvent
  const isEventHandler: typeof import('../../node_modules/h3').isEventHandler
  const isInRoom: typeof import('../../server/utils/voice').isInRoom
  const isMethod: typeof import('../../node_modules/h3').isMethod
  const isPreflightRequest: typeof import('../../node_modules/h3').isPreflightRequest
  const isServerMember: typeof import('../../server/utils/serverAuth').isServerMember
  const isStream: typeof import('../../node_modules/h3').isStream
  const isWebResponse: typeof import('../../node_modules/h3').isWebResponse
  const joinRoom: typeof import('../../server/utils/voice').joinRoom
  const lazyEventHandler: typeof import('../../node_modules/h3').lazyEventHandler
  const leaveRoom: typeof import('../../server/utils/voice').leaveRoom
  const nitroPlugin: typeof import('../../node_modules/nitropack/dist/runtime/internal/plugin').nitroPlugin
  const normalizeAttachments: typeof import('../../server/utils/attachments').normalizeAttachments
  const normalizePhpResult: typeof import('../../server/utils/phpBridge').normalizePhpResult
  const nuxtPluginInfo: typeof import('../../server/utils/pluginRegistry').nuxtPluginInfo
  const on: typeof import('../../server/utils/eventBus').on
  const parseAttachments: typeof import('../../server/utils/attachments').parseAttachments
  const parseCookies: typeof import('../../node_modules/h3').parseCookies
  const permissionLabel: typeof import('../../server/utils/permissions').permissionLabel
  const phpBridgeConfig: typeof import('../../server/utils/phpBridge').phpBridgeConfig
  const phpCall: typeof import('../../server/utils/phpBridge').phpCall
  const pickTitle: typeof import('../../server/utils/userExtras').pickTitle
  const promisifyNodeListener: typeof import('../../node_modules/h3').promisifyNodeListener
  const proxyRequest: typeof import('../../node_modules/h3').proxyRequest
  const publicUser: typeof import('../../server/utils/userExtras').publicUser
  const readBody: typeof import('../../node_modules/h3').readBody
  const readFormData: typeof import('../../node_modules/h3').readFormData
  const readMultipartFormData: typeof import('../../node_modules/h3').readMultipartFormData
  const readRawBody: typeof import('../../node_modules/h3').readRawBody
  const readValidatedBody: typeof import('../../node_modules/h3').readValidatedBody
  const registerNuxtSelf: typeof import('../../server/utils/pluginRegistry').registerNuxtSelf
  const registerPlugin: typeof import('../../server/utils/pluginRegistry').registerPlugin
  const relaySignal: typeof import('../../server/utils/voice').relaySignal
  const removeResponseHeader: typeof import('../../node_modules/h3').removeResponseHeader
  const renewAuthCookie: typeof import('../../server/utils/auth').renewAuthCookie
  const requireAuth: typeof import('../../server/utils/auth').requireAuth
  const requireServerMember: typeof import('../../server/utils/serverAuth').requireServerMember
  const requireServerOwner: typeof import('../../server/utils/serverAuth').requireServerOwner
  const requireServerPermission: typeof import('../../server/utils/serverAuth').requireServerPermission
  const rolePermissionsMask: typeof import('../../server/utils/serverAuth').rolePermissionsMask
  const runTask: typeof import('../../node_modules/nitropack/dist/runtime/internal/task').runTask
  const sanitizeStatusCode: typeof import('../../node_modules/h3').sanitizeStatusCode
  const sanitizeStatusMessage: typeof import('../../node_modules/h3').sanitizeStatusMessage
  const saveAvatar: typeof import('../../server/utils/upload').saveAvatar
  const saveCover: typeof import('../../server/utils/upload').saveCover
  const saveEmoji: typeof import('../../server/utils/upload').saveEmoji
  const saveFile: typeof import('../../server/utils/upload').saveFile
  const saveFileWithWatermark: typeof import('../../server/utils/upload').saveFileWithWatermark
  const sealSession: typeof import('../../node_modules/h3').sealSession
  const send: typeof import('../../node_modules/h3').send
  const sendError: typeof import('../../node_modules/h3').sendError
  const sendIterable: typeof import('../../node_modules/h3').sendIterable
  const sendNoContent: typeof import('../../node_modules/h3').sendNoContent
  const sendProxy: typeof import('../../node_modules/h3').sendProxy
  const sendRedirect: typeof import('../../node_modules/h3').sendRedirect
  const sendStream: typeof import('../../node_modules/h3').sendStream
  const sendWebResponse: typeof import('../../node_modules/h3').sendWebResponse
  const serializePosts: typeof import('../../server/utils/postQuery').serializePosts
  const serveStatic: typeof import('../../node_modules/h3').serveStatic
  const setAuthCookie: typeof import('../../server/utils/auth').setAuthCookie
  const setCookie: typeof import('../../node_modules/h3').setCookie
  const setHeader: typeof import('../../node_modules/h3').setHeader
  const setHeaders: typeof import('../../node_modules/h3').setHeaders
  const setResponseHeader: typeof import('../../node_modules/h3').setResponseHeader
  const setResponseHeaders: typeof import('../../node_modules/h3').setResponseHeaders
  const setResponseStatus: typeof import('../../node_modules/h3').setResponseStatus
  const splitCookiesString: typeof import('../../node_modules/h3').splitCookiesString
  const subscribeRealtime: typeof import('../../server/utils/realtime').subscribeRealtime
  const toEventHandler: typeof import('../../node_modules/h3').toEventHandler
  const toNodeListener: typeof import('../../node_modules/h3').toNodeListener
  const toPlainHandler: typeof import('../../node_modules/h3').toPlainHandler
  const toWebHandler: typeof import('../../node_modules/h3').toWebHandler
  const toWebRequest: typeof import('../../node_modules/h3').toWebRequest
  const unregisterPlugin: typeof import('../../server/utils/pluginRegistry').unregisterPlugin
  const unsealSession: typeof import('../../node_modules/h3').unsealSession
  const unsubscribeRealtime: typeof import('../../server/utils/realtime').unsubscribeRealtime
  const updateSession: typeof import('../../node_modules/h3').updateSession
  const urlToFilePath: typeof import('../../server/utils/upload').urlToFilePath
  const useAppConfig: typeof import('../../node_modules/nitropack/dist/runtime/internal/config').useAppConfig
  const useBase: typeof import('../../node_modules/h3').useBase
  const useEvent: typeof import('../../node_modules/nitropack/dist/runtime/internal/context').useEvent
  const useNitroApp: typeof import('../../node_modules/nitropack/dist/runtime/internal/app').useNitroApp
  const useRuntimeConfig: typeof import('../../node_modules/nitropack/dist/runtime/internal/config').useRuntimeConfig
  const useSession: typeof import('../../node_modules/h3').useSession
  const useStorage: typeof import('../../node_modules/nitropack/dist/runtime/internal/storage').useStorage
  const validateEmojiFile: typeof import('../../server/utils/upload').validateEmojiFile
  const validateFile: typeof import('../../server/utils/upload').validateFile
  const validateMessageContent: typeof import('../../server/utils/rateLimit').validateMessageContent
  const verifyPassword: typeof import('../../server/utils/auth').verifyPassword
  const verifyToken: typeof import('../../server/utils/auth').verifyToken
  const writeEarlyHints: typeof import('../../node_modules/h3').writeEarlyHints
}
// for type re-export
declare global {
  // @ts-ignore
  export type { EventHandler, EventHandlerRequest, EventHandlerResponse, EventHandlerObject, H3EventContext } from '../../node_modules/h3'
  import('../../node_modules/h3')
  // @ts-ignore
  export type { StoredAttachment } from '../../server/utils/attachments'
  import('../../server/utils/attachments')
  // @ts-ignore
  export type { JwtPayload } from '../../server/utils/auth'
  import('../../server/utils/auth')
  // @ts-ignore
  export type { PermissionKey } from '../../server/utils/permissions'
  import('../../server/utils/permissions')
  // @ts-ignore
  export type { PhpBridgeConfig, PhpCallResult } from '../../server/utils/phpBridge'
  import('../../server/utils/phpBridge')
  // @ts-ignore
  export type { PluginInfo } from '../../server/utils/pluginRegistry'
  import('../../server/utils/pluginRegistry')
  // @ts-ignore
  export type { ReactionSummary } from '../../server/utils/postQuery'
  import('../../server/utils/postQuery')
  // @ts-ignore
  export type { ServerContext } from '../../server/utils/serverAuth'
  import('../../server/utils/serverAuth')
  // @ts-ignore
  export type { PublicBadge, UserExtras } from '../../server/utils/userExtras'
  import('../../server/utils/userExtras')
  // @ts-ignore
  export type { VoiceMember } from '../../server/utils/voice'
  import('../../server/utils/voice')
}
export { H3Event, H3Error, appendCorsHeaders, appendCorsPreflightHeaders, appendHeader, appendHeaders, appendResponseHeader, appendResponseHeaders, assertMethod, callNodeListener, clearResponseHeaders, clearSession, createApp, createAppEventHandler, createError, createEvent, createEventStream, createRouter, defaultContentType, defineEventHandler, defineLazyEventHandler, defineNodeListener, defineNodeMiddleware, defineRequestMiddleware, defineResponseMiddleware, defineWebSocket, defineWebSocketHandler, deleteCookie, dynamicEventHandler, eventHandler, fetchWithEvent, fromNodeMiddleware, fromPlainHandler, fromWebHandler, getCookie, getHeader, getHeaders, getMethod, getProxyRequestHeaders, getQuery, getRequestFingerprint, getRequestHeader, getRequestHeaders, getRequestHost, getRequestIP, getRequestPath, getRequestProtocol, getRequestURL, getRequestWebStream, getResponseHeader, getResponseHeaders, getResponseStatus, getResponseStatusText, getRouterParam, getRouterParams, getSession, getValidatedQuery, getValidatedRouterParams, handleCacheHeaders, handleCors, isCorsOriginAllowed, isError, isEvent, isEventHandler, isMethod, isPreflightRequest, isStream, isWebResponse, lazyEventHandler, parseCookies, promisifyNodeListener, proxyRequest, readBody, readFormData, readMultipartFormData, readRawBody, readValidatedBody, removeResponseHeader, sanitizeStatusCode, sanitizeStatusMessage, sealSession, send, sendError, sendIterable, sendNoContent, sendProxy, sendRedirect, sendStream, sendWebResponse, serveStatic, setCookie, setHeader, setHeaders, setResponseHeader, setResponseHeaders, setResponseStatus, splitCookiesString, toEventHandler, toNodeListener, toPlainHandler, toWebHandler, toWebRequest, unsealSession, updateSession, useBase, useSession, writeEarlyHints } from 'h3';
export { useNitroApp } from 'nitropack/runtime/internal/app';
export { useRuntimeConfig, useAppConfig } from 'nitropack/runtime/internal/config';
export { defineNitroPlugin, nitroPlugin } from 'nitropack/runtime/internal/plugin';
export { defineCachedFunction, defineCachedEventHandler, cachedFunction, cachedEventHandler } from 'nitropack/runtime/internal/cache';
export { useStorage } from 'nitropack/runtime/internal/storage';
export { defineRenderHandler } from 'nitropack/runtime/internal/renderer';
export { defineRouteMeta } from 'nitropack/runtime/internal/meta';
export { getRouteRules } from 'nitropack/runtime/internal/route-rules';
export { useEvent } from 'nitropack/runtime/internal/context';
export { defineTask, runTask } from 'nitropack/runtime/internal/task';
export { defineNitroErrorHandler } from 'nitropack/runtime/internal/error/utils';
export { buildAssetsURL as __buildAssetsURL, publicAssetsURL as __publicAssetsURL } from '/app/node_modules/@nuxt/nitro-server/dist/runtime/utils/paths';
export { defineAppConfig } from '/app/node_modules/@nuxt/nitro-server/dist/runtime/utils/config';
export { normalizeAttachments, parseAttachments } from '/app/server/utils/attachments';
export { createToken, verifyToken, hashPassword, verifyPassword, createSession, setAuthCookie, renewAuthCookie, clearAuthCookie, getCurrentUser, requireAuth } from '/app/server/utils/auth';
export { on, emit } from '/app/server/utils/eventBus';
export { PERMISSIONS, ALL_PERMISSIONS_MASK, hasPermission, hasAdministrator, PERMISSION_GROUPS, permissionLabel } from '/app/server/utils/permissions';
export { phpBridgeConfig, normalizePhpResult, phpCall } from '/app/server/utils/phpBridge';
export { registerPlugin, unregisterPlugin, getPlugins, hasPlugin, NUXT_PLUGIN_ID, registerNuxtSelf, nuxtPluginInfo } from '/app/server/utils/pluginRegistry';
export { serializePosts } from '/app/server/utils/postQuery';
export { MAX_MESSAGE_LENGTH, checkMessageFlood, validateMessageContent } from '/app/server/utils/rateLimit';
export { subscribeRealtime, unsubscribeRealtime, broadcast, broadcastToUsers } from '/app/server/utils/realtime';
export { rolePermissionsMask, getServerContext, isServerMember, requireServerMember, requireServerOwner, requireServerPermission } from '/app/server/utils/serverAuth';
export { urlToFilePath, ensureDir, validateFile, saveFile, validateEmojiFile, saveEmoji, saveFileWithWatermark, saveAvatar, saveCover } from '/app/server/utils/upload';
export { BADGE_ASSIGNMENTS, configBadges, pickTitle, computeTitles, enrichUsers, publicUser } from '/app/server/utils/userExtras';
export { getRoomMembers, isInRoom, joinRoom, leaveRoom, relaySignal } from '/app/server/utils/voice';