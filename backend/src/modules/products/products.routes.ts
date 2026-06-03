import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  listProductsHandler,
  updateProductHandler,
  getProductPrintAreasHandler,
  saveProductPrintAreasHandler,
  getProductConfigHandler,
  listContainersHandler,
  getContainerHandler,
  createContainerHandler,
  updateContainerHandler,
  deleteContainerHandler,
  listContainerItemsHandler,
  addItemToContainerHandler,
  removeItemFromContainerHandler,
  patchContainerItemHandler,
  getProductConfigByWooIdHandler,
  getProductPrintAreasByWooIdHandler,
} from './products.controller.js'
import {
  productIdParam,
  wooProductIdParam,
  containerIdParams,
  containerItemParams,
  createContainerBody,
  updateContainerBody,
  addContainerItemBody,
  patchContainerItemBody,
  updateProductBody,
  savePrintAreasBody,
} from './products.schema.js'

export async function productsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: authenticate }, listProductsHandler)
  app.patch('/:id', { preHandler: authenticate, schema: { params: productIdParam, body: updateProductBody } }, updateProductHandler)
  app.get('/woo/:wooProductId/print-areas', { schema: { params: wooProductIdParam } }, getProductPrintAreasByWooIdHandler)
  app.get('/woo/:wooProductId/config', { schema: { params: wooProductIdParam } }, getProductConfigByWooIdHandler)
  app.get('/:id/print-areas', { schema: { params: productIdParam } }, getProductPrintAreasHandler)
  app.put('/:id/print-areas', { preHandler: authenticate, schema: { params: productIdParam, body: savePrintAreasBody } }, saveProductPrintAreasHandler)
  app.get('/:id/config', { schema: { params: productIdParam } }, getProductConfigHandler)

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
