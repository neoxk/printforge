import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getProductOptionsHandler,
  getProductConfigurationHandler,
  listProductsHandler,
  saveProductConfigurationHandler,
  listContainersHandler,
  getContainerHandler,
  createContainerHandler,
  updateContainerHandler,
  deleteContainerHandler,
  listContainerItemsHandler,
  addItemToContainerHandler,
  removeItemFromContainerHandler,
  patchContainerItemHandler,
} from './products.controller.js'
import {
  productIdParam,
  productConfigBody,
  containerIdParams,
  containerItemParams,
  createContainerBody,
  updateContainerBody,
  addContainerItemBody,
  patchContainerItemBody,
} from './products.schema.js'

export async function productsRoutes(app: FastifyInstance) {
  // Public — called by the configurator iframe
  app.get('/:id/options', { schema: { params: productIdParam } }, getProductOptionsHandler)

  // Admin product routes
  app.get('/', { preHandler: authenticate }, listProductsHandler)
  app.get('/:id/config', { preHandler: authenticate, schema: { params: productIdParam } }, getProductConfigurationHandler)
  app.put(
    '/:id/config',
    { preHandler: authenticate, schema: { params: productIdParam, body: productConfigBody } },
    saveProductConfigurationHandler,
  )

  // Containers
  app.get('/:id/containers', { preHandler: authenticate, schema: { params: productIdParam } }, listContainersHandler)
  app.post('/:id/containers', { preHandler: authenticate, schema: { params: productIdParam, body: createContainerBody } }, createContainerHandler)
  app.get('/:id/containers/:cid', { preHandler: authenticate, schema: { params: containerIdParams } }, getContainerHandler)
  app.put('/:id/containers/:cid', { preHandler: authenticate, schema: { params: containerIdParams, body: updateContainerBody } }, updateContainerHandler)
  app.delete('/:id/containers/:cid', { preHandler: authenticate, schema: { params: containerIdParams } }, deleteContainerHandler)

  // Container items
  app.get('/:id/containers/:cid/items', { preHandler: authenticate, schema: { params: containerIdParams } }, listContainerItemsHandler)
  app.post('/:id/containers/:cid/items', { preHandler: authenticate, schema: { params: containerIdParams, body: addContainerItemBody } }, addItemToContainerHandler)
  app.delete('/:id/containers/:cid/items/:itemId', { preHandler: authenticate, schema: { params: containerItemParams } }, removeItemFromContainerHandler)
  app.patch('/:id/containers/:cid/items/:itemId', { preHandler: authenticate, schema: { params: containerItemParams, body: patchContainerItemBody } }, patchContainerItemHandler)
}
