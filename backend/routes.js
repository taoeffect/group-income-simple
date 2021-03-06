/* globals logger */

import {RESPONSE_TYPE} from '../shared/constants'
import {makeResponse} from '../shared/functions'
import * as Events from '../shared/events'
import * as db from './database'
const Boom = require('boom')
const Joi = require('joi')

// NOTE: We could get rid of this RESTful API and just rely on pubsub.js to do this
//       —BUT HTTP2 might be better than websockets and so we keep this around.
//       See related TODO in pubsub.js and the reddit discussion link.
module.exports = function (server: Object) {
  server.route({
    path: '/event/{contractId}',
    method: ['PUT', 'POST'],
    config: {
      auth: 'gi-auth',
      validate: { payload: {
        hash: Joi.string().required(),
        // must match db.Log.jsonSchema.properties (except for separated hash)
        entry: Joi.object({
          version: Joi.number().integer().required(),
          type: Joi.string().required(),
          parentHash: Joi.string().allow([null, '']),
          data: Joi.object()
        })
      } }
    },
    // TODO: we have to prevent spam. can't have someone flooding the server.
    //       do group signature based authentication here to prevent spam
    handler: async function (request, reply) {
      try {
        // TODO: echo back the entry if it's the latest, or send with a different
        //       status code the entries that the client is missing
        //       or, send back an error if the parentHash doesn't exist
        //       in the database at all. (or an error if hash is invalid)
        var contractId = request.params.contractId
        var {hash, entry} = request.payload
        var event = Events[entry.type].fromObject(entry, hash)
        await server.handleEvent(contractId, event)
        reply(makeResponse(RESPONSE_TYPE.SUCCESS, {hash}))
      } catch (err) {
        logger(err)
        reply(err)
      }
    }
  })
  server.route({
    path: '/events/{contractId}/{since}',
    method: ['GET'],
    handler: async function (request, reply) {
      try {
        const {contractId, since} = request.params
        var stream = await db.streamEntriesSince(contractId, since)
        // "On an HTTP server, make sure to manually close your streams if a request is aborted."
        // From: http://knexjs.org/#Interfaces-Streams
        //       https://github.com/tgriesser/knex/wiki/Manually-Closing-Streams
        // Plus: https://hapijs.com/api#request-events
        request.on('disconnect', stream.end.bind(stream))
        reply(stream)
      } catch (err) {
        logger(err)
        reply(err)
      }
    }
  })
  server.route({
    path: '/name',
    method: ['POST'],
    config: { validate: { payload: {
      name: Joi.string().required(),
      value: Joi.string().required()
    } } },
    handler: async function (request, reply) {
      try {
        const {name, value} = request.payload
        if (await db.lookupName(name)) {
          reply(Boom.conflict('exists'))
        } else {
          await db.registerName(name, value)
          reply(makeResponse(RESPONSE_TYPE.SUCCESS, {name}))
        }
      } catch (err) {
        logger(err)
        reply(err)
      }
    }
  })
  server.route({
    path: '/name/{name}',
    method: ['GET'],
    handler: async function (request, reply) {
      try {
        var value = await db.lookupName(request.params.name)
        reply(value ? makeResponse(RESPONSE_TYPE.SUCCESS, {value}) : Boom.notFound())
      } catch (err) {
        logger(err)
        reply(err)
      }
    }
  })
  server.route({
    path: '/latestHash/{contractId}',
    method: ['GET'],
    handler: async function (request, reply) {
      try {
        var entry = await db.lastEntry(request.params.contractId)
        reply(entry ? makeResponse(RESPONSE_TYPE.SUCCESS, {hash: entry.hash}) : Boom.notFound())
      } catch (err) {
        logger(err)
        reply(err)
      }
    }
  })
}
