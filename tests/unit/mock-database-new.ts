import { createMockPrismaClient } from './prisma-mock-adapter'

export const createMockDB = () => {
    // Create a mock DB object with the Prisma client attached
    const mockDb: any = {
        __mockPrisma: createMockPrismaClient(),
    }

    return mockDb
}
