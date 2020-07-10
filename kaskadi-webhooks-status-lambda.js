const es = require('aws-es-client')({
  id: process.env.ES_ID,
  token: process.env.ES_SECRET,
  url: 'https://search-kaskadi-cl2e6mhgx3zc7ay2e5kkhjet4u.eu-central-1.es.amazonaws.com'
})

const token = process.env.YSWS_TOKEN

module.exports.handler = async (event) => {
  const eventBody = JSON.parse(event.body)
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Webhook data received!'
    })
  }
  if (eventBody.token !== token) {
    const logData = {
      error_type: 'unauthorized',
      origin: event.headers.origin,
      origin_country: event.headers['CloudFront-Viewer-Country']
    }
    console.log(logData)
    await esLog(logData, 'error')
    response.statusCode = 401
    response.body = JSON.stringify({
      message: 'Unauthorized.'
    })
    return response
  }
  console.log(event.body)
  await esLog(eventBody, 'status')
  await updateOrderStatus(eventBody)
  return response
}

async function esLog(data, type) {
  const timestamp = Date.now()
  const timestampHex = timestamp.toString(16)
  const logDocId = `${timestampHex[0]}-${timestampHex.substr(1, 5)}-${timestampHex.substr(5, 5)}`
  await es.index({
    id: logDocId,
    index: 'ysws-logs',
    body: {
      type,
      date: timestamp,
      ...data
    }
  })
}

async function updateOrderStatus(eventBody) {
  await es.update({
    id: eventBody.eventData.externalId,
    index: 'ysws-orders',
    body: {
      doc: {
        kaskadiMeta: {
          orderStatus: eventBody.eventData.statusName,
          lastModified: Date.now()
        }
      }
    }
  })
}
