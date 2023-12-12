// @ts-ignore
import { waitFor } from '../_utils/tests/waitFor'
import { NewPrismaClient } from '../_utils/types'
import testMatrix from './_matrix'
import type { Prisma, PrismaClient } from './node_modules/@prisma/client'

declare let newPrismaClient: NewPrismaClient<typeof PrismaClient>

const TIMEOUT = 60_000

testMatrix.setupTestSuite(
  () => {
    test(
      'should log warn when spawning too many instances of PrismaClient',
      async () => {
        const warnLogs: Prisma.LogEvent[] = []

        for (let i = 0; i < 15; i++) {
          const client = newPrismaClient()
          client.$on('warn', (event) => warnLogs.push(event))
          await client.$connect()
        }

        await waitFor(() => {
          expect(warnLogs.map(({ message }) => message)).toContain(
            'This is the 10th instance of Prisma Client being started. Make sure this is intentional.',
          )
        })
      },
      TIMEOUT,
    )
  },
  {
    skipDataProxy: {
      runtimes: ['node', 'edge'],
      reason: '"Too many instances" warning is not implemented for Data Proxy client',
    },
  },
)
