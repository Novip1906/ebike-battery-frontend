import { resolve } from 'path'

import { generateApi } from 'swagger-typescript-api'

generateApi({
  fileName: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  url: 'http://localhost:8080/swagger/doc.json',
  httpClientType: 'axios',
})
