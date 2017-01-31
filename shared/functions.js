import multihash from 'multihashes'
const blake = require('blakejs')
const Primus = require('primus')
const path = require('path')
const nacl = require('tweetnacl')

import {RESPONSE_TYPE} from './constants'
import type {
  JSONType, JSONObject, Response, Entry, ResType, EntryType, Group
} from './types'

export function toHash (value: JSONObject | Entry | string): string {
  // TODO: use safe/guaranteed JSON encoding? https://github.com/primus/ejson
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  // TODO: this doesn't seem correct.
  value = blake.blake2bHex(value)
  var buff = multihash.encode(Buffer.from(value, 'hex'), 'blake2b')
  return multihash.toB58String(buff)
}

export function makeResponse (
  type: ResType,
  data: JSONType,
  err?: string | {message: string}
): Response {
  //   // This type wrangling voodoo comes courtesy of: https://github.com/facebook/flow/issues/3041#issuecomment-268027891
  if (type === RESPONSE_TYPE.ERROR) {
    return err
    ? {type, data, err: typeof err === 'string' ? err : err.message}
    : {type, err: String(data)}
  }
  return {type, data}
}

export function makeEntry (
  type: EntryType,
  data: JSONObject,
  parentHash: string | null,
  version?: string = '0.0.1'
): Entry {
  return {type, version, parentHash, data}
}

export function makeGroup (
  groupName: string,
  sharedValues: string,
  changePercentage: number,
  openMembership: boolean,
  memberApprovalPercentage: number,
  memberRemovalPercentage: number,
  contributionPrivacy: string,
  founderHashKey: string
) : Group {
  return {
    creationDate: 'now', // new Date().toISOString(),
    groupName,
    sharedValues,
    changePercentage,
    openMembership,
    memberApprovalPercentage,
    memberRemovalPercentage,
    contributionPrivacy,
    founderHashKey
  }
}

// generate and save primus client file
// https://github.com/primus/primus#client-library
export function setupPrimus (server: Object, saveAndDestroy: boolean = false) {
  var primus = new Primus(server, {
    transformer: 'uws',
    rooms: {wildcard: false}
  })
  primus.plugin('rooms', require('primus-rooms'))
  primus.plugin('responder', require('primus-responder'))
  if (saveAndDestroy) {
    primus.save(path.join(__dirname, '../frontend/simple/assets/vendor/primus.js'))
    primus.destroy()
  }
  return primus
}

var b642buf = b64 => Buffer.from(b64, 'base64')
// var b642str = b64 => b642buf(b64).toString('utf8')
// var buf2b64 = buf => Buffer.from(buf).toString('base64')
var str2buf = str => Buffer.from(str, 'utf8')
var str2b64 = str => str2buf(str).toString('base64')
var ary2b64 = ary => Buffer.from(ary).toString('base64')

export function sign (
  {publicKey, secretKey}: {publicKey: string, secretKey: string},
  futz: string = '',
  msg: string = 'hello!'
) {
  return str2b64(JSON.stringify({
    msg: msg + futz,
    key: publicKey,
    sig: ary2b64(nacl.sign.detached(str2buf(msg), b642buf(secretKey)))
  }))
}

export function verify (
  {msg, key, sig}: {msg: string, key: string, sig: string}
) {
  return nacl.sign.detached.verify(str2buf(msg), b642buf(sig), b642buf(key))
}
