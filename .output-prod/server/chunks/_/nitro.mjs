import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { randomUUID } from 'crypto';
import { eq, and, inArray, count } from 'drizzle-orm';
import { jwtVerify, SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { writeFile as writeFile$1, mkdir } from 'fs/promises';
import { join as join$1, extname } from 'path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { pgTable, timestamp, text, uniqueIndex, integer, boolean, index, bigint, jsonb } from 'drizzle-orm/pg-core';
import { promises, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getIcons } from '@iconify/utils';
import { createHash } from 'node:crypto';
import { consola } from 'consola';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length).replace(/^\/+/, "");
  return "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NullObject = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject();
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = { ...defaults };
  for (const key of Object.keys(baseObject)) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i$1.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_();class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function parse(multipartBodyBuffer, boundary) {
  let lastline = "";
  let state = 0 /* INIT */;
  let buffer = [];
  const allParts = [];
  let currentPartHeaders = [];
  for (let i = 0; i < multipartBodyBuffer.length; i++) {
    const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
    const currByte = multipartBodyBuffer[i];
    const newLineChar = currByte === 10 || currByte === 13;
    if (!newLineChar) {
      lastline += String.fromCodePoint(currByte);
    }
    const newLineDetected = currByte === 10 && prevByte === 13;
    if (0 /* INIT */ === state && newLineDetected) {
      if ("--" + boundary === lastline) {
        state = 1 /* READING_HEADERS */;
      }
      lastline = "";
    } else if (1 /* READING_HEADERS */ === state && newLineDetected) {
      if (lastline.length > 0) {
        const i2 = lastline.indexOf(":");
        if (i2 > 0) {
          const name = lastline.slice(0, i2).toLowerCase();
          const value = lastline.slice(i2 + 1).trim();
          currentPartHeaders.push([name, value]);
        }
      } else {
        state = 2 /* READING_DATA */;
        buffer = [];
      }
      lastline = "";
    } else if (2 /* READING_DATA */ === state) {
      if (lastline.length > boundary.length + 4) {
        lastline = "";
      }
      if ("--" + boundary === lastline) {
        const j = buffer.length - lastline.length;
        const part = buffer.slice(0, j - 1);
        allParts.push(process$1(part, currentPartHeaders));
        buffer = [];
        currentPartHeaders = [];
        lastline = "";
        state = 3 /* READING_PART_SEPARATOR */;
      } else {
        buffer.push(currByte);
      }
      if (newLineDetected) {
        lastline = "";
      }
    } else if (3 /* READING_PART_SEPARATOR */ === state && newLineDetected) {
      state = 1 /* READING_HEADERS */;
    }
  }
  return allParts;
}
function process$1(data, headers) {
  const dataObj = {};
  const contentDispositionHeader = headers.find((h) => h[0] === "content-disposition")?.[1] || "";
  for (const i of contentDispositionHeader.split(";")) {
    const s = i.split("=");
    if (s.length !== 2) {
      continue;
    }
    const key = (s[0] || "").trim();
    if (key === "name" || key === "filename") {
      const _value = (s[1] || "").trim().replace(/"/g, "");
      dataObj[key] = Buffer.from(_value, "latin1").toString("utf8");
    }
  }
  const contentType = headers.find((h) => h[0] === "content-type")?.[1] || "";
  if (contentType) {
    dataObj.type = contentType;
  }
  dataObj.data = Buffer.from(data);
  return dataObj;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$1(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
async function readMultipartFormData(event) {
  const contentType = getRequestHeader(event, "content-type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return;
  }
  const boundary = contentType.match(/boundary=([^;]*)(;|$)/i)?.[1];
  if (!boundary) {
    return;
  }
  const body = await readRawBody(event, false);
  if (!body) {
    return;
  }
  return parse(body, boundary);
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse$1(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

function formatEventStreamMessage(message) {
  let result = "";
  if (message.id) {
    result += `id: ${_sanitizeSingleLine(message.id)}
`;
  }
  if (message.event) {
    result += `event: ${_sanitizeSingleLine(message.event)}
`;
  }
  if (typeof message.retry === "number" && Number.isInteger(message.retry)) {
    result += `retry: ${message.retry}
`;
  }
  const data = typeof message.data === "string" ? message.data : "";
  for (const line of data.split(/\r\n|\r|\n/)) {
    result += `data: ${line}
`;
  }
  result += "\n";
  return result;
}
function _sanitizeSingleLine(value) {
  return value.replace(/[\n\r]/g, "");
}
function formatEventStreamMessages(messages) {
  let result = "";
  for (const msg of messages) {
    result += formatEventStreamMessage(msg);
  }
  return result;
}
function setEventStreamHeaders(event) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "private, no-cache, no-store, no-transform, must-revalidate, max-age=0",
    "X-Accel-Buffering": "no"
    // prevent nginx from buffering the response
  };
  if (!isHttp2Request(event)) {
    headers.Connection = "keep-alive";
  }
  setResponseHeaders(event, headers);
}
function isHttp2Request(event) {
  return getHeader(event, ":path") !== void 0 && getHeader(event, ":method") !== void 0;
}

class EventStream {
  _h3Event;
  _transformStream = new TransformStream();
  _writer;
  _encoder = new TextEncoder();
  _writerIsClosed = false;
  _paused = false;
  _unsentData;
  _disposed = false;
  _handled = false;
  constructor(event, opts = {}) {
    this._h3Event = event;
    this._writer = this._transformStream.writable.getWriter();
    this._writer.closed.then(() => {
      this._writerIsClosed = true;
    });
    if (opts.autoclose !== false) {
      this._h3Event.node.req.on("close", () => this.close());
    }
  }
  async push(message) {
    if (typeof message === "string") {
      await this._sendEvent({ data: message });
      return;
    }
    if (Array.isArray(message)) {
      if (message.length === 0) {
        return;
      }
      if (typeof message[0] === "string") {
        const msgs = [];
        for (const item of message) {
          msgs.push({ data: item });
        }
        await this._sendEvents(msgs);
        return;
      }
      await this._sendEvents(message);
      return;
    }
    await this._sendEvent(message);
  }
  async _sendEvent(message) {
    if (this._writerIsClosed) {
      return;
    }
    if (this._paused && !this._unsentData) {
      this._unsentData = formatEventStreamMessage(message);
      return;
    }
    if (this._paused) {
      this._unsentData += formatEventStreamMessage(message);
      return;
    }
    await this._writer.write(this._encoder.encode(formatEventStreamMessage(message))).catch();
  }
  async _sendEvents(messages) {
    if (this._writerIsClosed) {
      return;
    }
    const payload = formatEventStreamMessages(messages);
    if (this._paused && !this._unsentData) {
      this._unsentData = payload;
      return;
    }
    if (this._paused) {
      this._unsentData += payload;
      return;
    }
    await this._writer.write(this._encoder.encode(payload)).catch();
  }
  pause() {
    this._paused = true;
  }
  get isPaused() {
    return this._paused;
  }
  async resume() {
    this._paused = false;
    await this.flush();
  }
  async flush() {
    if (this._writerIsClosed) {
      return;
    }
    if (this._unsentData?.length) {
      await this._writer.write(this._encoder.encode(this._unsentData));
      this._unsentData = void 0;
    }
  }
  /**
   * Close the stream and the connection if the stream is being sent to the client
   */
  async close() {
    if (this._disposed) {
      return;
    }
    if (!this._writerIsClosed) {
      try {
        await this._writer.close();
      } catch {
      }
    }
    if (this._h3Event._handled && this._handled && !this._h3Event.node.res.closed) {
      this._h3Event.node.res.end();
    }
    this._disposed = true;
  }
  /**
   * Triggers callback when the writable stream is closed.
   * It is also triggered after calling the `close()` method.
   */
  onClosed(cb) {
    this._writer.closed.then(cb);
  }
  async send() {
    setEventStreamHeaders(this._h3Event);
    setResponseStatus(this._h3Event, 200);
    this._h3Event._handled = true;
    this._handled = true;
    await sendStream(this._h3Event, this._transformStream.readable);
  }
}

function createEventStream(event, opts) {
  return new EventStream(event, opts);
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _rawReqUrl = event.node.req.url || "/";
    const _reqPath = _decodePath(event._path || _rawReqUrl);
    event._path = _reqPath;
    const _needsRawUrl = _reqPath !== _rawReqUrl;
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _needsRawUrl ? layer.route.length > 1 ? _rawReqUrl.slice(layer.route.length) || "/" : _rawReqUrl : _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function _decodePath(url) {
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const decodedPath = path.includes("%25") ? decodePath(path.replace(/%25/g, "%2525")) : decodePath(path);
  return decodedPath + query;
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {},
  "icon": {
    "provider": "server",
    "class": "",
    "aliases": {},
    "iconifyApiEndpoint": "https://api.iconify.design",
    "localApiEndpoint": "/api/_nuxt_icon",
    "fallbackToApi": true,
    "cssSelectorPrefix": "i-",
    "cssWherePseudo": true,
    "mode": "css",
    "attrs": {
      "aria-hidden": true
    },
    "collections": [
      "academicons",
      "akar-icons",
      "ant-design",
      "arcticons",
      "basil",
      "bi",
      "bitcoin-icons",
      "bpmn",
      "brandico",
      "bx",
      "bxl",
      "bxs",
      "bytesize",
      "carbon",
      "catppuccin",
      "cbi",
      "charm",
      "ci",
      "cib",
      "cif",
      "cil",
      "circle-flags",
      "circum",
      "clarity",
      "codex",
      "codicon",
      "covid",
      "cryptocurrency",
      "cryptocurrency-color",
      "cuida",
      "dashicons",
      "devicon",
      "devicon-plain",
      "dinkie-icons",
      "duo-icons",
      "ei",
      "el",
      "emojione",
      "emojione-monotone",
      "emojione-v1",
      "entypo",
      "entypo-social",
      "eos-icons",
      "ep",
      "et",
      "eva",
      "f7",
      "fa",
      "fa-brands",
      "fa-regular",
      "fa-solid",
      "fa6-brands",
      "fa6-regular",
      "fa6-solid",
      "fa7-brands",
      "fa7-regular",
      "fa7-solid",
      "fad",
      "famicons",
      "fe",
      "feather",
      "file-icons",
      "flag",
      "flagpack",
      "flat-color-icons",
      "flat-ui",
      "flowbite",
      "fluent",
      "fluent-color",
      "fluent-emoji",
      "fluent-emoji-flat",
      "fluent-emoji-high-contrast",
      "fluent-mdl2",
      "fontelico",
      "fontisto",
      "formkit",
      "foundation",
      "fxemoji",
      "gala",
      "game-icons",
      "garden",
      "geo",
      "gg",
      "gis",
      "gravity-ui",
      "gridicons",
      "grommet-icons",
      "guidance",
      "healthicons",
      "heroicons",
      "heroicons-outline",
      "heroicons-solid",
      "hugeicons",
      "humbleicons",
      "ic",
      "icomoon-free",
      "icon-park",
      "icon-park-outline",
      "icon-park-solid",
      "icon-park-twotone",
      "iconamoon",
      "iconoir",
      "icons8",
      "il",
      "ion",
      "iwwa",
      "ix",
      "jam",
      "la",
      "lets-icons",
      "line-md",
      "lineicons",
      "logos",
      "ls",
      "lsicon",
      "lucide",
      "lucide-lab",
      "mage",
      "majesticons",
      "maki",
      "map",
      "marketeq",
      "material-icon-theme",
      "material-symbols",
      "material-symbols-light",
      "mdi",
      "mdi-light",
      "medical-icon",
      "memory",
      "meteocons",
      "meteor-icons",
      "mi",
      "mingcute",
      "mono-icons",
      "mynaui",
      "nimbus",
      "nonicons",
      "noto",
      "noto-v1",
      "nrk",
      "octicon",
      "oi",
      "ooui",
      "openmoji",
      "oui",
      "pajamas",
      "pepicons",
      "pepicons-pencil",
      "pepicons-pop",
      "pepicons-print",
      "ph",
      "picon",
      "pixel",
      "pixelarticons",
      "prime",
      "proicons",
      "ps",
      "qlementine-icons",
      "quill",
      "radix-icons",
      "raphael",
      "ri",
      "rivet-icons",
      "roentgen",
      "si",
      "si-glyph",
      "sidekickicons",
      "simple-icons",
      "simple-line-icons",
      "skill-icons",
      "solar",
      "stash",
      "streamline",
      "streamline-block",
      "streamline-color",
      "streamline-cyber",
      "streamline-cyber-color",
      "streamline-emojis",
      "streamline-flex",
      "streamline-flex-color",
      "streamline-freehand",
      "streamline-freehand-color",
      "streamline-kameleon-color",
      "streamline-logos",
      "streamline-pixel",
      "streamline-plump",
      "streamline-plump-color",
      "streamline-sharp",
      "streamline-sharp-color",
      "streamline-stickies-color",
      "streamline-ultimate",
      "streamline-ultimate-color",
      "subway",
      "svg-spinners",
      "system-uicons",
      "tabler",
      "tdesign",
      "teenyicons",
      "temaki",
      "token",
      "token-branded",
      "topcoat",
      "twemoji",
      "typcn",
      "uil",
      "uim",
      "uis",
      "uit",
      "uiw",
      "unjs",
      "vaadin",
      "vs",
      "vscode-icons",
      "websymbol",
      "weui",
      "whh",
      "wi",
      "wpf",
      "zmdi",
      "zondicons"
    ],
    "fetchTimeout": 1500
  }
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "2b50a4e8-ee4e-4962-8511-a0bc0762a965",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/api/**": {
        "prerender": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {},
  "phpApiBase": "",
  "phpApiParam": "api",
  "phpBridgeSecret": "",
  "phpStaticCookie": "",
  "phpForwardCookie": true,
  "icon": {
    "serverKnownCssClasses": []
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
const _sharedAppConfig = _deepFreeze(klona(appConfig));
function useAppConfig(event) {
  {
    return _sharedAppConfig;
  }
}
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

//#region src/runtime/utils/error.ts
/**
* Nitro internal functions extracted from https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/utils.ts
*/
function isJsonRequest(event) {
	if (hasReqHeader(event, "accept", "text/html")) return false;
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return !!(value && typeof value === "string" && value.toLowerCase().includes(includes));
}

//#region src/runtime/handlers/error.ts
var error_default = async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) return;
	const defaultRes = await defaultHandler(error, event, { json: true });
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	const errorObject = defaultRes.body;
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	const reqHeaders = getRequestHeaders(event);
	const res = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"] ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) return;
	if (!res) {
		const { template } = await import('./error-500.mjs');
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	return send(event, html);
};

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [error_default, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = "\"use strict\";(()=>{const o=window,e=document.documentElement,c=[\"dark\",\"light\"],s=getStorageValue(\"localStorage\",\"nuxt-color-mode\")||\"system\";let r=s===\"system\"?f():s;const l=e.getAttribute(\"data-color-mode-forced\");l&&(r=l),i(r),o[\"__NUXT_COLOR_MODE__\"]={preference:s,value:r,getColorScheme:f,addColorScheme:i,removeColorScheme:d};function i(t){const a=\"\"+t+\"\",n=\"\";e.classList?e.classList.add(a):e.className+=\" \"+a,n&&e.setAttribute(\"data-\"+n,t)}function d(t){const a=\"\"+t+\"\",n=\"\";e.classList?e.classList.remove(a):e.className=e.className.replace(new RegExp(a,\"g\"),\"\"),n&&e.removeAttribute(\"data-\"+n)}function u(t){return o.matchMedia(\"(prefers-color-scheme\"+t+\")\")}function f(){if(o.matchMedia&&u(\"\").media!==\"not all\"){for(const t of c)if(u(\":\"+t).matches)return t}return\"light\"}})();function getStorageValue(o,e){switch(o){case\"localStorage\":try{return window.localStorage.getItem(e)}catch{return null}case\"sessionStorage\":try{return window.sessionStorage.getItem(e)}catch{return null}case\"cookie\":try{return getCookie(e)}catch{return null}default:return null}}function getCookie(o){const c=(\"; \"+window.document.cookie).split(\"; \"+o+\"=\");if(c.length===2){const s=c.pop();return s?s.split(\";\").shift():null}}";

const _EHyUiYqwhNPDXwPZA7_gT1L4EfTKD2nYM9fMjSufAE = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

function defineNitroPlugin(def) {
  return def;
}

const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  bio: text("bio").default(""),
  settings: text("settings").default("{}"),
  isPrivate: boolean("is_private").default(false),
  statusMessage: text("status_message").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const userBlocks = pgTable("user_blocks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: text("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  userBlockedIdx: uniqueIndex("user_blocks_user_blocked_idx").on(t.userId, t.blockedId)
}));
const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  providerRefreshToken: text("provider_refresh_token"),
  providerAccessToken: text("provider_access_token"),
  providerTokenExpiresAt: timestamp("provider_token_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  visibility: text("visibility").default("public"),
  visibleTo: text("visible_to").default("[]"),
  serverId: text("server_id"),
  channelId: text("channel_id"),
  quotedPostId: text("quoted_post_id"),
  likeCount: integer("like_count").default(0),
  repostCount: integer("repost_count").default(0),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const postComments = pgTable("post_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  attachments: text("attachments").default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const postReactions = pgTable("post_reactions", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  userPostEmojiIdx: uniqueIndex("post_reactions_user_post_emoji_idx").on(t.userId, t.postId, t.emoji)
}));
const likes = pgTable("likes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  userPostIdx: uniqueIndex("likes_user_post_idx").on(t.userId, t.postId)
}));
const reposts = pgTable("reposts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  userPostIdx: uniqueIndex("reposts_user_post_idx").on(t.userId, t.postId)
}));
const follows = pgTable("follows", {
  id: text("id").primaryKey(),
  followerId: text("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: text("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  followerFollowingIdx: uniqueIndex("follows_follower_following_idx").on(t.followerId, t.followingId)
}));
const servers = pgTable("servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  iconUrl: text("icon_url"),
  bannerUrl: text("banner_url"),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const serverRoles = pgTable("server_roles", {
  id: text("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").default("#99aab5"),
  position: integer("position").default(0),
  permissions: text("permissions").default(""),
  permissionsMask: bigint("permissions_mask", { mode: "number" }).default(0),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const serverMembers = pgTable("server_members", {
  id: text("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: text("role_id").references(() => serverRoles.id),
  nickname: text("nickname"),
  joinedAt: timestamp("joined_at").notNull().defaultNow()
}, (t) => ({
  serverUserIdx: uniqueIndex("server_members_server_user_idx").on(t.serverId, t.userId)
}));
const serverChannels = pgTable("server_channels", {
  id: text("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").default("text"),
  position: integer("position").default(0),
  description: text("description").default(""),
  slowModeSeconds: integer("slow_mode_seconds").default(0),
  nsfw: boolean("nsfw").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const channelMessages = pgTable("channel_messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull().references(() => serverChannels.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const closeFriends = pgTable("close_friends", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendId: text("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  userFriendIdx: uniqueIndex("close_friends_user_friend_idx").on(t.userId, t.friendId)
}));
const friends = pgTable("friends", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendId: text("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (t) => ({
  userFriendIdx: uniqueIndex("friends_user_friend_idx").on(t.userId, t.friendId)
}));
const dmChannels = pgTable("dm_channels", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  pairKey: text("pair_key")
}, (t) => ({
  pairKeyIdx: uniqueIndex("dm_channels_pair_key_idx").on(t.pairKey)
}));
const dmChannelMembers = pgTable("dm_channel_members", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull().references(() => dmChannels.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").notNull().defaultNow()
}, (t) => ({
  channelUserIdx: uniqueIndex("dm_channel_members_channel_user_idx").on(t.channelId, t.userId)
}));
const dmMessages = pgTable("dm_messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull().references(() => dmChannels.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  edited: boolean("edited").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const dmMessageEdits = pgTable("dm_message_edits", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull().references(() => dmMessages.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  editedAt: timestamp("edited_at").notNull().defaultNow()
}, (t) => ({
  messageIdx: index("dm_message_edits_message_idx").on(t.messageId)
}));
const serverInvites = pgTable("server_invites", {
  id: text("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  createdBy: text("created_by").notNull().references(() => users.id),
  maxUses: integer("max_uses").default(0),
  useCount: integer("use_count").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const postAttachments = pgTable("post_attachments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  blurUrl: text("blur_url"),
  watermarkUrl: text("watermark_url"),
  originalUrl: text("original_url"),
  originalName: text("original_name"),
  type: text("type").notNull().default("image"),
  mime: text("mime").notNull().default("image/png"),
  position: integer("position").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  userPostIdx: uniqueIndex("bookmarks_user_post_idx").on(t.userId, t.postId)
}));
const postViews = pgTable("post_views", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: text("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const customEmojis = pgTable("custom_emojis", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  url: text("url").notNull(),
  mime: text("mime").notNull().default("image/png"),
  animated: boolean("animated").default(false),
  creatorId: text("creator_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const playlists = pgTable("playlists", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const playlistItems = pgTable("playlist_items", {
  id: text("id").primaryKey(),
  playlistId: text("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => ({
  playlistPostIdx: uniqueIndex("playlist_items_playlist_post_idx").on(t.playlistId, t.postId)
}));
const userBadges = pgTable("user_badges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull().default("icon"),
  value: text("value").notNull(),
  label: text("label"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
const whiteboardStates = pgTable("whiteboard_states", {
  roomKey: text("room_key").primaryKey(),
  strokes: jsonb("strokes").notNull().default("[]").$type(),
  updatedById: text("updated_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  accounts: accounts,
  bookmarks: bookmarks,
  channelMessages: channelMessages,
  closeFriends: closeFriends,
  customEmojis: customEmojis,
  dmChannelMembers: dmChannelMembers,
  dmChannels: dmChannels,
  dmMessageEdits: dmMessageEdits,
  dmMessages: dmMessages,
  follows: follows,
  friends: friends,
  likes: likes,
  playlistItems: playlistItems,
  playlists: playlists,
  postAttachments: postAttachments,
  postComments: postComments,
  postReactions: postReactions,
  postViews: postViews,
  posts: posts,
  reposts: reposts,
  serverChannels: serverChannels,
  serverInvites: serverInvites,
  serverMembers: serverMembers,
  serverRoles: serverRoles,
  servers: servers,
  sessions: sessions,
  userBadges: userBadges,
  userBlocks: userBlocks,
  users: users,
  whiteboardStates: whiteboardStates
}, Symbol.toStringTag, { value: 'Module' }));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgres://sycs:sycs_password@localhost:5432/sycs"
});
let initPromise = null;
async function ensureDb() {
  if (!initPromise) {
    initPromise = initDbInternal();
  }
  return initPromise;
}
async function initDbInternal() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT,
        avatar_url TEXT,
        banner_url TEXT,
        bio TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        provider_refresh_token TEXT,
        provider_access_token TEXT,
        provider_token_expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        like_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS likes_user_post_idx ON likes(user_id, post_id)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS reposts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS reposts_user_post_idx ON reposts(user_id, post_id)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS follows_follower_following_idx ON follows(follower_id, following_id)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS servers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        icon_url TEXT,
        banner_url TEXT,
        owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_roles (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#99aab5',
        position INTEGER DEFAULT 0,
        permissions TEXT DEFAULT '',
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_members (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id TEXT REFERENCES server_roles(id),
        nickname TEXT,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS server_members_server_user_idx ON server_members(server_id, user_id)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_channels (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        position INTEGER DEFAULT 0,
        description TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS channel_messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES server_channels(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_invites (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        code TEXT NOT NULL UNIQUE,
        created_by TEXT NOT NULL REFERENCES users(id),
        max_uses INTEGER DEFAULT 0,
        use_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS close_friends (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS close_friends_user_friend_idx ON close_friends(user_id, friend_id)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS friends_user_friend_idx ON friends(user_id, friend_id)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS dm_channels (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS dm_channel_members (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES dm_channels(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS dm_channel_members_channel_user_idx ON dm_channel_members(channel_id, user_id)
    `);
    await client.query(`ALTER TABLE dm_channels ADD COLUMN IF NOT EXISTS pair_key TEXT`);
    await client.query(`
      WITH pairs AS (
        SELECT channel_id, string_agg(user_id, ':' ORDER BY user_id) AS pair_key
        FROM dm_channel_members
        GROUP BY channel_id
      )
      UPDATE dm_channels c SET pair_key = p.pair_key
      FROM pairs p
      WHERE c.id = p.channel_id AND c.pair_key IS NULL
    `);
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS dm_channels_pair_key_idx ON dm_channels(pair_key)
      `);
    } catch (err) {
      console.warn("[db] Skipping dm_channels_pair_key_idx:", (err == null ? void 0 : err.message) || err);
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS dm_messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES dm_channels(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS dm_message_edits (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL REFERENCES dm_messages(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        edited_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS dm_message_edits_message_idx ON dm_message_edits(message_id)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_attachments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        blur_url TEXT,
        watermark_url TEXT,
        type TEXT NOT NULL DEFAULT 'image',
        mime TEXT NOT NULL DEFAULT 'image/png',
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'`);
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS visible_to TEXT DEFAULT '[]'`);
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0`);
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS quoted_post_id TEXT`);
    await client.query(`CREATE INDEX IF NOT EXISTS posts_quoted_post_idx ON posts(quoted_post_id)`);
    await client.query(`ALTER TABLE post_attachments ADD COLUMN IF NOT EXISTS original_url TEXT`);
    await client.query(`ALTER TABLE post_attachments ADD COLUMN IF NOT EXISTS original_name TEXT`);
    await client.query(`CREATE INDEX IF NOT EXISTS posts_created_id_idx ON posts(created_at DESC, id DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS posts_user_created_idx ON posts(user_id, created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS reposts_created_id_idx ON reposts(created_at DESC, id DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS reposts_user_created_idx ON reposts(user_id, created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS post_attachments_post_idx ON post_attachments(post_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS post_reactions_post_idx ON post_reactions(post_id)`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS settings TEXT DEFAULT '{}'`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_post_idx ON bookmarks(user_id, post_id)
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_views (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS server_id TEXT`);
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS channel_id TEXT`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_reactions (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        emoji TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS post_reactions_user_post_emoji_idx ON post_reactions(user_id, post_id, emoji)
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS posts_server_channel_idx ON posts(server_id, channel_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS post_comments_post_idx ON post_comments(post_id)`);
    await client.query(`ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS attachments TEXT DEFAULT '[]'`);
    await client.query(`ALTER TABLE server_roles ADD COLUMN IF NOT EXISTS permissions_mask BIGINT DEFAULT 0`);
    await client.query(`ALTER TABLE server_channels ADD COLUMN IF NOT EXISTS slow_mode_seconds INTEGER DEFAULT 0`);
    await client.query(`ALTER TABLE server_channels ADD COLUMN IF NOT EXISTS nsfw BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE server_channels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_emojis (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        mime TEXT NOT NULL DEFAULT 'image/png',
        animated BOOLEAN DEFAULT FALSE,
        creator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS custom_emojis_name_idx ON custom_emojis(name)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlist_items (
        id TEXT PRIMARY KEY,
        playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS playlist_items_playlist_post_idx ON playlist_items(playlist_id, post_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS playlists_user_idx ON playlists(user_id)`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status_message TEXT DEFAULT ''`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_blocks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS user_blocks_user_blocked_idx ON user_blocks(user_id, blocked_id)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind TEXT NOT NULL DEFAULT 'icon',
        value TEXT NOT NULL,
        label TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS user_badges_user_idx ON user_badges(user_id)`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await client.query(`CREATE INDEX IF NOT EXISTS users_username_trgm_idx ON users USING GIN (username gin_trgm_ops)`);
    await client.query(`CREATE INDEX IF NOT EXISTS users_display_name_trgm_idx ON users USING GIN (display_name gin_trgm_ops)`);
    await client.query(`CREATE INDEX IF NOT EXISTS posts_content_trgm_idx ON posts USING GIN (content gin_trgm_ops)`);
    await client.query(`CREATE INDEX IF NOT EXISTS servers_name_trgm_idx ON servers USING GIN (name gin_trgm_ops)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS whiteboard_states (
        room_key TEXT PRIMARY KEY,
        strokes JSONB NOT NULL DEFAULT '[]',
        updated_by_id TEXT REFERENCES users(id),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      INSERT INTO post_reactions (id, post_id, user_id, emoji)
      SELECT md5(random()::text || clock_timestamp()::text || l.post_id || l.user_id), l.post_id, l.user_id, '\u2764\uFE0F'
      FROM likes l
      ON CONFLICT (user_id, post_id, emoji) DO NOTHING
    `);
  } finally {
    client.release();
  }
}
const db = drizzle(pool, { schema });
const initDb = ensureDb;

const _5zKovXErsLYEk2k6K8QN5gtjaeSpIazxBIAO4s2AXmw = defineNitroPlugin(async () => {
  if (process.env.NITRO_PRESET === "static" || process.env.GITHUB_PAGES === "true" || process.env.SKIP_DB === "true") {
    console.log("[db] Skipping database init (static / GitHub Pages build)");
    return;
  }
  console.log("[db] Connecting to database...");
  try {
    await ensureDb();
    console.log("[db] Database initialized successfully");
  } catch (err) {
    console.error("[db] Failed to initialize database:", err);
    throw err;
  }
});

const plugins = [
  _EHyUiYqwhNPDXwPZA7_gT1L4EfTKD2nYM9fMjSufAE,
_5zKovXErsLYEk2k6K8QN5gtjaeSpIazxBIAO4s2AXmw
];

const assets = {
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"18-j8OIsL9qGDmNZ+lHhp2tyH4XtaE\"",
    "mtime": "2026-07-18T22:41:29.000Z",
    "size": 24,
    "path": "../public/robots.txt"
  },
  "/default-avator.webp": {
    "type": "image/webp",
    "etag": "\"b04-5J9NFZpYMMOtb2PSK6R6jpXPrfI\"",
    "mtime": "2026-09-23T08:54:25.271Z",
    "size": 2820,
    "path": "../public/default-avator.webp"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"2d1f-Lail/jzQra/YBVxwovAeyq/UvE8\"",
    "mtime": "2026-09-23T07:23:41.730Z",
    "size": 11551,
    "path": "../public/favicon.ico"
  },
  "/_nuxt/0Ere0tGT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"42-cy+Tx2WugqUSoCaiu/JDBrSui/Y\"",
    "mtime": "2026-09-23T10:37:06.872Z",
    "size": 66,
    "path": "../public/_nuxt/0Ere0tGT.js"
  },
  "/_nuxt/0ats_UKC2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ed9-HlFyJKa92H3/qijdxhjDtvVT9M4\"",
    "mtime": "2026-09-23T10:37:06.872Z",
    "size": 3801,
    "path": "../public/_nuxt/0ats_UKC2.js"
  },
  "/uploads/f244dac0-bcd0-4e56-a555-9edd30492a62.pdf": {
    "type": "application/pdf",
    "etag": "\"e-zBMt2/yOT/676jPoNk6EH9IvIO4\"",
    "mtime": "2026-09-21T10:58:06.980Z",
    "size": 14,
    "path": "../public/uploads/f244dac0-bcd0-4e56-a555-9edd30492a62.pdf"
  },
  "/_nuxt/0ats_UKC2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"65a-jQWxz6zwuMzg9/sYAxd7n4cxaqY\"",
    "mtime": "2026-09-23T10:37:09.140Z",
    "size": 1626,
    "path": "../public/_nuxt/0ats_UKC2.js.br"
  },
  "/_nuxt/1XqZt5IR2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"f47-sscYhEtCcyoxyYTTWPNvS5PSBDI\"",
    "mtime": "2026-09-23T10:37:06.873Z",
    "size": 3911,
    "path": "../public/_nuxt/1XqZt5IR2.js"
  },
  "/_nuxt/0ats_UKC2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"736-rOmXu39quI60JZfPYVHpE3Mh114\"",
    "mtime": "2026-09-23T10:37:09.129Z",
    "size": 1846,
    "path": "../public/_nuxt/0ats_UKC2.js.gz"
  },
  "/_nuxt/AEJIBLNC2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"482-B2qZ23wY2gsGhyIuQU8WtX5ANU0\"",
    "mtime": "2026-09-23T10:37:06.876Z",
    "size": 1154,
    "path": "../public/_nuxt/AEJIBLNC2.js"
  },
  "/_nuxt/1XqZt5IR2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"67a-OuZWyXPoeIr9fQM22226BI9Ha5c\"",
    "mtime": "2026-09-23T10:37:09.146Z",
    "size": 1658,
    "path": "../public/_nuxt/1XqZt5IR2.js.br"
  },
  "/uploads/c5628c4a-75ca-4c2d-a37d-5d8a47304de9.glb": {
    "type": "model/gltf-binary",
    "etag": "\"9-XAs3rnDOGsgY6aMk7mBY395SHNw\"",
    "mtime": "2026-09-21T10:58:06.956Z",
    "size": 9,
    "path": "../public/uploads/c5628c4a-75ca-4c2d-a37d-5d8a47304de9.glb"
  },
  "/_nuxt/1XqZt5IR2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"76c-92im278glTEJMOcB+M/l5PjSYhw\"",
    "mtime": "2026-09-23T10:37:09.129Z",
    "size": 1900,
    "path": "../public/_nuxt/1XqZt5IR2.js.gz"
  },
  "/_nuxt/AEJIBLNC2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"282-vWg5pb1ph1fhcq8j0T3/bGo1ADs\"",
    "mtime": "2026-09-23T10:37:09.129Z",
    "size": 642,
    "path": "../public/_nuxt/AEJIBLNC2.js.br"
  },
  "/_nuxt/B092PcM2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e84-eEyWwmsFSeIFIBZFq9dsPA1+mgE\"",
    "mtime": "2026-09-23T10:37:09.147Z",
    "size": 3716,
    "path": "../public/_nuxt/B092PcM2.js.br"
  },
  "/_nuxt/B092PcM2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2aba-UKmQOGmj31V3rX81o0DIXVoEKHA\"",
    "mtime": "2026-09-23T10:37:06.877Z",
    "size": 10938,
    "path": "../public/_nuxt/B092PcM2.js"
  },
  "/_nuxt/B092PcM2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"107f-ETLk428tUkHB2OJyQY8E/0oAj88\"",
    "mtime": "2026-09-23T10:37:09.146Z",
    "size": 4223,
    "path": "../public/_nuxt/B092PcM2.js.gz"
  },
  "/_nuxt/AEJIBLNC2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2d2-CpURNfXXLiE2NI5oDDWhku5JjvU\"",
    "mtime": "2026-09-23T10:37:09.129Z",
    "size": 722,
    "path": "../public/_nuxt/AEJIBLNC2.js.gz"
  },
  "/_nuxt/B4vpJXQ22.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"507-WQyBBCRRsOC0TUovzkGfFrypuRY\"",
    "mtime": "2026-09-23T10:37:09.146Z",
    "size": 1287,
    "path": "../public/_nuxt/B4vpJXQ22.js.br"
  },
  "/_nuxt/B4vpJXQ22.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5da-C+3oK+R+M/iIzhR2GUFuGMCl+gg\"",
    "mtime": "2026-09-23T10:37:09.146Z",
    "size": 1498,
    "path": "../public/_nuxt/B4vpJXQ22.js.gz"
  },
  "/_nuxt/BBNxDH8c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c-gd60AyJ8S5xRi/pSj8GVvyPEMJc\"",
    "mtime": "2026-09-23T10:37:06.879Z",
    "size": 44,
    "path": "../public/_nuxt/BBNxDH8c.js"
  },
  "/_nuxt/B4vpJXQ22.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"c0a-f9O+AbYVKJDVOAwYGjBWLTIapHk\"",
    "mtime": "2026-09-23T10:37:06.878Z",
    "size": 3082,
    "path": "../public/_nuxt/B4vpJXQ22.js"
  },
  "/_nuxt/B7GUa-UT.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"44424-UuCQdZMec+Q0+CsVfZL+6AO/npA\"",
    "mtime": "2026-09-23T10:37:06.878Z",
    "size": 279588,
    "path": "../public/_nuxt/B7GUa-UT.js"
  },
  "/_nuxt/B7GUa-UT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"11ee1-qSPF27anpJbnKXIcGVhyyHtuT9I\"",
    "mtime": "2026-09-23T10:37:09.523Z",
    "size": 73441,
    "path": "../public/_nuxt/B7GUa-UT.js.br"
  },
  "/_nuxt/B7GUa-UT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"14878-BfmXm/p2b5KbdEaUqfXA3pP4loY\"",
    "mtime": "2026-09-23T10:37:09.222Z",
    "size": 84088,
    "path": "../public/_nuxt/B7GUa-UT.js.gz"
  },
  "/_nuxt/Bd07Ro-3.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1bb7-Uagl9JaHRFC6icHdzVuClDyLbsI\"",
    "mtime": "2026-09-23T10:37:06.882Z",
    "size": 7095,
    "path": "../public/_nuxt/Bd07Ro-3.js"
  },
  "/_nuxt/BDNMzG2s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"54-MasMfSk/A98C3Gn9uIOxtFxkWNw\"",
    "mtime": "2026-09-23T10:37:06.879Z",
    "size": 84,
    "path": "../public/_nuxt/BDNMzG2s.js"
  },
  "/_nuxt/BDq_ASwX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"161-VtF5GqYmQEExiACKzO3ZFHVqh+o\"",
    "mtime": "2026-09-23T10:37:06.880Z",
    "size": 353,
    "path": "../public/_nuxt/BDq_ASwX.js"
  },
  "/_nuxt/Bd07Ro-3.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b21-K3rDoZRWOHFpdBgu/lxZFIxjY9s\"",
    "mtime": "2026-09-23T10:37:09.148Z",
    "size": 2849,
    "path": "../public/_nuxt/Bd07Ro-3.js.gz"
  },
  "/_nuxt/BDUdLcpA.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"36ad-1JLsNQWibufs8cp1MoEjoITuJ94\"",
    "mtime": "2026-09-23T10:37:06.879Z",
    "size": 13997,
    "path": "../public/_nuxt/BDUdLcpA.js"
  },
  "/_nuxt/Bd07Ro-3.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a17-7nHDS9034jSF1olpO6oYKsORvFY\"",
    "mtime": "2026-09-23T10:37:09.148Z",
    "size": 2583,
    "path": "../public/_nuxt/Bd07Ro-3.js.br"
  },
  "/_nuxt/BDUdLcpA.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1244-cLRxQXm7McNx/Q3jNsvV1Fr1l+4\"",
    "mtime": "2026-09-23T10:37:09.183Z",
    "size": 4676,
    "path": "../public/_nuxt/BDUdLcpA.js.br"
  },
  "/_nuxt/BFaYnxVo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f8-XqWQLiUi6lgLLTtikxpIKmwUUw4\"",
    "mtime": "2026-09-23T10:37:06.880Z",
    "size": 248,
    "path": "../public/_nuxt/BFaYnxVo.js"
  },
  "/_nuxt/BHoM5Axa.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3c5e-ws8qCu3I5rStfoZbUp+zSDR/93o\"",
    "mtime": "2026-09-23T10:37:06.880Z",
    "size": 15454,
    "path": "../public/_nuxt/BHoM5Axa.js"
  },
  "/_nuxt/BDUdLcpA.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"14c8-Q2klt33/3Ed7RIHFk/DG+izL/fE\"",
    "mtime": "2026-09-23T10:37:09.164Z",
    "size": 5320,
    "path": "../public/_nuxt/BDUdLcpA.js.gz"
  },
  "/_nuxt/Bi8I6Smc2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1064-FVqpsUT2moFoNQ2m8JQTHMEirG8\"",
    "mtime": "2026-09-23T10:37:06.883Z",
    "size": 4196,
    "path": "../public/_nuxt/Bi8I6Smc2.js"
  },
  "/_nuxt/BHoM5Axa.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"11bb-GIds4o6jPihg0ZQlk4Quh6vWJ9E\"",
    "mtime": "2026-09-23T10:37:09.205Z",
    "size": 4539,
    "path": "../public/_nuxt/BHoM5Axa.js.br"
  },
  "/_nuxt/Bi8I6Smc2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"559-V4btuE6zYznm/aSWZDbZkRT0keo\"",
    "mtime": "2026-09-23T10:37:09.182Z",
    "size": 1369,
    "path": "../public/_nuxt/Bi8I6Smc2.js.br"
  },
  "/_nuxt/BHoM5Axa.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"13e8-D3EIIsuusg4vm/GXdCTNzrLSW/Q\"",
    "mtime": "2026-09-23T10:37:09.185Z",
    "size": 5096,
    "path": "../public/_nuxt/BHoM5Axa.js.gz"
  },
  "/_nuxt/Bi8I6Smc2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"67a-soV5fr/Q+VgVl8+BZGT8IiKH4Fs\"",
    "mtime": "2026-09-23T10:37:09.182Z",
    "size": 1658,
    "path": "../public/_nuxt/Bi8I6Smc2.js.gz"
  },
  "/_nuxt/BjGEFUf-2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"128-qifmzli+60jVkdLVzeTUb97h7xc\"",
    "mtime": "2026-09-23T10:37:06.883Z",
    "size": 296,
    "path": "../public/_nuxt/BjGEFUf-2.js"
  },
  "/_nuxt/BJ5zXZZU2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a841-nj9jj8y01qBz9rbr1d0b6xzE0yQ\"",
    "mtime": "2026-09-23T10:37:06.881Z",
    "size": 43073,
    "path": "../public/_nuxt/BJ5zXZZU2.js"
  },
  "/_nuxt/BJ5zXZZU2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"293b-y5yzScPicmTAH8I727CZLAPHUIU\"",
    "mtime": "2026-09-23T10:37:09.233Z",
    "size": 10555,
    "path": "../public/_nuxt/BJ5zXZZU2.js.br"
  },
  "/_nuxt/Bp7Vlugg.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"42af-F1ricEorLlRrqxM+Y5PvIOa0EIw\"",
    "mtime": "2026-09-23T10:37:06.884Z",
    "size": 17071,
    "path": "../public/_nuxt/Bp7Vlugg.js"
  },
  "/_nuxt/Bo_PTqUj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"21194-Z6us2X4DttoVweEyUV9QWAXCAkM\"",
    "mtime": "2026-09-23T10:37:09.985Z",
    "size": 135572,
    "path": "../public/_nuxt/Bo_PTqUj.js.br"
  },
  "/_nuxt/BJ5zXZZU2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2f0a-7Y3DkDVo1PuIJ3Gb984tnZ7iOGU\"",
    "mtime": "2026-09-23T10:37:09.205Z",
    "size": 12042,
    "path": "../public/_nuxt/BJ5zXZZU2.js.gz"
  },
  "/_nuxt/Bo_PTqUj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"28556-lr+PVBFNPqNEQ9AgIpVgCS2dpTw\"",
    "mtime": "2026-09-23T10:37:09.326Z",
    "size": 165206,
    "path": "../public/_nuxt/Bo_PTqUj.js.gz"
  },
  "/_nuxt/Bp7Vlugg.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"15db-8EbxuYitGQGb+bGTJrUzLvcmMMs\"",
    "mtime": "2026-09-23T10:37:09.222Z",
    "size": 5595,
    "path": "../public/_nuxt/Bp7Vlugg.js.br"
  },
  "/_nuxt/Bp7Vlugg.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"18ea-uiieRf2OfknsE1mcR68mlmUpS1g\"",
    "mtime": "2026-09-23T10:37:09.221Z",
    "size": 6378,
    "path": "../public/_nuxt/Bp7Vlugg.js.gz"
  },
  "/_nuxt/Bo_PTqUj.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"9ff47-KOeUbPVotrbwGSWxzecZpdnf/AQ\"",
    "mtime": "2026-09-23T10:37:06.884Z",
    "size": 655175,
    "path": "../public/_nuxt/Bo_PTqUj.js"
  },
  "/_nuxt/BpgRb35G.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"b55-KnIjj76wy5DSL7G1wDwfGkivV3g\"",
    "mtime": "2026-09-23T10:37:06.885Z",
    "size": 2901,
    "path": "../public/_nuxt/BpgRb35G.js"
  },
  "/_nuxt/BVK7xwna.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"99-ocMp6ErI9QxzmTBfms3BEwe1LeQ\"",
    "mtime": "2026-09-23T10:37:06.881Z",
    "size": 153,
    "path": "../public/_nuxt/BVK7xwna.js"
  },
  "/_nuxt/BwntHe7B.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"23f3-yyCTx1tApDPYJh+sL5h+Gvw17ds\"",
    "mtime": "2026-09-23T10:37:06.885Z",
    "size": 9203,
    "path": "../public/_nuxt/BwntHe7B.js"
  },
  "/_nuxt/BpgRb35G.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4a9-CwzYw5E1CDhX502o64ErllQJYEI\"",
    "mtime": "2026-09-23T10:37:09.188Z",
    "size": 1193,
    "path": "../public/_nuxt/BpgRb35G.js.br"
  },
  "/_nuxt/BpgRb35G.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"530-luIyPe5HFY5E/2yrHD9NvyIG4F0\"",
    "mtime": "2026-09-23T10:37:09.188Z",
    "size": 1328,
    "path": "../public/_nuxt/BpgRb35G.js.gz"
  },
  "/_nuxt/BZ4Qb0rE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b9-ampXmrytXGFukUGvgnzyhCkwj6g\"",
    "mtime": "2026-09-23T10:37:06.882Z",
    "size": 697,
    "path": "../public/_nuxt/BZ4Qb0rE.js"
  },
  "/_nuxt/BwntHe7B.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"db9-cCCUbMwrXq9Y4rsZOPEEPwbngg0\"",
    "mtime": "2026-09-23T10:37:09.222Z",
    "size": 3513,
    "path": "../public/_nuxt/BwntHe7B.js.br"
  },
  "/_nuxt/C1NTDrV2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ff3a-j/L912DBla6e+9NPHZgzY8njoqk\"",
    "mtime": "2026-09-23T10:37:06.871Z",
    "size": 65338,
    "path": "../public/_nuxt/C1NTDrV2.js"
  },
  "/_nuxt/C7sBJxN7.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a91-2AGJkfk5XijWHj8+GWa2Z5X5LKc\"",
    "mtime": "2026-09-23T10:37:06.885Z",
    "size": 2705,
    "path": "../public/_nuxt/C7sBJxN7.js"
  },
  "/_nuxt/BwntHe7B.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f0e-OB7gZ+xbJsA6keYnyAnpZV+6/xQ\"",
    "mtime": "2026-09-23T10:37:09.222Z",
    "size": 3854,
    "path": "../public/_nuxt/BwntHe7B.js.gz"
  },
  "/_nuxt/C9GN0a_32.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1a3d-zAZgaNRsiYIr1XSgtW0e+uIUd+E\"",
    "mtime": "2026-09-23T10:37:06.887Z",
    "size": 6717,
    "path": "../public/_nuxt/C9GN0a_32.js"
  },
  "/_nuxt/C1NTDrV2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5d79-fxVraD5lwj6fr/qOHUSzmVYQ50A\"",
    "mtime": "2026-09-23T10:37:09.253Z",
    "size": 23929,
    "path": "../public/_nuxt/C1NTDrV2.js.gz"
  },
  "/_nuxt/C1NTDrV2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"53b3-d6Rn4vesQ1ShH7yD1ayj/3UEDns\"",
    "mtime": "2026-09-23T10:37:09.299Z",
    "size": 21427,
    "path": "../public/_nuxt/C1NTDrV2.js.br"
  },
  "/_nuxt/C7sBJxN7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3ba-238bpu0UUIO3N6cyTxAxdH5iGYU\"",
    "mtime": "2026-09-23T10:37:09.252Z",
    "size": 954,
    "path": "../public/_nuxt/C7sBJxN7.js.br"
  },
  "/_nuxt/C7sBJxN7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"448-fikO3U6Dbg4ORzS7nmVAZHcSlok\"",
    "mtime": "2026-09-23T10:37:09.252Z",
    "size": 1096,
    "path": "../public/_nuxt/C7sBJxN7.js.gz"
  },
  "/_nuxt/CceQLIml.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22e-GsIpPUtl2NEiYzN8/KFm8rIGLDk\"",
    "mtime": "2026-09-23T10:37:06.889Z",
    "size": 558,
    "path": "../public/_nuxt/CceQLIml.js"
  },
  "/_nuxt/Cg_iY0OX.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5cb0-SH1Ah6dlGS82Uz9ekU6pgg8oSCw\"",
    "mtime": "2026-09-23T10:37:06.890Z",
    "size": 23728,
    "path": "../public/_nuxt/Cg_iY0OX.js"
  },
  "/_nuxt/C9GN0a_32.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a4f-icvYu4BSel0Kv9yxg7bnACRrEUU\"",
    "mtime": "2026-09-23T10:37:09.253Z",
    "size": 2639,
    "path": "../public/_nuxt/C9GN0a_32.js.br"
  },
  "/_nuxt/C9GN0a_32.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bcf-wp6DeTds8KHGvP7VC5JIo7m3SMA\"",
    "mtime": "2026-09-23T10:37:09.253Z",
    "size": 3023,
    "path": "../public/_nuxt/C9GN0a_32.js.gz"
  },
  "/_nuxt/CHwlrGPe.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"454-PXq3+Uo99JCCDhAYO8idSFrIsZA\"",
    "mtime": "2026-09-23T10:37:06.887Z",
    "size": 1108,
    "path": "../public/_nuxt/CHwlrGPe.js"
  },
  "/_nuxt/Cg_iY0OX.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"173b-k8B1ZogvMvrZaM3V9eL9Q1742BA\"",
    "mtime": "2026-09-23T10:37:09.292Z",
    "size": 5947,
    "path": "../public/_nuxt/Cg_iY0OX.js.br"
  },
  "/_nuxt/Cg_iY0OX.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1b59-B38E7ibjMusr72U7npy9jcAxL9M\"",
    "mtime": "2026-09-23T10:37:09.292Z",
    "size": 7001,
    "path": "../public/_nuxt/Cg_iY0OX.js.gz"
  },
  "/_nuxt/CHwlrGPe.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"223-FpNi9/U5YqyPR0Xuhb/tJdGopDc\"",
    "mtime": "2026-09-23T10:37:09.294Z",
    "size": 547,
    "path": "../public/_nuxt/CHwlrGPe.js.br"
  },
  "/_nuxt/CHwlrGPe.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"261-3cb/MubJEaxEzCqGK1NVBepumxQ\"",
    "mtime": "2026-09-23T10:37:09.294Z",
    "size": 609,
    "path": "../public/_nuxt/CHwlrGPe.js.gz"
  },
  "/_nuxt/Cj86OYNz.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"7e8-ubDYbTiSzn0wUNRYfjEJuhclPD0\"",
    "mtime": "2026-09-23T10:37:06.891Z",
    "size": 2024,
    "path": "../public/_nuxt/Cj86OYNz.js"
  },
  "/_nuxt/ClaQcikE2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"435e-/FQ8yEMBc5Yr/QpiW6kVSSkLrok\"",
    "mtime": "2026-09-23T10:37:06.891Z",
    "size": 17246,
    "path": "../public/_nuxt/ClaQcikE2.js"
  },
  "/_nuxt/ClaQcikE2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1772-h4NSPrjaV0S/7/y+O9xMaXVUFig\"",
    "mtime": "2026-09-23T10:37:09.297Z",
    "size": 6002,
    "path": "../public/_nuxt/ClaQcikE2.js.gz"
  },
  "/_nuxt/Cj86OYNz.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"30d-OUlcuEAx4xMw6iEjtFrI17e9tKY\"",
    "mtime": "2026-09-23T10:37:09.294Z",
    "size": 781,
    "path": "../public/_nuxt/Cj86OYNz.js.br"
  },
  "/_nuxt/CLItf7Gx2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ecd-zwW6u/Bq8zbcubO5OEaiMqBUDts\"",
    "mtime": "2026-09-23T10:37:06.887Z",
    "size": 3789,
    "path": "../public/_nuxt/CLItf7Gx2.js"
  },
  "/_nuxt/Cj86OYNz.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"367-C9in2uD51oOvigoKDMpv9Ipt4oA\"",
    "mtime": "2026-09-23T10:37:09.294Z",
    "size": 871,
    "path": "../public/_nuxt/Cj86OYNz.js.gz"
  },
  "/_nuxt/CNs_Ozdc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b-1MHUJYdBtOvbvPMaiQxDXp3lHyw\"",
    "mtime": "2026-09-23T10:37:06.888Z",
    "size": 27,
    "path": "../public/_nuxt/CNs_Ozdc.js"
  },
  "/_nuxt/ClaQcikE2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1451-8ipG/jyewE5Vi0kJHVT94+6ChzI\"",
    "mtime": "2026-09-23T10:37:09.313Z",
    "size": 5201,
    "path": "../public/_nuxt/ClaQcikE2.js.br"
  },
  "/_nuxt/CPFQWxFW.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"477-zE899fLr1WdgPs8cPI/SbGquxAU\"",
    "mtime": "2026-09-23T10:37:06.889Z",
    "size": 1143,
    "path": "../public/_nuxt/CPFQWxFW.js"
  },
  "/_nuxt/CLItf7Gx2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5be-vs8mN3RcqLr5tzG9CS0sI2Vzkpw\"",
    "mtime": "2026-09-23T10:37:09.313Z",
    "size": 1470,
    "path": "../public/_nuxt/CLItf7Gx2.js.br"
  },
  "/_nuxt/CLItf7Gx2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6a9-mvIp7QhGPAyy2XjyMJR92SXaJeM\"",
    "mtime": "2026-09-23T10:37:09.313Z",
    "size": 1705,
    "path": "../public/_nuxt/CLItf7Gx2.js.gz"
  },
  "/_nuxt/Crzfa5-r.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"58ce-6wcp9bFnly0Zp9qQcrqQ0++mEGE\"",
    "mtime": "2026-09-23T10:37:06.892Z",
    "size": 22734,
    "path": "../public/_nuxt/Crzfa5-r.js"
  },
  "/_nuxt/CPFQWxFW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1e1-6mflQmO+mDbJHU4qrcm2yXP55is\"",
    "mtime": "2026-09-23T10:37:09.326Z",
    "size": 481,
    "path": "../public/_nuxt/CPFQWxFW.js.br"
  },
  "/_nuxt/D2RKHkIf.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"263c-Kg8BryHZgdLsUUdvFxDFhz1qDl0\"",
    "mtime": "2026-09-23T10:37:06.892Z",
    "size": 9788,
    "path": "../public/_nuxt/D2RKHkIf.js"
  },
  "/_nuxt/Crzfa5-r.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"20e8-QUUv0iHwKsmWtFw/ho2YGe9pqo8\"",
    "mtime": "2026-09-23T10:37:09.366Z",
    "size": 8424,
    "path": "../public/_nuxt/Crzfa5-r.js.br"
  },
  "/_nuxt/Crzfa5-r.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2475-V5O8+bzurSQL9/nTGE713sbecuQ\"",
    "mtime": "2026-09-23T10:37:09.365Z",
    "size": 9333,
    "path": "../public/_nuxt/Crzfa5-r.js.gz"
  },
  "/_nuxt/CPFQWxFW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"21d-a2t8Vcm311TdjGgr4XfmcXwAxho\"",
    "mtime": "2026-09-23T10:37:09.326Z",
    "size": 541,
    "path": "../public/_nuxt/CPFQWxFW.js.gz"
  },
  "/_nuxt/D7cbI1qZ.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"230c-2gwgcyvEVo96Ti5jNW/7CGZhfhs\"",
    "mtime": "2026-09-23T10:37:06.893Z",
    "size": 8972,
    "path": "../public/_nuxt/D7cbI1qZ.js"
  },
  "/_nuxt/D2RKHkIf.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ce9-jlsxbtdwdyLV8/b8ycX16uCOGQY\"",
    "mtime": "2026-09-23T10:37:09.365Z",
    "size": 3305,
    "path": "../public/_nuxt/D2RKHkIf.js.br"
  },
  "/_nuxt/D2RKHkIf.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"e88-inzj4et2JRneb/SUoCtd5h0itCM\"",
    "mtime": "2026-09-23T10:37:09.365Z",
    "size": 3720,
    "path": "../public/_nuxt/D2RKHkIf.js.gz"
  },
  "/_nuxt/D7cbI1qZ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"cd6-4P/nS8rgxeTBMkhggiarY3qANEk\"",
    "mtime": "2026-09-23T10:37:09.379Z",
    "size": 3286,
    "path": "../public/_nuxt/D7cbI1qZ.js.br"
  },
  "/_nuxt/D7cbI1qZ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"e27-60gIJP3TcHJrn+o417H5pKnEhjY\"",
    "mtime": "2026-09-23T10:37:09.379Z",
    "size": 3623,
    "path": "../public/_nuxt/D7cbI1qZ.js.gz"
  },
  "/_nuxt/default.BGhjHRsI.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"2eb0-OSRDRcstyqPFl1bha01JCFrhWME\"",
    "mtime": "2026-09-23T10:37:06.904Z",
    "size": 11952,
    "path": "../public/_nuxt/default.BGhjHRsI.css"
  },
  "/_nuxt/default.BGhjHRsI.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"993-v1b9R5N88TmXOYyjD9MumXRC/n0\"",
    "mtime": "2026-09-23T10:37:09.379Z",
    "size": 2451,
    "path": "../public/_nuxt/default.BGhjHRsI.css.br"
  },
  "/_nuxt/default.BGhjHRsI.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"aee-q2VWE084juKp5Hfy01wjXL6NAtg\"",
    "mtime": "2026-09-23T10:37:09.365Z",
    "size": 2798,
    "path": "../public/_nuxt/default.BGhjHRsI.css.gz"
  },
  "/_nuxt/DezNr15q2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"fa2-U5XE94WHXSFbaWZSBz0AOaTocyQ\"",
    "mtime": "2026-09-23T10:37:06.896Z",
    "size": 4002,
    "path": "../public/_nuxt/DezNr15q2.js"
  },
  "/_nuxt/DGLgYHyt2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2353-yZ8LOPVeIVujO8N3uUXtX9bv9nA\"",
    "mtime": "2026-09-23T10:37:06.893Z",
    "size": 9043,
    "path": "../public/_nuxt/DGLgYHyt2.js"
  },
  "/_nuxt/DezNr15q2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5c6-tLClOkzKGFiaSi/9FUgIlXurTzU\"",
    "mtime": "2026-09-23T10:37:09.377Z",
    "size": 1478,
    "path": "../public/_nuxt/DezNr15q2.js.br"
  },
  "/_nuxt/DezNr15q2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6f6-FbKKpcdI7TsW7JpRvZ+hrc6nW0s\"",
    "mtime": "2026-09-23T10:37:09.377Z",
    "size": 1782,
    "path": "../public/_nuxt/DezNr15q2.js.gz"
  },
  "/_nuxt/DGLgYHyt2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"b43-lnNhgTSOrrDoywsHVmELa/hgkpE\"",
    "mtime": "2026-09-23T10:37:09.406Z",
    "size": 2883,
    "path": "../public/_nuxt/DGLgYHyt2.js.br"
  },
  "/_nuxt/DL1lysuy.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"23a5-pjuExlzD7HcvTJKCrEXBKmGqQkc\"",
    "mtime": "2026-09-23T10:37:06.894Z",
    "size": 9125,
    "path": "../public/_nuxt/DL1lysuy.js"
  },
  "/_nuxt/DL1lysuy.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"c15-akRa7+fDQKrHWMzq0lsD9HjQ2Ds\"",
    "mtime": "2026-09-23T10:37:09.420Z",
    "size": 3093,
    "path": "../public/_nuxt/DL1lysuy.js.br"
  },
  "/_nuxt/DL1lysuy.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d29-Ruy5L9ZNuNUpd88GhqaxwCJs7No\"",
    "mtime": "2026-09-23T10:37:09.420Z",
    "size": 3369,
    "path": "../public/_nuxt/DL1lysuy.js.gz"
  },
  "/_nuxt/DGLgYHyt2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"cda-z+stF96jwBvhcQfIqpyv5WqUINY\"",
    "mtime": "2026-09-23T10:37:09.379Z",
    "size": 3290,
    "path": "../public/_nuxt/DGLgYHyt2.js.gz"
  },
  "/_nuxt/DLE_Nm78.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1df57-f6h7PLCVLPxF82rgYYwDz7w6OK8\"",
    "mtime": "2026-09-23T10:37:06.894Z",
    "size": 122711,
    "path": "../public/_nuxt/DLE_Nm78.js"
  },
  "/_nuxt/DuV0q1jQ2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"d70-hxYKGxSXfAq/e4RZTpx+M/b9rrY\"",
    "mtime": "2026-09-23T10:37:06.896Z",
    "size": 3440,
    "path": "../public/_nuxt/DuV0q1jQ2.js"
  },
  "/_nuxt/DLE_Nm78.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"701d-cBO8Z3cBWWrv3kr+tXTIA3ZcGbQ\"",
    "mtime": "2026-09-23T10:37:09.517Z",
    "size": 28701,
    "path": "../public/_nuxt/DLE_Nm78.js.br"
  },
  "/_nuxt/DVNY-iZa.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1521a-i9xRxl9MDe38jiDiKW7c72ZgT2E\"",
    "mtime": "2026-09-23T10:37:06.895Z",
    "size": 86554,
    "path": "../public/_nuxt/DVNY-iZa.js"
  },
  "/_nuxt/DLE_Nm78.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8622-mjY/BjrLhlpd3EV6bbzflONXSvA\"",
    "mtime": "2026-09-23T10:37:09.427Z",
    "size": 34338,
    "path": "../public/_nuxt/DLE_Nm78.js.gz"
  },
  "/_nuxt/DuV0q1jQ2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"531-UEv1OUl+LnsgCp5FThyyEd/wGwo\"",
    "mtime": "2026-09-23T10:37:09.502Z",
    "size": 1329,
    "path": "../public/_nuxt/DuV0q1jQ2.js.br"
  },
  "/_nuxt/Dw2SSMVe.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"168c-/nNVfQES0OTXlFT6YBM9t48hrOY\"",
    "mtime": "2026-09-23T10:37:06.897Z",
    "size": 5772,
    "path": "../public/_nuxt/Dw2SSMVe.js"
  },
  "/_nuxt/DVNY-iZa.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8150-yngXiF8Eq+CSUfvsuLGVGollwMs\"",
    "mtime": "2026-09-23T10:37:09.517Z",
    "size": 33104,
    "path": "../public/_nuxt/DVNY-iZa.js.gz"
  },
  "/_nuxt/DuV0q1jQ2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"60b-kcAGtEgCsv3QWJqRP5JkJ7oqBNg\"",
    "mtime": "2026-09-23T10:37:09.502Z",
    "size": 1547,
    "path": "../public/_nuxt/DuV0q1jQ2.js.gz"
  },
  "/_nuxt/DVNY-iZa.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7507-ck2Ub71zgIDMw5xOfE6xGnUB4ws\"",
    "mtime": "2026-09-23T10:37:09.536Z",
    "size": 29959,
    "path": "../public/_nuxt/DVNY-iZa.js.br"
  },
  "/_nuxt/Dw2SSMVe.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"822-ck5IuruQ8Zo8CvzSzYb01I5P6JM\"",
    "mtime": "2026-09-23T10:37:09.510Z",
    "size": 2082,
    "path": "../public/_nuxt/Dw2SSMVe.js.br"
  },
  "/_nuxt/DWhUbEay.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2181-7icwsVuIVBd5y2Y5V8wzuv6ek/8\"",
    "mtime": "2026-09-23T10:37:06.895Z",
    "size": 8577,
    "path": "../public/_nuxt/DWhUbEay.js"
  },
  "/_nuxt/Dw2SSMVe.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8eb-ux3OFw2xkQrMFLGeXkNaEwX8faM\"",
    "mtime": "2026-09-23T10:37:09.510Z",
    "size": 2283,
    "path": "../public/_nuxt/Dw2SSMVe.js.gz"
  },
  "/_nuxt/DWhUbEay.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"c85-KLZLY4eP01lURuqKWu8grweFPk8\"",
    "mtime": "2026-09-23T10:37:09.514Z",
    "size": 3205,
    "path": "../public/_nuxt/DWhUbEay.js.br"
  },
  "/_nuxt/DWhUbEay.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f20-+K4lwTq5z/cNMWuUFCrekk8ufIs\"",
    "mtime": "2026-09-23T10:37:09.513Z",
    "size": 3872,
    "path": "../public/_nuxt/DWhUbEay.js.gz"
  },
  "/_nuxt/entry.BdzsPzgc.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"b78e-kNPr5isC7PgH4HXTOc0P6NiMRDQ\"",
    "mtime": "2026-09-23T10:37:06.905Z",
    "size": 46990,
    "path": "../public/_nuxt/entry.BdzsPzgc.css"
  },
  "/_nuxt/entry.BdzsPzgc.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"1d8e-8eMNr3406BFFDhRtQKh0ofY4+CQ\"",
    "mtime": "2026-09-23T10:37:09.552Z",
    "size": 7566,
    "path": "../public/_nuxt/entry.BdzsPzgc.css.br"
  },
  "/_nuxt/entry.BdzsPzgc.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2358-RHdwKVHCWo4NQcJlg4ZlE5GmHus\"",
    "mtime": "2026-09-23T10:37:09.514Z",
    "size": 9048,
    "path": "../public/_nuxt/entry.BdzsPzgc.css.gz"
  },
  "/_nuxt/error-404.DjFB7pgG.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"97d-YnhaO1Owij5UL/QAPJTOO9/ADjw\"",
    "mtime": "2026-09-23T10:37:06.906Z",
    "size": 2429,
    "path": "../public/_nuxt/error-404.DjFB7pgG.css"
  },
  "/_nuxt/error-404.DjFB7pgG.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"2d3-IEZ4aKZHBzR4GsVeVe4ILMNPe80\"",
    "mtime": "2026-09-23T10:37:09.517Z",
    "size": 723,
    "path": "../public/_nuxt/error-404.DjFB7pgG.css.br"
  },
  "/_nuxt/error-404.DjFB7pgG.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"355-cY2oZrnwSVls2opwHCZQ+/mu1w0\"",
    "mtime": "2026-09-23T10:37:09.517Z",
    "size": 853,
    "path": "../public/_nuxt/error-404.DjFB7pgG.css.gz"
  },
  "/_nuxt/error-500.BG9pmads.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"772-cy8i6KChroS+UBFHL4bmyNFMXac\"",
    "mtime": "2026-09-23T10:37:06.906Z",
    "size": 1906,
    "path": "../public/_nuxt/error-500.BG9pmads.css"
  },
  "/_nuxt/f009NoDP2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"168-aKn+z7A3D05tbHvwUJK2LAwyOj0\"",
    "mtime": "2026-09-23T10:37:06.899Z",
    "size": 360,
    "path": "../public/_nuxt/f009NoDP2.js"
  },
  "/_nuxt/error-500.BG9pmads.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2d4-7SHCQI/f8Y1YZMfoPSbAVrIDEGU\"",
    "mtime": "2026-09-23T10:37:09.523Z",
    "size": 724,
    "path": "../public/_nuxt/error-500.BG9pmads.css.gz"
  },
  "/_nuxt/error-500.BG9pmads.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"269-q7pMPr0qeCfL96rvulcnZHndAsQ\"",
    "mtime": "2026-09-23T10:37:09.523Z",
    "size": 617,
    "path": "../public/_nuxt/error-500.BG9pmads.css.br"
  },
  "/_nuxt/iBbhj-Zt.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"877f-h+z4mE9JHn53Kz6+ow477MycG/I\"",
    "mtime": "2026-09-23T10:37:06.900Z",
    "size": 34687,
    "path": "../public/_nuxt/iBbhj-Zt.js"
  },
  "/_nuxt/home.N1WB2oLr.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"19a-cRG23u95RktepBNhTi8SwgG/h1g\"",
    "mtime": "2026-09-23T10:37:06.906Z",
    "size": 410,
    "path": "../public/_nuxt/home.N1WB2oLr.css"
  },
  "/_nuxt/MYjluKdN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5bb-E8KE2Ga1W5Bd6CN/kbyM1QJg2zs\"",
    "mtime": "2026-09-23T10:37:09.548Z",
    "size": 1467,
    "path": "../public/_nuxt/MYjluKdN.js.br"
  },
  "/_nuxt/MYjluKdN.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ce2-4ay4D5uB797L3yzpHBj+Zm4t+e0\"",
    "mtime": "2026-09-23T10:37:06.898Z",
    "size": 3298,
    "path": "../public/_nuxt/MYjluKdN.js"
  },
  "/_nuxt/iBbhj-Zt.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"32a4-QhzMeC99cLOcETfS21FILfBHyoQ\"",
    "mtime": "2026-09-23T10:37:09.549Z",
    "size": 12964,
    "path": "../public/_nuxt/iBbhj-Zt.js.gz"
  },
  "/_nuxt/iBbhj-Zt.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2d6f-DX5s17Y8dcwpf6XOObr9tiWR7Ag\"",
    "mtime": "2026-09-23T10:37:09.576Z",
    "size": 11631,
    "path": "../public/_nuxt/iBbhj-Zt.js.br"
  },
  "/_nuxt/MYjluKdN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"635-qtxrvZx1grJjKMwVt/7kTuNinCM\"",
    "mtime": "2026-09-23T10:37:09.548Z",
    "size": 1589,
    "path": "../public/_nuxt/MYjluKdN.js.gz"
  },
  "/_nuxt/umpU3Wde.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5f0-Lvpg+YyMCZEwBUmPqtmqF3OIxF4\"",
    "mtime": "2026-09-23T10:37:06.900Z",
    "size": 1520,
    "path": "../public/_nuxt/umpU3Wde.js"
  },
  "/_nuxt/PostComposer.Cj83h11C.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"10c-d1kqzEN+1OnnlLLbpJxu92J2B6c\"",
    "mtime": "2026-09-23T10:37:06.901Z",
    "size": 268,
    "path": "../public/_nuxt/PostComposer.Cj83h11C.css"
  },
  "/_nuxt/PostItem.l9PNY9hM.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"116-xB17dmtRh30sn4n/YyQL7PNWKvE\"",
    "mtime": "2026-09-23T10:37:06.901Z",
    "size": 278,
    "path": "../public/_nuxt/PostItem.l9PNY9hM.css"
  },
  "/_nuxt/umpU3Wde.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2b5-PBeGwbWBdIvvgEmZLuZLj3YTUeg\"",
    "mtime": "2026-09-23T10:37:09.549Z",
    "size": 693,
    "path": "../public/_nuxt/umpU3Wde.js.br"
  },
  "/_nuxt/umpU3Wde.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"327-CfCNPpMHUXRmYuAjn9ZGden8Co0\"",
    "mtime": "2026-09-23T10:37:09.549Z",
    "size": 807,
    "path": "../public/_nuxt/umpU3Wde.js.gz"
  },
  "/_nuxt/WJ1RFB0S.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"288a-Qwuzu9rOa6BtK8vsC0Tuhls7HcA\"",
    "mtime": "2026-09-23T10:37:06.899Z",
    "size": 10378,
    "path": "../public/_nuxt/WJ1RFB0S.js"
  },
  "/_nuxt/useQuoteComposer.CQ6KDKAG.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"280-su/8JlwXVfqvGZoftziCpS2jMlE\"",
    "mtime": "2026-09-23T10:37:06.907Z",
    "size": 640,
    "path": "../public/_nuxt/useQuoteComposer.CQ6KDKAG.css"
  },
  "/_nuxt/WJ1RFB0S.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"d7b-/wY/GCwypllL+n8vyUNIWJFZCmA\"",
    "mtime": "2026-09-23T10:37:09.559Z",
    "size": 3451,
    "path": "../public/_nuxt/WJ1RFB0S.js.br"
  },
  "/_nuxt/WJ1RFB0S.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f79-YV4OoSJfk7yTDs9IQhT0Icmec1U\"",
    "mtime": "2026-09-23T10:37:09.552Z",
    "size": 3961,
    "path": "../public/_nuxt/WJ1RFB0S.js.gz"
  },
  "/_nuxt/_id_.BAOtGOuM.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b4-KtS3ySMPQTWxcYRI7Qu8wfvWyRs\"",
    "mtime": "2026-09-23T10:37:06.902Z",
    "size": 180,
    "path": "../public/_nuxt/_id_.BAOtGOuM.css"
  },
  "/_nuxt/_id_.DYndhHVS.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1d4-5DNbACbRjXJ2JT6flmjuF321/3U\"",
    "mtime": "2026-09-23T10:37:06.903Z",
    "size": 468,
    "path": "../public/_nuxt/_id_.DYndhHVS.css"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-A5Kp5GWtpx7l7AXzoMigoGhxPMY\"",
    "mtime": "2026-09-23T10:37:09.038Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/2b50a4e8-ee4e-4962-8511-a0bc0762a965.json": {
    "type": "application/json",
    "etag": "\"58-KsdXioMS3q5vE2UrwS3ha2NxLHM\"",
    "mtime": "2026-09-23T10:37:09.039Z",
    "size": 88,
    "path": "../public/_nuxt/builds/meta/2b50a4e8-ee4e-4962-8511-a0bc0762a965.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const relative = function(from, to) {
  const _from = resolve(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
  const _to = resolve(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
  if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) {
    return _to.join("/");
  }
  const _fromCopy = [..._from];
  for (const segment of _fromCopy) {
    if (_to[0] !== segment) {
      break;
    }
    _from.shift();
    _to.shift();
  }
  return [..._from.map(() => ".."), ..._to].join("/");
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _MZ_uFB = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

//#region src/runtime/utils/paths.ts
function baseURL() {
	return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const MAX_ATTACHMENTS = 8;
function normalizeAttachments(input) {
  if (!Array.isArray(input)) return [];
  return input.filter((a) => a && typeof a.url === "string" && a.url).slice(0, MAX_ATTACHMENTS).map((a) => {
    var _a;
    return {
      id: typeof a.id === "string" && a.id ? a.id : randomUUID(),
      url: a.url,
      blurUrl: (_a = a.blurUrl) != null ? _a : null,
      type: a.type || (a.mime ? String(a.mime).split("/")[0] : "file"),
      mime: a.mime || a.type || "application/octet-stream",
      name: a.name || String(a.url).split("/").pop() || "file"
    };
  });
}
function parseAttachments(raw) {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sycs-dev-secret-change-in-production-please");
const SHORT_SESSION_SECONDS = 7 * 24 * 60 * 60;
const LONG_SESSION_SECONDS = 30 * 24 * 60 * 60;
async function createToken(payload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(payload.remember ? "30d" : "7d").setIssuedAt().sign(JWT_SECRET);
}
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function createSession(userId, rememberMe = false) {
  const sessionId = randomUUID();
  const token = await createToken({ userId, sessionId, remember: rememberMe });
  return { token };
}
function cookieSecure(event) {
  var _a, _b, _c, _d, _e, _f;
  const override = process.env.SYCS_COOKIE_SECURE;
  if (override === "true") return true;
  if (override === "false") return false;
  const header = String(((_c = (_b = (_a = event == null ? void 0 : event.node) == null ? void 0 : _a.req) == null ? void 0 : _b.headers) == null ? void 0 : _c["x-forwarded-proto"]) || "");
  const proto = header.split(",")[0].trim();
  if (proto) return proto === "https";
  return !!((_f = (_e = (_d = event == null ? void 0 : event.node) == null ? void 0 : _d.req) == null ? void 0 : _e.socket) == null ? void 0 : _f.encrypted);
}
function setAuthCookie(event, token, rememberMe = false) {
  setCookie(event, "sycs_token", token, {
    httpOnly: true,
    secure: cookieSecure(event),
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? LONG_SESSION_SECONDS : SHORT_SESSION_SECONDS
  });
}
function setClientTokenCookie(event, token, rememberMe = false) {
  setCookie(event, "sycs_client_token", token, {
    httpOnly: false,
    secure: cookieSecure(event),
    sameSite: "lax",
    path: "/",
    maxAge: Math.min(LONG_SESSION_SECONDS, 60 * 60)
    // 1 hour: plenty to capture
  });
}
function clearClientTokenCookie(event) {
  deleteCookie(event, "sycs_client_token");
}
function renewAuthCookie(event) {
  const token = getCookie(event, "sycs_token");
  if (!token) return;
  verifyToken(token).then((payload) => {
    if (!payload) return;
    const remember = !!payload.remember;
    createToken({ userId: payload.userId, sessionId: payload.sessionId, remember }).then((fresh) => {
      setAuthCookie(event, fresh, remember);
    }).catch(() => {
    });
  }).catch(() => {
  });
}
function clearAuthCookie(event) {
  deleteCookie(event, "sycs_token");
}
async function getCurrentUser(event) {
  const token = getCookie(event, "sycs_token");
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return db.query.users.findFirst({ where: eq(users.id, payload.userId) }) || null;
}
async function requireAuth(event) {
  const user = await getCurrentUser(event);
  if (!user) throw createError$1({ statusCode: 401, message: "\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059" });
  return user;
}

async function getBlockRelation(userId, otherId) {
  if (!otherId || userId === otherId) return { blocked: false, blockedBy: false };
  const [a, b] = await Promise.all([
    db.query.userBlocks.findFirst({
      where: and(eq(userBlocks.userId, userId), eq(userBlocks.blockedId, otherId)),
      columns: { id: true }
    }),
    db.query.userBlocks.findFirst({
      where: and(eq(userBlocks.userId, otherId), eq(userBlocks.blockedId, userId)),
      columns: { id: true }
    })
  ]);
  return { blocked: !!a, blockedBy: !!b };
}
async function hasBlockEitherWay(userId, otherId) {
  const r = await getBlockRelation(userId, otherId);
  return r.blocked || r.blockedBy;
}

const listeners = /* @__PURE__ */ new Map();
function emit(event, data) {
  var _a;
  (_a = listeners.get(event)) == null ? void 0 : _a.forEach((cb) => cb(data));
}

const PERMISSIONS = {
  VIEW_CHANNEL: 1 << 0,
  SEND_MESSAGES: 1 << 1,
  MANAGE_MESSAGES: 1 << 2,
  CREATE_INVITE: 1 << 3,
  MANAGE_INVITES: 1 << 4,
  KICK_MEMBERS: 1 << 5,
  MANAGE_MEMBERS: 1 << 6,
  MANAGE_CHANNELS: 1 << 7,
  MANAGE_ROLES: 1 << 8,
  MANAGE_SERVER: 1 << 9,
  ADMINISTRATOR: 1 << 10
};
const ALL_PERMISSIONS_MASK = Object.values(PERMISSIONS).reduce((acc, v) => acc | v, 0);
function hasPermission(mask, perm) {
  return (mask != null ? mask : 0) > 0 && (mask & perm) === perm;
}
function hasAdministrator(mask) {
  return hasPermission(mask, PERMISSIONS.ADMINISTRATOR);
}

function phpBridgeConfig() {
  var _a, _b, _c;
  const config = useRuntimeConfig();
  const base = (_a = config.phpApiBase) != null ? _a : "";
  return {
    base: base.trim().replace(/\/+$/, ""),
    enabled: !!base.trim(),
    paramName: config.phpApiParam || "api",
    forwardCookie: config.phpForwardCookie !== false,
    staticCookie: (_b = config.phpStaticCookie) != null ? _b : "",
    secret: (_c = config.phpBridgeSecret) != null ? _c : "",
    timeoutMs: 8e3
  };
}
function normalizePhpResult(raw) {
  if (raw && typeof raw === "object") {
    const o = raw;
    if (o.success === false) {
      return { ok: false, error: typeof o.error === "string" ? o.error : "PHP action failed", raw };
    }
    if (o.success === true) {
      return { ok: true, data: "data" in o ? o.data : o, raw };
    }
    if ("error" in o && !("data" in o)) {
      const msg = typeof o.error === "string" ? o.error : "PHP error";
      if (msg === "Unauthorized") return { ok: false, error: "PHP Unauthorized (session required)", raw };
      return { ok: false, error: msg, raw };
    }
    return { ok: true, data: o, raw };
  }
  if (raw === null || raw === void 0) return { ok: true, data: null, raw };
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return normalizePhpResult(JSON.parse(trimmed));
      } catch {
        return { ok: true, data: trimmed, raw };
      }
    }
    return { ok: true, data: trimmed, raw };
  }
  return { ok: true, data: raw, raw };
}
async function phpCall(action, params = {}, opts = {}) {
  var _a, _b;
  const cfg = phpBridgeConfig();
  if (!cfg.enabled) {
    return { ok: false, error: "PHP bridge is not configured (set PHP_API_BASE in environment)" };
  }
  const url = new URL(cfg.base);
  url.searchParams.set(cfg.paramName, action);
  const body = { ...params };
  if (opts.csrfToken) body.csrf_token = opts.csrfToken;
  const headers = { "content-type": "application/json" };
  const cookie = (_a = opts.cookie) != null ? _a : cfg.staticCookie;
  if (cookie) headers.cookie = joinCookies(cookie);
  let res;
  try {
    res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout((_b = opts.timeoutMs) != null ? _b : cfg.timeoutMs)
    });
  } catch (e) {
    return { ok: false, error: `PHP unreachable: ${e.message}` };
  }
  const text = await res.text().catch(() => "");
  let raw = null;
  try {
    raw = text ? JSON.parse(text) : null;
  } catch {
    raw = text;
  }
  if (res.status === 401) {
    return { ok: false, status: 401, error: "PHP Unauthorized (session required)", raw };
  }
  if (res.status === 403) {
    return { ok: false, status: 403, error: "PHP CSRF verification failed", raw };
  }
  if (!res.ok) {
    return { ok: false, status: res.status, error: `PHP returned HTTP ${res.status}`, raw };
  }
  return normalizePhpResult(raw);
}
function joinCookies(value) {
  return value.split(";").map((part) => part.trim()).filter(Boolean).join("; ");
}

const registry = /* @__PURE__ */ new Map();
function registerPlugin(info) {
  if (!info.id) throw new Error("Plugin id is required");
  const entry = { ...info, registeredAt: (/* @__PURE__ */ new Date()).toISOString() };
  registry.set(info.id, entry);
  return entry;
}
function getPlugins() {
  return [...registry.values()].sort((a, b) => a.name.localeCompare(b.name));
}
function hasPlugin(id) {
  return registry.has(id);
}
const NUXT_PLUGIN_ID = "nuxt-brandnew";
function registerNuxtSelf() {
  const existing = registry.get(NUXT_PLUGIN_ID);
  if (existing) return existing;
  return registerPlugin(nuxtPluginInfo());
}
function nuxtPluginInfo() {
  return {
    id: NUXT_PLUGIN_ID,
    name: "SYCS Media UI",
    version: "0.1.0",
    source: "nuxt",
    capabilities: ["posts", "timeline", "comments", "servers", "channels", "playlists", "emojis", "media", "follow"],
    events: ["bridge.event"]
  };
}

const BADGE_ASSIGNMENTS = {
  // '@suchgamer': [{ kind: 'icon', value: 'lucide:crown', label: '創設者' }],
};
function configBadges(user) {
  const badges = [];
  if (user.username && BADGE_ASSIGNMENTS[`@${user.username}`]) {
    badges.push(...BADGE_ASSIGNMENTS[`@${user.username}`]);
  }
  if (BADGE_ASSIGNMENTS[user.id]) badges.push(...BADGE_ASSIGNMENTS[user.id]);
  return badges;
}
function pickTitle(actions, ageDays) {
  if (actions >= 500 || ageDays >= 365 && actions >= 200) return "\u4F1D\u8AAC";
  if (actions >= 200) return "\u9054\u4EBA";
  if (actions >= 80) return "\u719F\u7DF4";
  if (actions >= 25) return "\u5E38\u9023";
  if (actions >= 5) return "\u898B\u7FD2\u3044";
  return null;
}
async function computeTitles(users) {
  const ids = [...new Set(users.map((u) => u.id))].filter(Boolean);
  const out = {};
  if (!ids.length) return out;
  const [postRows, commentRows, reactionRows] = await Promise.all([
    db.select({ userId: posts.userId, c: count() }).from(posts).where(inArray(posts.userId, ids)).groupBy(posts.userId),
    db.select({ userId: postComments.userId, c: count() }).from(postComments).where(inArray(postComments.userId, ids)).groupBy(postComments.userId),
    db.select({ userId: postReactions.userId, c: count() }).from(postReactions).where(inArray(postReactions.userId, ids)).groupBy(postReactions.userId)
  ]);
  const toMap = (rows) => Object.fromEntries(rows.map((r) => [r.userId, Number(r.c)]));
  const posts$1 = toMap(postRows);
  const comments = toMap(commentRows);
  const reactions = toMap(reactionRows);
  const now = Date.now();
  for (const u of users) {
    const actions = (posts$1[u.id] || 0) * 5 + (comments[u.id] || 0) * 3 + (reactions[u.id] || 0);
    const ageDays = u.createdAt ? (now - new Date(u.createdAt).getTime()) / 864e5 : 0;
    out[u.id] = pickTitle(actions, ageDays);
  }
  return out;
}
async function enrichUsers(users) {
  const ids = [...new Set(users.map((u) => u.id))].filter(Boolean);
  const out = {};
  if (!ids.length) return out;
  const [dbBadges, titles] = await Promise.all([
    db.query.userBadges.findMany({
      where: inArray(userBadges.userId, ids),
      orderBy: [userBadges.position]
    }),
    computeTitles(users)
  ]);
  const dbBadgeMap = {};
  for (const b of dbBadges) {
    if (!dbBadgeMap[b.userId]) dbBadgeMap[b.userId] = [];
    dbBadgeMap[b.userId].push({ kind: b.kind, value: b.value, label: b.label });
  }
  for (const u of users) {
    out[u.id] = {
      badges: [...dbBadgeMap[u.id] || [], ...configBadges(u)],
      title: titles[u.id] || null
    };
  }
  return out;
}
function publicUser(u, extras) {
  if (!u) return null;
  const { passwordHash, email, settings, ...rest } = u;
  return {
    ...rest,
    badges: (extras == null ? void 0 : extras.badges) || [],
    title: (extras == null ? void 0 : extras.title) || null
  };
}
function pickPublicSummary(u) {
  if (!u) return null;
  const { id, username, displayName, avatarUrl, bannerUrl, bio, statusMessage, isPrivate, createdAt, updatedAt } = u;
  return { id, username, displayName, avatarUrl, bannerUrl, bio, statusMessage, isPrivate, createdAt, updatedAt };
}

async function serializePosts(posts$1, currentUser, resolving = /* @__PURE__ */ new Set()) {
  const postIds = posts$1.map((p) => p.id);
  if (!postIds.length) return [];
  const postUserIds = [...new Set(posts$1.map((p) => p.userId))];
  const postUsers = postUserIds.length ? await db.query.users.findMany({ where: inArray(users.id, postUserIds) }) : [];
  const postExtras = await enrichUsers(postUsers);
  const postUserMap = Object.fromEntries(postUsers.map((u) => [u.id, publicUser(u, postExtras[u.id])]));
  const attachments = await db.query.postAttachments.findMany({
    where: inArray(postAttachments.postId, postIds),
    orderBy: [postAttachments.position]
  });
  const attachMap = {};
  for (const a of attachments) {
    if (!attachMap[a.postId]) attachMap[a.postId] = [];
    attachMap[a.postId].push(a);
  }
  let userLikes = /* @__PURE__ */ new Set();
  let userReposts = /* @__PURE__ */ new Set();
  let userBookmarks = /* @__PURE__ */ new Set();
  if (currentUser) {
    const likes$1 = await db.query.likes.findMany({
      where: and(eq(likes.userId, currentUser.id), inArray(likes.postId, postIds))
    });
    likes$1.forEach((l) => userLikes.add(l.postId));
    const repsts = await db.query.reposts.findMany({
      where: and(eq(reposts.userId, currentUser.id), inArray(reposts.postId, postIds))
    });
    repsts.forEach((r) => userReposts.add(r.postId));
    const bms = await db.query.bookmarks.findMany({
      where: and(eq(bookmarks.userId, currentUser.id), inArray(bookmarks.postId, postIds))
    });
    bms.forEach((b) => userBookmarks.add(b.postId));
  }
  const commentCount = /* @__PURE__ */ new Map();
  const commentRows = await db.select({ postId: postComments.postId, n: count() }).from(postComments).where(inArray(postComments.postId, postIds)).groupBy(postComments.postId);
  for (const r of commentRows) commentCount.set(r.postId, r.n);
  const reactions = await db.query.postReactions.findMany({
    where: inArray(postReactions.postId, postIds),
    columns: { postId: true, emoji: true, userId: true }
  });
  const reactionUserIds = [...new Set(reactions.map((r) => r.userId))];
  const reactionUsers = reactionUserIds.length ? await db.query.users.findMany({ where: inArray(users.id, reactionUserIds) }) : [];
  const reactionUserMap = Object.fromEntries(reactionUsers.map((u) => [u.id, u]));
  const reactionMap = {};
  for (const r of reactions) {
    if (!reactionMap[r.postId]) reactionMap[r.postId] = /* @__PURE__ */ new Map();
    const group = reactionMap[r.postId];
    const existing = group.get(r.emoji) || {
      emoji: r.emoji,
      count: 0,
      mine: false,
      users: []
    };
    existing.count++;
    if (currentUser && r.userId === currentUser.id) existing.mine = true;
    const u = reactionUserMap[r.userId];
    if (u) existing.users.push({ id: u.id, username: u.username, displayName: u.displayName });
    group.set(r.emoji, existing);
  }
  const serialized = posts$1.map((p) => ({
    ...p,
    user: postUserMap[p.userId] || null,
    attachments: attachMap[p.id] || [],
    liked: userLikes.has(p.id),
    reposted: userReposts.has(p.id),
    bookmarked: userBookmarks.has(p.id),
    commentCount: commentCount.get(p.id) || 0,
    reactions: reactionMap[p.id] ? [...reactionMap[p.id].values()] : []
  }));
  const seen = /* @__PURE__ */ new Set([...resolving, ...postIds]);
  const quoteIds = [...new Set(posts$1.map((p) => p.quotedPostId).filter((id) => !!id && !seen.has(id)))];
  const quotedMap = /* @__PURE__ */ new Map();
  if (quoteIds.length) {
    const quotedRows = await db.query.posts.findMany({ where: inArray(posts.id, quoteIds) });
    if (quotedRows.length) {
      const quotedSerialized = await serializePosts(quotedRows, currentUser, seen);
      for (const q of quotedSerialized) quotedMap.set(q.id, q);
    }
  }
  return serialized.map((p) => ({
    ...p,
    quotedPost: p.quotedPostId ? quotedMap.get(p.quotedPostId) || null : null
  }));
}

const FLOOD_WINDOW_MS = 1e4;
const FLOOD_MAX_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 2e3;
const messageLog = /* @__PURE__ */ new Map();
function checkMessageFlood(userId) {
  const now = Date.now();
  const recent = (messageLog.get(userId) || []).filter((t) => now - t < FLOOD_WINDOW_MS);
  if (recent.length >= FLOOD_MAX_MESSAGES) {
    messageLog.set(userId, recent);
    const wait = Math.ceil((FLOOD_WINDOW_MS - (now - recent[0])) / 1e3);
    return Math.max(1, wait);
  }
  recent.push(now);
  messageLog.set(userId, recent);
  return null;
}
function validateMessageContent(content) {
  const raw = typeof content === "string" ? content : "";
  const trimmed = raw.trim();
  if (!trimmed) throw createError$1({ statusCode: 400, message: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw createError$1({ statusCode: 400, message: `\u30E1\u30C3\u30BB\u30FC\u30B8\u306F${MAX_MESSAGE_LENGTH}\u6587\u5B57\u4EE5\u5185\u306B\u3057\u3066\u304F\u3060\u3055\u3044` });
  }
  return trimmed;
}

const subscribers = /* @__PURE__ */ new Set();
function subscribeRealtime(sub) {
  subscribers.add(sub);
}
function unsubscribeRealtime(sub) {
  subscribers.delete(sub);
}
function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const sub of [...subscribers]) {
    try {
      sub.push(data);
    } catch {
      subscribers.delete(sub);
    }
  }
}
function broadcastToUsers(payload, userIds) {
  const targets = new Set(userIds);
  const data = JSON.stringify(payload);
  for (const sub of [...subscribers]) {
    if (!sub.userId || !targets.has(sub.userId)) continue;
    try {
      sub.push(data);
    } catch {
      subscribers.delete(sub);
    }
  }
}

function rolePermissionsMask(role) {
  if (!role) return 0;
  if (role.isAdmin || role.permissions === "all") return ALL_PERMISSIONS_MASK;
  return typeof role.permissionsMask === "number" ? role.permissionsMask : 0;
}
async function getServerContext(event, serverId) {
  const user = await getCurrentUser(event);
  if (!user) return null;
  const server = await db.query.servers.findFirst({ where: eq(servers.id, serverId) });
  if (!server) return null;
  const isOwner = server.ownerId === user.id;
  const member = await db.query.serverMembers.findFirst({
    where: and(
      eq(serverMembers.serverId, serverId),
      eq(serverMembers.userId, user.id)
    )
  });
  let role = null;
  if (member == null ? void 0 : member.roleId) {
    role = await db.query.serverRoles.findFirst({ where: eq(serverRoles.id, member.roleId) });
  }
  let permissions = rolePermissionsMask(role);
  if (isOwner || (role == null ? void 0 : role.isAdmin) || hasAdministrator(permissions)) {
    permissions = ALL_PERMISSIONS_MASK;
  }
  return { server, member, role, permissions, isOwner, user };
}
async function isServerMember(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq(servers.id, serverId),
    columns: { id: true, ownerId: true }
  });
  if (!server) return false;
  if (server.ownerId === userId) return true;
  const member = await db.query.serverMembers.findFirst({
    where: and(
      eq(serverMembers.serverId, serverId),
      eq(serverMembers.userId, userId)
    ),
    columns: { id: true }
  });
  return !!member;
}
async function requireServerMember(event, serverId) {
  const ctx = await getServerContext(event, serverId);
  if (!(ctx == null ? void 0 : ctx.server)) throw createError$1({ statusCode: 404, message: "\u30B5\u30FC\u30D0\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (!ctx.isOwner && !ctx.member) {
    throw createError$1({ statusCode: 403, message: "\u3053\u306E\u30B5\u30FC\u30D0\u30FC\u306E\u30E1\u30F3\u30D0\u30FC\u3067\u306F\u3042\u308A\u307E\u305B\u3093" });
  }
  return ctx;
}
async function requireServerPermission(event, serverId, perm, message = "\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093") {
  await requireAuth(event);
  const ctx = await getServerContext(event, serverId);
  if (!(ctx == null ? void 0 : ctx.server)) throw createError$1({ statusCode: 404, message: "\u30B5\u30FC\u30D0\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (!ctx.isOwner && !ctx.member) {
    throw createError$1({ statusCode: 403, message: "\u3053\u306E\u30B5\u30FC\u30D0\u30FC\u306E\u30E1\u30F3\u30D0\u30FC\u3067\u306F\u3042\u308A\u307E\u305B\u3093" });
  }
  if (!ctx.isOwner && !hasPermission(ctx.permissions, perm)) {
    throw createError$1({ statusCode: 403, message });
  }
  return ctx;
}

const ALLOWED = [
  ".png",
  ".jpeg",
  ".jpg",
  ".gif",
  ".webp",
  ".webm",
  ".mp4",
  ".mp3",
  ".ogg",
  ".glb",
  ".gltf",
  ".obj",
  ".fbx",
  ".stl",
  ".pdf",
  ".zip",
  ".txt",
  ".md",
  ".json",
  ".csv"
];
const IMAGE_TYPES = [".png", ".jpeg", ".jpg", ".gif", ".webp"];
const MODEL_TYPES = [".glb", ".gltf", ".obj", ".fbx", ".stl"];
const MAX_SIZE_IMAGE = 10 * 1024 * 1024;
const MAX_SIZE_VIDEO = 50 * 1024 * 1024;
const MAX_SIZE_AUDIO = 30 * 1024 * 1024;
const MAX_SIZE_MODEL = 100 * 1024 * 1024;
const MAX_SIZE_FILE = 50 * 1024 * 1024;
const UPLOAD_DIR = join$1(process.cwd(), "public", "uploads");
function urlToFilePath(url) {
  return join$1(UPLOAD_DIR, url.replace(/^\/uploads\//, ""));
}
async function ensureDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}
function validateFile(filename, type, buffer) {
  const ext = extname(filename).toLowerCase();
  if (!ALLOWED.includes(ext)) {
    throw createError$1({ statusCode: 400, message: `\u8A31\u53EF\u3055\u308C\u3066\u3044\u306A\u3044\u30D5\u30A1\u30A4\u30EB\u5F62\u5F0F\u3067\u3059: ${ext}` });
  }
  if (type.startsWith("image/") && buffer.length > MAX_SIZE_IMAGE) {
    throw createError$1({ statusCode: 400, message: "\u753B\u50CF\u306F10MB\u4EE5\u4E0B\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  if (type.startsWith("video/") && buffer.length > MAX_SIZE_VIDEO) {
    throw createError$1({ statusCode: 400, message: "\u52D5\u753B\u306F50MB\u4EE5\u4E0B\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  if (type.startsWith("audio/") && buffer.length > MAX_SIZE_AUDIO) {
    throw createError$1({ statusCode: 400, message: "\u97F3\u58F0\u306F30MB\u4EE5\u4E0B\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  if ((type.startsWith("model/") || MODEL_TYPES.includes(ext)) && buffer.length > MAX_SIZE_MODEL) {
    throw createError$1({ statusCode: 400, message: "3D\u30E2\u30C7\u30EB\u306F100MB\u4EE5\u4E0B\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  if (!type.startsWith("image/") && !type.startsWith("video/") && !type.startsWith("audio/") && !type.startsWith("model/") && !MODEL_TYPES.includes(ext) && buffer.length > MAX_SIZE_FILE) {
    throw createError$1({ statusCode: 400, message: "\u30D5\u30A1\u30A4\u30EB\u306F50MB\u4EE5\u4E0B\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
}
async function saveFile(buffer, filename) {
  await ensureDir();
  const ext = extname(filename).toLowerCase();
  const name = `${randomUUID()}${ext}`;
  const filePath = join$1(UPLOAD_DIR, name);
  await writeFile$1(filePath, buffer);
  let url = `/uploads/${name}`;
  let blurUrl = null;
  if (IMAGE_TYPES.includes(ext) && ext !== ".gif" && ext !== ".webp") {
    try {
      const webpName = `${randomUUID()}.webp`;
      const webpPath = join$1(UPLOAD_DIR, webpName);
      await sharp(buffer).rotate().webp({ quality: 88, effort: 4 }).toFile(webpPath);
      url = `/uploads/${webpName}`;
    } catch (err) {
      console.error("[Upload] webp conversion failed for", filename, ":", err);
    }
  }
  if (IMAGE_TYPES.includes(ext)) {
    try {
      const blurName = `${randomUUID()}-blur.jpg`;
      const blurPath = join$1(UPLOAD_DIR, blurName);
      await sharp(buffer).blur(40).jpeg({ quality: 30 }).toFile(blurPath);
      blurUrl = `/uploads/${blurName}`;
    } catch {
    }
  }
  return { url, blurUrl, originalUrl: `/uploads/${name}`, originalName: filename };
}
const EMOJI_EXT = [".png", ".gif", ".webp", ".jpg", ".jpeg"];
const MAX_SIZE_EMOJI = 1024 * 1024;
function validateEmojiFile(filename, buffer) {
  const ext = extname(filename).toLowerCase();
  if (!EMOJI_EXT.includes(ext)) {
    throw createError$1({ statusCode: 400, message: "\u7D75\u6587\u5B57\u306F PNG / GIF / WebP / JPEG \u306E\u307F\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u3059" });
  }
  if (buffer.length > MAX_SIZE_EMOJI) {
    throw createError$1({ statusCode: 400, message: "\u7D75\u6587\u5B57\u306F1MB\u4EE5\u4E0B\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
}
async function saveEmoji(buffer, filename) {
  await ensureDir();
  const ext = extname(filename).toLowerCase();
  const name = `${randomUUID()}${ext}`;
  await writeFile$1(join$1(UPLOAD_DIR, name), buffer);
  const mime = ext === ".gif" ? "image/gif" : ext === ".webp" ? "image/webp" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return { url: `/uploads/${name}`, mime, animated: ext === ".gif" };
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
let _wmFont = null;
function getWmFont() {
  if (_wmFont) return _wmFont;
  const root = process.env.SYSTEMROOT || "C:\\Windows";
  const candidates = [
    join$1(root, "Fonts", "NotoSansJP-VF.ttf"),
    join$1(root, "Fonts", "meiryo.ttc")
  ];
  for (const fp of candidates) {
    try {
      const buf = readFileSync(fp);
      _wmFont = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
      break;
    } catch {
    }
  }
  return _wmFont;
}
function makeWmSvg(w, h, text, isDark) {
  const font = getWmFont();
  const angle = -20;
  const cosA = Math.cos(Math.abs(angle) * Math.PI / 180);
  const mainColor = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.40)";
  const tileColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const parts = [
    `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  ];
  if (font) {
    const fontSize = Math.round(Math.min(
      w / (Math.max(text.length, 1) * 0.35 * cosA),
      Math.min(w, h) / 1.2
    ));
    const tileFontSize = Math.round(fontSize * 0.4);
    const mainPath = font.getPath(text, 0, 0, fontSize);
    const mainBBox = mainPath.getBoundingBox();
    const mainD = mainPath.toSVG();
    const mcx = (mainBBox.x1 + mainBBox.x2) / 2;
    const mcy = (mainBBox.y1 + mainBBox.y2) / 2;
    const tilePath = font.getPath(text, 0, 0, tileFontSize);
    const tileBBox = tilePath.getBoundingBox();
    const tileD = tilePath.toSVG();
    const tcx = (tileBBox.x1 + tileBBox.x2) / 2;
    const tcy = (tileBBox.y1 + tileBBox.y2) / 2;
    const cx = Math.round(w / 2);
    const cy = Math.round(h / 2);
    parts.push(`<path d="${mainD}" fill="${mainColor}" transform="translate(${Math.round(cx - mcx)}, ${Math.round(cy - mcy)}) rotate(${angle} ${mcx} ${mcy})"/>`);
    const tilePositions = [
      [w * 0.12, h * 0.1],
      [w * 0.88, h * 0.1],
      [w * 0.12, h * 0.9],
      [w * 0.88, h * 0.9],
      [w * 0.5, h * 0.04],
      [w * 0.5, h * 0.96],
      [w * 0.04, h * 0.5],
      [w * 0.96, h * 0.5]
    ];
    for (const [tx, ty] of tilePositions) {
      parts.push(`<path d="${tileD}" fill="${tileColor}" transform="translate(${Math.round(tx - tcx)}, ${Math.round(ty - tcy)}) rotate(${angle} ${tcx} ${tcy})"/>`);
    }
  } else {
    const safeText = escapeXml(text);
    const fontSize = Math.round(Math.min(w, h) / 1.5);
    const tileFontSize = Math.round(fontSize / 3);
    const cx = Math.round(w / 2);
    const cy = Math.round(h / 2);
    parts.push(`<text x="${cx}" y="${Math.round(cy + fontSize * 0.35)}" fill="${mainColor}" font-size="${fontSize}px" font-weight="bold" font-family="sans-serif" text-anchor="middle" transform="rotate(${angle} ${cx} ${cy})">${safeText}</text>`);
    const tilePositions = [
      [w * 0.12, h * 0.1],
      [w * 0.88, h * 0.1],
      [w * 0.12, h * 0.9],
      [w * 0.88, h * 0.9],
      [w * 0.5, h * 0.04],
      [w * 0.5, h * 0.96]
    ];
    for (const [tx, ty] of tilePositions) {
      parts.push(`<text x="${Math.round(tx)}" y="${Math.round(ty + tileFontSize * 0.35)}" fill="${tileColor}" font-size="${tileFontSize}px" font-weight="bold" font-family="sans-serif" text-anchor="middle" transform="rotate(${angle} ${tx} ${ty})">${safeText}</text>`);
    }
  }
  parts.push("</svg>");
  return parts.join("\n");
}
async function saveFileWithWatermark(buffer, filename, username) {
  await ensureDir();
  const ext = extname(filename).toLowerCase();
  const name = `${randomUUID()}${ext}`;
  const filePath = join$1(UPLOAD_DIR, name);
  let blurUrl = null;
  if (IMAGE_TYPES.includes(ext)) {
    let watermarkApplied = false;
    try {
      const metadata = await sharp(buffer).metadata();
      const w = metadata.width || 800;
      const h = metadata.height || 600;
      let isDark = true;
      try {
        const small = await sharp(buffer).resize(50, 50, { fit: "cover" }).raw().toBuffer();
        let total = 0;
        for (let i = 0; i < small.length; i += 3) {
          total += 0.299 * small[i] + 0.587 * small[i + 1] + 0.114 * small[i + 2];
        }
        isDark = total / (small.length / 3) < 128;
      } catch {
      }
      const text = `@${username}`;
      const svgString = makeWmSvg(w, h, text, isDark);
      const svgBuffer = Buffer.from(svgString);
      const pipeline = sharp(buffer).composite([{ input: svgBuffer, top: 0, left: 0 }]);
      if (ext === ".png") {
        await pipeline.png().toFile(filePath);
      } else if (ext === ".webp") {
        await pipeline.webp({ quality: 90 }).toFile(filePath);
      } else {
        await pipeline.jpeg({ quality: 92 }).toFile(filePath);
      }
      watermarkApplied = true;
      const blurName = `${randomUUID()}-blur.jpg`;
      const blurPath = join$1(UPLOAD_DIR, blurName);
      await sharp(buffer).composite([{ input: svgBuffer, top: 0, left: 0 }]).blur(40).jpeg({ quality: 30 }).toFile(blurPath);
      blurUrl = `/uploads/${blurName}`;
    } catch (e) {
      console.error("[Watermark] Failed for", filename, ":", e);
      if (!watermarkApplied) {
        await writeFile$1(filePath, buffer);
      }
      if (!blurUrl) {
        try {
          const blurName = `${randomUUID()}-blur.jpg`;
          const blurPath = join$1(UPLOAD_DIR, blurName);
          await sharp(buffer).blur(40).jpeg({ quality: 30 }).toFile(blurPath);
          blurUrl = `/uploads/${blurName}`;
        } catch (blurErr) {
          console.error("[Watermark] Blur fallback also failed:", blurErr);
        }
      }
    }
  } else {
    await writeFile$1(filePath, buffer);
  }
  return { url: `/uploads/${name}`, blurUrl };
}
async function saveAvatar(buffer, filename) {
  await ensureDir();
  const ext = extname(filename).toLowerCase();
  const name = `${randomUUID()}${ext}`;
  const filePath = join$1(UPLOAD_DIR, name);
  await sharp(buffer).resize(256, 256, { fit: "cover" }).toFile(filePath);
  return `/uploads/${name}`;
}
async function saveCover(buffer, filename, width, height) {
  await ensureDir();
  const name = `${randomUUID()}.jpg`;
  const filePath = join$1(UPLOAD_DIR, name);
  await sharp(buffer).resize(width, height, { fit: "cover" }).jpeg({ quality: 85 }).toFile(filePath);
  return `/uploads/${name}`;
}

const rooms = /* @__PURE__ */ new Map();
const expiry = /* @__PURE__ */ new Map();
const PRESENCE_TTL_MS = 9e4;
function getRoomMembers(roomKey) {
  var _a;
  return [...((_a = rooms.get(roomKey)) == null ? void 0 : _a.values()) || []];
}
function isInRoom(roomKey, userId) {
  var _a;
  return !!((_a = rooms.get(roomKey)) == null ? void 0 : _a.has(userId));
}
function scheduleExpiry(roomKey, userId) {
  clearExpiry(roomKey, userId);
  const roomExpiry = expiry.get(roomKey) || /* @__PURE__ */ new Map();
  roomExpiry.set(userId, setTimeout(() => {
    leaveRoomInternal(roomKey, userId);
  }, PRESENCE_TTL_MS));
  expiry.set(roomKey, roomExpiry);
}
function clearExpiry(roomKey, userId) {
  const roomExpiry = expiry.get(roomKey);
  const t = roomExpiry == null ? void 0 : roomExpiry.get(userId);
  if (t) clearTimeout(t);
}
function joinRoom(roomKey, member) {
  const room = rooms.get(roomKey) || /* @__PURE__ */ new Map();
  const existing = [...room.values()];
  room.set(member.userId, member);
  rooms.set(roomKey, room);
  scheduleExpiry(roomKey, member.userId);
  broadcast({ type: "voice.update", roomKey, members: getRoomMembers(roomKey) });
  return existing;
}
function leaveRoom(roomKey, userId) {
  leaveRoomInternal(roomKey, userId);
}
function leaveRoomInternal(roomKey, userId, quiet) {
  clearExpiry(roomKey, userId);
  const room = rooms.get(roomKey);
  if (!(room == null ? void 0 : room.has(userId))) return;
  room.delete(userId);
  if (room.size === 0) {
    rooms.delete(roomKey);
    expiry.delete(roomKey);
  } else {
    rooms.set(roomKey, room);
  }
  broadcast({ type: "voice.update", roomKey, members: getRoomMembers(roomKey) });
}
function relaySignal(roomKey, from, to, signal) {
  broadcastToUsers({ type: "voice.signal", roomKey, from, to, signal }, [to]);
}

const collections = {
};

const DEFAULT_ENDPOINT = "https://api.iconify.design";
const _riGxUK = defineCachedEventHandler(async (event) => {
  const options = useAppConfig().icon;
  const collectionName = event.context.params?.collection?.replace(/\.json$/, "");
  const collection = collectionName && Object.hasOwn(collections, collectionName) ? await collections[collectionName]?.() : null;
  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT;
  const icons = String(parseQuery(parsePath(event.path).search).icons || "").split(",");
  if (!collectionName) return createError$1({ status: 400, message: "No collection specified" });
  if (!icons.length) return createError$1({ status: 400, message: "No icons specified" });
  if (collection) {
    const data = getIcons(
      collection,
      icons
    );
    consola.debug(`[Icon] serving ${icons.map((i) => "`" + collectionName + ":" + i + "`").join(",")} from bundled collection`);
    return data;
  }
  if (options.fallbackToApi === true || options.fallbackToApi === "server-only") {
    const apiUrl = new URL(`./${collectionName}.json?icons=${icons.join(",")}`, apiEndPoint);
    consola.debug(`[Icon] fetching ${icons.map((i) => "`" + collectionName + ":" + i + "`").join(",")} from iconify api`);
    if (apiUrl.host !== new URL(apiEndPoint).host) {
      return createError$1({ status: 400, message: "Invalid icon request" });
    }
    try {
      const data = await $fetch(apiUrl.href);
      return data;
    } catch (e) {
      consola.error(e);
      if (e.status === 404)
        return createError$1({ status: 404 });
      else
        return createError$1({ status: 500, message: "Failed to fetch fallback icon" });
    }
  }
  return createError$1({ status: 404 });
}, {
  group: "nuxt",
  name: "icon",
  getKey(event) {
    const collection = event.context.params?.collection?.replace(/\.json$/, "") || "unknown";
    const icons = String(parseQuery(parsePath(event.path).search).icons || "").split(",");
    return `${collection}_${icons[0]}_${icons.length}_${hash$1(icons.join(","))}`;
  },
  swr: true,
  maxAge: 60 * 60 * 24 * 7
  // 1 week
});

const _SxA8c9 = defineEventHandler(() => {});

const _lazy_QuCQBu = () => import('../routes/api/actions/history.get.mjs');
const _lazy_frBPBP = () => import('../routes/api/actions/likes.get.mjs');
const _lazy_6VRmM1 = () => import('../routes/api/actions/reactions.get.mjs');
const _lazy_0G3k0h = () => import('../routes/api/actions/reposts.get.mjs');
const _lazy_yNpVEx = () => import('../routes/api/admin/users/_id/badges.put.mjs');
const _lazy_SBl2gv = () => import('../routes/api/auth/github/callback.get.mjs');
const _lazy_MVTFyK = () => import('../routes/api/auth/index.get.mjs');
const _lazy_sKY4ro = () => import('../routes/api/auth/google/callback.get.mjs');
const _lazy_RmWCsP = () => import('../routes/api/auth/index2.get.mjs');
const _lazy_jcly7m = () => import('../routes/api/auth/me.get.mjs');
const _lazy_4d5WLF = () => import('../routes/api/auth/signin.post.mjs');
const _lazy_C71pQm = () => import('../routes/api/auth/signout.post.mjs');
const _lazy_cEUnod = () => import('../routes/api/auth/signup.post.mjs');
const _lazy_RGNhag = () => import('../routes/api/auth/swap.post.mjs');
const _lazy_fvThMr = () => import('../routes/api/bookmarks.get.mjs');
const _lazy_OJCgjk = () => import('../routes/api/bookmarks/toggle.post.mjs');
const _lazy_7fLzVD = () => import('../routes/api/bridge/call.post.mjs');
const _lazy_pUwUCY = () => import('../routes/api/bridge/plugins.get.mjs');
const _lazy_Mf39c8 = () => import('../routes/api/bridge/register.post.mjs');
const _lazy_gYE1KC = () => import('../routes/api/bridge/relay.post.mjs');
const _lazy_UK6mw7 = () => import('../routes/api/bridge/status.get.mjs');
const _lazy_BuRirw = () => import('../routes/api/dm/channels/index.get.mjs');
const _lazy_UBuSTH = () => import('../routes/api/dm/channels/_id/messages/_msgId/edits.get.mjs');
const _lazy_2sbRR_ = () => import('../routes/api/dm/channels/_id/messages/index.patch.mjs');
const _lazy_vyxfZa = () => import('../routes/api/dm/channels/_id/index.get.mjs');
const _lazy_OpjgfJ = () => import('../routes/api/dm/channels/_id/index.post.mjs');
const _lazy_FAJovu = () => import('../routes/api/dm/channels/_id/typing.post.mjs');
const _lazy_MkQhC1 = () => import('../routes/api/dm/channels/_id/voice/join.post.mjs');
const _lazy_PwVI7m = () => import('../routes/api/dm/channels/_id/voice/leave.post.mjs');
const _lazy_mapETz = () => import('../routes/api/dm/channels/_id/voice/signal.post.mjs');
const _lazy_5ZKb5V = () => import('../routes/api/dm/index.get.mjs');
const _lazy_fmQsl9 = () => import('../routes/api/dm/index.post.mjs');
const _lazy_OBe9pB = () => import('../routes/api/emojis/_id_.delete.mjs');
const _lazy_Y_9uBM = () => import('../routes/api/index.get.mjs');
const _lazy_OmWmKJ = () => import('../routes/api/index.post.mjs');
const _lazy_E0BGZq = () => import('../routes/api/events.get.mjs');
const _lazy_290wMB = () => import('../routes/api/invites/_code_.get.mjs');
const _lazy_qb04wh = () => import('../routes/api/index2.get.mjs');
const _lazy_ijhGNY = () => import('../routes/api/playlists/_id_.delete.mjs');
const _lazy_Won0vF = () => import('../routes/api/playlists/_id_.get.mjs');
const _lazy_26g2Qb = () => import('../routes/api/playlists/_id_.put.mjs');
const _lazy_nUJ3QJ = () => import('../routes/api/playlists/_id/items.post.mjs');
const _lazy_lxIoJy = () => import('../routes/api/playlists/_id/items/_postId_.delete.mjs');
const _lazy_lq2dft = () => import('../routes/api/index3.get.mjs');
const _lazy_VGlFB8 = () => import('../routes/api/index2.post.mjs');
const _lazy_DYfnWN = () => import('../routes/api/posts/_id_.delete.mjs');
const _lazy__9TRPE = () => import('../routes/api/posts/_id_.get.mjs');
const _lazy_CCtoCW = () => import('../routes/api/posts/_id/index.get.mjs');
const _lazy_BByVUA = () => import('../routes/api/posts/_id/index.post.mjs');
const _lazy_GKOSCJ = () => import('../routes/api/posts/_id/reactions.post.mjs');
const _lazy_i8YfwO = () => import('../routes/api/posts/_id/repost.post.mjs');
const _lazy_vV5C3z = () => import('../routes/api/posts/_id/unrepost.post.mjs');
const _lazy_JbXE83 = () => import('../routes/api/posts/_id/view.post.mjs');
const _lazy_bhxAYL = () => import('../routes/api/index4.get.mjs');
const _lazy_ZvLq_7 = () => import('../routes/api/index3.post.mjs');
const _lazy_wYS2SD = () => import('../routes/api/search.get.mjs');
const _lazy_LX54n5 = () => import('../routes/api/servers/_id/channels/_channelId_.delete.mjs');
const _lazy_soPaMW = () => import('../routes/api/servers/_id/channels/_channelId_.put.mjs');
const _lazy_qYQc5O = () => import('../routes/api/servers/_id/channels/_channelId/index.get.mjs');
const _lazy_KknGU8 = () => import('../routes/api/servers/_id/channels/_channelId/index.post.mjs');
const _lazy_J5wrPb = () => import('../routes/api/servers/_id/channels/_channelId/voice/join.post.mjs');
const _lazy_vglohc = () => import('../routes/api/servers/_id/channels/_channelId/voice/leave.post.mjs');
const _lazy_11cDHR = () => import('../routes/api/servers/_id/channels/_channelId/voice/signal.post.mjs');
const _lazy_ii6jzC = () => import('../routes/api/servers/_id/index.get.mjs');
const _lazy_RJAxi1 = () => import('../routes/api/servers/_id/index.post.mjs');
const _lazy_hihMhu = () => import('../routes/api/servers/index.delete.mjs');
const _lazy_qMAAJe = () => import('../routes/api/servers/index.get.mjs');
const _lazy_vv0njY = () => import('../routes/api/servers/index.put.mjs');
const _lazy_4Dl2_l = () => import('../routes/api/servers/_id/invites/_inviteId_.delete.mjs');
const _lazy_Tcnxlk = () => import('../routes/api/servers/_id/index2.get.mjs');
const _lazy_nRrVel = () => import('../routes/api/servers/_id/index2.post.mjs');
const _lazy_CYzorO = () => import('../routes/api/servers/_id/members/_userId_.delete.mjs');
const _lazy_sSBRoq = () => import('../routes/api/servers/_id/members/_userId_.put.mjs');
const _lazy_5Mz03w = () => import('../routes/api/servers/_id/index3.get.mjs');
const _lazy_xxfq6j = () => import('../routes/api/servers/_id/roles/_roleId_.delete.mjs');
const _lazy_xpvtUv = () => import('../routes/api/servers/_id/roles/_roleId_.put.mjs');
const _lazy_yyQPRK = () => import('../routes/api/servers/_id/index4.get.mjs');
const _lazy_QTsXHA = () => import('../routes/api/servers/_id/index3.post.mjs');
const _lazy_EgaIHo = () => import('../routes/api/index5.get.mjs');
const _lazy_f3CeUG = () => import('../routes/api/index4.post.mjs');
const _lazy_ESwlOb = () => import('../routes/api/servers/join/_code_.post.mjs');
const _lazy_i5vGA9 = () => import('../routes/api/upload.post.mjs');
const _lazy_7C120n = () => import('../routes/api/upload/avatar.post.mjs');
const _lazy_lHcTeJ = () => import('../routes/api/upload/banner.post.mjs');
const _lazy_TS_pLx = () => import('../routes/api/upload/server/_id/banner.post.mjs');
const _lazy_HNzfcE = () => import('../routes/api/upload/server/_id/icon.post.mjs');
const _lazy_7U9KrP = () => import('../routes/api/users/_id/block.delete.mjs');
const _lazy_okqgb8 = () => import('../routes/api/users/_id/block.get.mjs');
const _lazy_njgBQZ = () => import('../routes/api/users/_id/block.post.mjs');
const _lazy_18A5FN = () => import('../routes/api/users/_id/close-friends/delete.delete.mjs');
const _lazy_Ss5uOU = () => import('../routes/api/users/_id/index.get.mjs');
const _lazy_Sqjd8U = () => import('../routes/api/users/_id/close-friends/post.post.mjs');
const _lazy_FbjZ0k = () => import('../routes/api/users/_id/follow.post.mjs');
const _lazy_4FhP50 = () => import('../routes/api/users/_id/followers.get.mjs');
const _lazy_flid6w = () => import('../routes/api/users/_id/following.get.mjs');
const _lazy_EK_dGb = () => import('../routes/api/users/_id/friends/accept.post.mjs');
const _lazy_v_cU3B = () => import('../routes/api/users/_id/index2.get.mjs');
const _lazy_nY53Wr = () => import('../routes/api/users/_id/index.post.mjs');
const _lazy_zH1gNV = () => import('../routes/api/users/_id/posts.get.mjs');
const _lazy_b4_suc = () => import('../routes/api/users/_id/profile.get.mjs');
const _lazy_GWv1K6 = () => import('../routes/api/users/_id/unfollow.post.mjs');
const _lazy_tVoj_y = () => import('../routes/api/users/by-username/_username_.get.mjs');
const _lazy_ujI59b = () => import('../routes/api/users/profile.put.mjs');
const _lazy_QqbEr8 = () => import('../routes/api/users/settings.put.mjs');
const _lazy_oGusIu = () => import('../routes/api/voice/turn.get.mjs');
const _lazy_M98yRQ = () => import('../routes/api/whiteboard/_roomKey_.get.mjs');
const _lazy_iAKSlu = () => import('../routes/api/index5.post.mjs');
const _lazy_1SxWGY = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _MZ_uFB, lazy: false, middleware: true, method: undefined },
  { route: '/api/actions/history', handler: _lazy_QuCQBu, lazy: true, middleware: false, method: "get" },
  { route: '/api/actions/likes', handler: _lazy_frBPBP, lazy: true, middleware: false, method: "get" },
  { route: '/api/actions/reactions', handler: _lazy_6VRmM1, lazy: true, middleware: false, method: "get" },
  { route: '/api/actions/reposts', handler: _lazy_0G3k0h, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/users/:id/badges', handler: _lazy_yNpVEx, lazy: true, middleware: false, method: "put" },
  { route: '/api/auth/github/callback', handler: _lazy_SBl2gv, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/github', handler: _lazy_MVTFyK, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/google/callback', handler: _lazy_sKY4ro, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/google', handler: _lazy_RmWCsP, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/me', handler: _lazy_jcly7m, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/signin', handler: _lazy_4d5WLF, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/signout', handler: _lazy_C71pQm, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/signup', handler: _lazy_cEUnod, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/swap', handler: _lazy_RGNhag, lazy: true, middleware: false, method: "post" },
  { route: '/api/bookmarks', handler: _lazy_fvThMr, lazy: true, middleware: false, method: "get" },
  { route: '/api/bookmarks/toggle', handler: _lazy_OJCgjk, lazy: true, middleware: false, method: "post" },
  { route: '/api/bridge/call', handler: _lazy_7fLzVD, lazy: true, middleware: false, method: "post" },
  { route: '/api/bridge/plugins', handler: _lazy_pUwUCY, lazy: true, middleware: false, method: "get" },
  { route: '/api/bridge/register', handler: _lazy_Mf39c8, lazy: true, middleware: false, method: "post" },
  { route: '/api/bridge/relay', handler: _lazy_gYE1KC, lazy: true, middleware: false, method: "post" },
  { route: '/api/bridge/status', handler: _lazy_UK6mw7, lazy: true, middleware: false, method: "get" },
  { route: '/api/dm/channels/:id', handler: _lazy_BuRirw, lazy: true, middleware: false, method: "get" },
  { route: '/api/dm/channels/:id/messages/:msgId/edits', handler: _lazy_UBuSTH, lazy: true, middleware: false, method: "get" },
  { route: '/api/dm/channels/:id/messages/:msgId', handler: _lazy_2sbRR_, lazy: true, middleware: false, method: "patch" },
  { route: '/api/dm/channels/:id/messages', handler: _lazy_vyxfZa, lazy: true, middleware: false, method: "get" },
  { route: '/api/dm/channels/:id/messages', handler: _lazy_OpjgfJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/dm/channels/:id/typing', handler: _lazy_FAJovu, lazy: true, middleware: false, method: "post" },
  { route: '/api/dm/channels/:id/voice/join', handler: _lazy_MkQhC1, lazy: true, middleware: false, method: "post" },
  { route: '/api/dm/channels/:id/voice/leave', handler: _lazy_PwVI7m, lazy: true, middleware: false, method: "post" },
  { route: '/api/dm/channels/:id/voice/signal', handler: _lazy_mapETz, lazy: true, middleware: false, method: "post" },
  { route: '/api/dm/channels', handler: _lazy_5ZKb5V, lazy: true, middleware: false, method: "get" },
  { route: '/api/dm/channels', handler: _lazy_fmQsl9, lazy: true, middleware: false, method: "post" },
  { route: '/api/emojis/:id', handler: _lazy_OBe9pB, lazy: true, middleware: false, method: "delete" },
  { route: '/api/emojis', handler: _lazy_Y_9uBM, lazy: true, middleware: false, method: "get" },
  { route: '/api/emojis', handler: _lazy_OmWmKJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/events', handler: _lazy_E0BGZq, lazy: true, middleware: false, method: "get" },
  { route: '/api/invites/:code', handler: _lazy_290wMB, lazy: true, middleware: false, method: "get" },
  { route: '/api/notifications', handler: _lazy_qb04wh, lazy: true, middleware: false, method: "get" },
  { route: '/api/playlists/:id', handler: _lazy_ijhGNY, lazy: true, middleware: false, method: "delete" },
  { route: '/api/playlists/:id', handler: _lazy_Won0vF, lazy: true, middleware: false, method: "get" },
  { route: '/api/playlists/:id', handler: _lazy_26g2Qb, lazy: true, middleware: false, method: "put" },
  { route: '/api/playlists/:id/items', handler: _lazy_nUJ3QJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/playlists/:id/items/:postId', handler: _lazy_lxIoJy, lazy: true, middleware: false, method: "delete" },
  { route: '/api/playlists', handler: _lazy_lq2dft, lazy: true, middleware: false, method: "get" },
  { route: '/api/playlists', handler: _lazy_VGlFB8, lazy: true, middleware: false, method: "post" },
  { route: '/api/posts/:id', handler: _lazy_DYfnWN, lazy: true, middleware: false, method: "delete" },
  { route: '/api/posts/:id', handler: _lazy__9TRPE, lazy: true, middleware: false, method: "get" },
  { route: '/api/posts/:id/comments', handler: _lazy_CCtoCW, lazy: true, middleware: false, method: "get" },
  { route: '/api/posts/:id/comments', handler: _lazy_BByVUA, lazy: true, middleware: false, method: "post" },
  { route: '/api/posts/:id/reactions', handler: _lazy_GKOSCJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/posts/:id/repost', handler: _lazy_i8YfwO, lazy: true, middleware: false, method: "post" },
  { route: '/api/posts/:id/unrepost', handler: _lazy_vV5C3z, lazy: true, middleware: false, method: "post" },
  { route: '/api/posts/:id/view', handler: _lazy_JbXE83, lazy: true, middleware: false, method: "post" },
  { route: '/api/posts', handler: _lazy_bhxAYL, lazy: true, middleware: false, method: "get" },
  { route: '/api/posts', handler: _lazy_ZvLq_7, lazy: true, middleware: false, method: "post" },
  { route: '/api/search', handler: _lazy_wYS2SD, lazy: true, middleware: false, method: "get" },
  { route: '/api/servers/:id/channels/:channelId', handler: _lazy_LX54n5, lazy: true, middleware: false, method: "delete" },
  { route: '/api/servers/:id/channels/:channelId', handler: _lazy_soPaMW, lazy: true, middleware: false, method: "put" },
  { route: '/api/servers/:id/channels/:channelId/messages', handler: _lazy_qYQc5O, lazy: true, middleware: false, method: "get" },
  { route: '/api/servers/:id/channels/:channelId/messages', handler: _lazy_KknGU8, lazy: true, middleware: false, method: "post" },
  { route: '/api/servers/:id/channels/:channelId/voice/join', handler: _lazy_J5wrPb, lazy: true, middleware: false, method: "post" },
  { route: '/api/servers/:id/channels/:channelId/voice/leave', handler: _lazy_vglohc, lazy: true, middleware: false, method: "post" },
  { route: '/api/servers/:id/channels/:channelId/voice/signal', handler: _lazy_11cDHR, lazy: true, middleware: false, method: "post" },
  { route: '/api/servers/:id/channels', handler: _lazy_ii6jzC, lazy: true, middleware: false, method: "get" },
  { route: '/api/servers/:id/channels', handler: _lazy_RJAxi1, lazy: true, middleware: false, method: "post" },
  { route: '/api/servers/:id', handler: _lazy_hihMhu, lazy: true, middleware: false, method: "delete" },
  { route: '/api/servers/:id', handler: _lazy_qMAAJe, lazy: true, middleware: false, method: "get" },
  { route: '/api/servers/:id', handler: _lazy_vv0njY, lazy: true, middleware: false, method: "put" },
  { route: '/api/servers/:id/invites/:inviteId', handler: _lazy_4Dl2_l, lazy: true, middleware: false, method: "delete" },
  { route: '/api/servers/:id/invites', handler: _lazy_Tcnxlk, lazy: true, middleware: false, method: "get" },
  { route: '/api/servers/:id/invites', handler: _lazy_nRrVel, lazy: true, middleware: false, method: "post" },
  { route: '/api/servers/:id/members/:userId', handler: _lazy_CYzorO, lazy: true, middleware: false, method: "delete" },
  { route: '/api/servers/:id/members/:userId', handler: _lazy_sSBRoq, lazy: true, middleware: false, method: "put" },
  { route: '/api/servers/:id/members', handler: _lazy_5Mz03w, lazy: true, middleware: false, method: "get" },
  { route: '/api/servers/:id/roles/:roleId', handler: _lazy_xxfq6j, lazy: true, middleware: false, method: "delete" },
  { route: '/api/servers/:id/roles/:roleId', handler: _lazy_xpvtUv, lazy: true, middleware: false, method: "put" },
  { route: '/api/servers/:id/roles', handler: _lazy_yyQPRK, lazy: true, middleware: false, method: "get" },
  { route: '/api/servers/:id/roles', handler: _lazy_QTsXHA, lazy: true, middleware: false, method: "post" },
  { route: '/api/servers', handler: _lazy_EgaIHo, lazy: true, middleware: false, method: "get" },
  { route: '/api/servers', handler: _lazy_f3CeUG, lazy: true, middleware: false, method: "post" },
  { route: '/api/servers/join/:code', handler: _lazy_ESwlOb, lazy: true, middleware: false, method: "post" },
  { route: '/api/upload', handler: _lazy_i5vGA9, lazy: true, middleware: false, method: "post" },
  { route: '/api/upload/avatar', handler: _lazy_7C120n, lazy: true, middleware: false, method: "post" },
  { route: '/api/upload/banner', handler: _lazy_lHcTeJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/upload/server/:id/banner', handler: _lazy_TS_pLx, lazy: true, middleware: false, method: "post" },
  { route: '/api/upload/server/:id/icon', handler: _lazy_HNzfcE, lazy: true, middleware: false, method: "post" },
  { route: '/api/users/:id/block', handler: _lazy_7U9KrP, lazy: true, middleware: false, method: "delete" },
  { route: '/api/users/:id/block', handler: _lazy_okqgb8, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/:id/block', handler: _lazy_njgBQZ, lazy: true, middleware: false, method: "post" },
  { route: '/api/users/:id/close-friends/delete', handler: _lazy_18A5FN, lazy: true, middleware: false, method: "delete" },
  { route: '/api/users/:id/close-friends', handler: _lazy_Ss5uOU, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/:id/close-friends/post', handler: _lazy_Sqjd8U, lazy: true, middleware: false, method: "post" },
  { route: '/api/users/:id/follow', handler: _lazy_FbjZ0k, lazy: true, middleware: false, method: "post" },
  { route: '/api/users/:id/followers', handler: _lazy_4FhP50, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/:id/following', handler: _lazy_flid6w, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/:id/friends/accept', handler: _lazy_EK_dGb, lazy: true, middleware: false, method: "post" },
  { route: '/api/users/:id/friends', handler: _lazy_v_cU3B, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/:id/friends', handler: _lazy_nY53Wr, lazy: true, middleware: false, method: "post" },
  { route: '/api/users/:id/posts', handler: _lazy_zH1gNV, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/:id/profile', handler: _lazy_b4_suc, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/:id/unfollow', handler: _lazy_GWv1K6, lazy: true, middleware: false, method: "post" },
  { route: '/api/users/by-username/:username', handler: _lazy_tVoj_y, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/profile', handler: _lazy_ujI59b, lazy: true, middleware: false, method: "put" },
  { route: '/api/users/settings', handler: _lazy_QqbEr8, lazy: true, middleware: false, method: "put" },
  { route: '/api/voice/turn', handler: _lazy_oGusIu, lazy: true, middleware: false, method: "get" },
  { route: '/api/whiteboard/:roomKey', handler: _lazy_M98yRQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/whiteboard', handler: _lazy_iAKSlu, lazy: true, middleware: false, method: "post" },
  { route: '/__nuxt_error', handler: _lazy_1SxWGY, lazy: true, middleware: false, method: undefined },
  { route: '/api/_nuxt_icon/:collection', handler: _riGxUK, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_1SxWGY, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp = createNitroApp();
function useNitroApp() {
  return nitroApp;
}
runNitroPlugins(nitroApp);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

export { validateMessageContent as $, setClientTokenCookie as A, sendRedirect as B, getRequestProtocol as C, getRequestHost as D, getCurrentUser as E, renewAuthCookie as F, enrichUsers as G, verifyPassword as H, clearAuthCookie as I, hashPassword as J, verifyToken as K, clearClientTokenCookie as L, bookmarks as M, phpBridgeConfig as N, phpCall as O, registerNuxtSelf as P, nuxtPluginInfo as Q, getPlugins as R, registerPlugin as S, hasPlugin as T, broadcast as U, dmChannelMembers as V, dmChannels as W, dmMessages as X, pickPublicSummary as Y, getBlockRelation as Z, dmMessageEdits as _, trapUnhandledNodeErrors as a, klona as a$, publicUser as a0, broadcastToUsers as a1, checkMessageFlood as a2, hasBlockEitherWay as a3, joinRoom as a4, leaveRoom as a5, isInRoom as a6, relaySignal as a7, customEmojis as a8, urlToFilePath as a9, serverRoles as aA, ALL_PERMISSIONS_MASK as aB, validateFile as aC, saveFile as aD, saveAvatar as aE, ensureDir as aF, saveCover as aG, userBlocks as aH, whiteboardStates as aI, encodePath as aJ, buildAssetsURL as aK, publicAssetsURL as aL, defineRenderHandler as aM, getRouteRules as aN, relative as aO, joinURL as aP, getResponseStatusText as aQ, getResponseStatus as aR, hasProtocol as aS, isScriptProtocol as aT, withQuery as aU, sanitizeStatusCode as aV, parseURL as aW, decodePath as aX, $fetch$1 as aY, baseURL as aZ, defu as a_, readMultipartFormData as aa, validateEmojiFile as ab, saveEmoji as ac, createEventStream as ad, subscribeRealtime as ae, unsubscribeRealtime as af, serverInvites as ag, servers as ah, serverMembers as ai, postComments as aj, follows as ak, friends as al, playlists as am, playlistItems as an, postAttachments as ao, parseAttachments as ap, normalizeAttachments as aq, emit as ar, isServerMember as as, closeFriends as at, serverChannels as au, saveFileWithWatermark as av, requireServerPermission as aw, PERMISSIONS as ax, requireServerMember as ay, channelMessages as az, useNitroApp as b, hash$1 as b0, defuFn as b1, getRequestHeaders as b2, parseQuery as b3, withTrailingSlash as b4, withoutTrailingSlash as b5, defineEventHandler as c, destr as d, db as e, posts as f, getQuery as g, serializePosts as h, postReactions as i, reposts as j, getHeader as k, likes as l, createError$1 as m, getRouterParam as n, users as o, postViews as p, readBody as q, requireAuth as r, setupGracefulShutdown as s, toNodeListener as t, useRuntimeConfig as u, userBadges as v, initDb as w, accounts as x, createSession as y, setAuthCookie as z };
//# sourceMappingURL=nitro.mjs.map
